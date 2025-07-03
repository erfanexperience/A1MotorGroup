const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const { pool, s3 } = require('./db');

const app = express();
const port = process.env.PORT || 5001;

// Initialize Cars directory
const initCarsDirectory = async () => {
  const carsDir = path.join(__dirname, '../../Cars');
  try {
    await fs.access(carsDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(carsDir);
      console.log('Created Cars directory');
    }
  }
};

// Initialize on startup
initCarsDirectory().catch(console.error);

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const tempUploadDir = path.join(__dirname, '../../Cars/tmp');

// Ensure temp upload directory exists
fs.mkdir(tempUploadDir, { recursive: true }).catch(() => {});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    // Try to get VIN from request body (for POST/PUT with FormData)
    let vin = undefined;
    try {
      if (req.body && req.body.vehicleData) {
        const data = JSON.parse(req.body.vehicleData);
        vin = data.vin;
      }
    } catch (e) {}
    if (file.fieldname === 'carfax') {
      if (vin) {
        cb(null, `${vin}-Carfax.pdf`);
      } else {
      cb(null, `carfax${path.extname(file.originalname)}`);
      }
    } else if (file.fieldname === 'windowSticker') {
      if (vin) {
        cb(null, `${vin}-WindowSticker.pdf`);
      } else {
      cb(null, `window-sticker${path.extname(file.originalname)}`);
      }
    } else {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Add error handling middleware for Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      console.error('Unexpected field:', err.field);
      return res.status(400).json({ error: `Unexpected field: ${err.field}` });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

// Get vehicle by VIN
app.get('/api/vehicles/:vin', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE vin = $1', [req.params.vin]);
    if (result.rows.length === 0) {
      return res.status(404).json({ exists: false });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Helper to upload a file buffer to S3
async function uploadToS3(buffer, key, mimetype) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  };
  const data = await s3.upload(params).promise();
  return data.Location;
}

// Add new vehicle
app.post('/api/vehicles', upload.any(), async (req, res) => {
  try {
    if (!req.body.vehicleData) {
      return res.status(400).json({ error: 'No vehicle data provided' });
    }
    const vehicleData = JSON.parse(req.body.vehicleData);
    if (!vehicleData.vin || !vehicleData.make || !vehicleData.model) {
      return res.status(400).json({ error: 'Missing required vehicle information' });
    }
    const folderName = `${vehicleData.vin}-${vehicleData.make}-${vehicleData.model}`;
    vehicleData.images = [];
    vehicleData.certificates = {};
    let carfaxUrl = null;
    let windowStickerUrl = null;
    for (const file of req.files || []) {
      let s3Key;
      if (file.fieldname === 'images') {
        s3Key = `${folderName}/images/${file.filename}`;
        const url = await uploadToS3(await fs.readFile(file.path), s3Key, file.mimetype);
        vehicleData.images.push({ filename: file.filename, url });
        await fs.unlink(file.path);
      } else if (file.fieldname === 'carfax') {
        s3Key = `${folderName}/certificates/carfax.pdf`;
        carfaxUrl = await uploadToS3(await fs.readFile(file.path), s3Key, file.mimetype);
        await fs.unlink(file.path);
      } else if (file.fieldname === 'windowSticker') {
        s3Key = `${folderName}/certificates/window-sticker.pdf`;
        windowStickerUrl = await uploadToS3(await fs.readFile(file.path), s3Key, file.mimetype);
        await fs.unlink(file.path);
      }
    }
    if (carfaxUrl) vehicleData.certificates.carfax = carfaxUrl;
    if (windowStickerUrl) vehicleData.certificates.windowSticker = windowStickerUrl;
    // Insert into PostgreSQL (same as before, but now URLs are S3 URLs)
    const insertQuery = `
      INSERT INTO vehicles (
        vin, make, model, model_year, price, sales_price, condition, body, transmission, fuel_type, engine, drive, mileage, exterior_color, interior_color, stock_number, description, features, certificates, images
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *;
    `;
    const values = [
      vehicleData.vin,
      vehicleData.make,
      vehicleData.model,
      vehicleData.modelYear || vehicleData.year || null,
      vehicleData.pricing?.price || null,
      vehicleData.pricing?.salesPrice || null,
      vehicleData.condition || null,
      vehicleData.body || null,
      vehicleData.engine?.transmission || vehicleData.transmission || null,
      vehicleData.engine?.fuelType || vehicleData.fuelType || null,
      vehicleData.engine ? JSON.stringify(vehicleData.engine) : null,
      vehicleData.engine?.drive || vehicleData.driveType || vehicleData.drivetrain || null,
      vehicleData.mileage || null,
      vehicleData.exterior?.color || vehicleData.exteriorColor || vehicleData.color || null,
      vehicleData.interior?.color || vehicleData.interiorColor || null,
      vehicleData.stockNumber || null,
      vehicleData.description || null,
      vehicleData.features ? JSON.stringify(vehicleData.features) : null,
      vehicleData.certificates ? JSON.stringify(vehicleData.certificates) : null,
      vehicleData.images ? JSON.stringify(vehicleData.images) : null
    ];
    const result = await pool.query(insertQuery, values);
    res.status(201).json({ message: 'Vehicle added successfully', vehicle: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vehicle
app.put('/api/vehicles', upload.any(), async (req, res) => {
  try {
    if (!req.body.vehicleData) {
      return res.status(400).json({ error: 'No vehicle data provided' });
    }
    const vehicleData = JSON.parse(req.body.vehicleData);
    if (!vehicleData.vin || !vehicleData.make || !vehicleData.model) {
      return res.status(400).json({ error: 'Missing required vehicle information' });
    }
    const folderName = `${vehicleData.vin}-${vehicleData.make}-${vehicleData.model}`;
    let carfaxUrl = null;
    let windowStickerUrl = null;
    let newImages = [];
    for (const file of req.files || []) {
      let s3Key;
      if (file.fieldname === 'images') {
        s3Key = `${folderName}/images/${file.filename}`;
        const url = await uploadToS3(await fs.readFile(file.path), s3Key, file.mimetype);
        newImages.push({ filename: file.filename, url });
        await fs.unlink(file.path);
      } else if (file.fieldname === 'carfax') {
        s3Key = `${folderName}/certificates/carfax.pdf`;
        carfaxUrl = await uploadToS3(await fs.readFile(file.path), s3Key, file.mimetype);
        await fs.unlink(file.path);
      } else if (file.fieldname === 'windowSticker') {
        s3Key = `${folderName}/certificates/window-sticker.pdf`;
        windowStickerUrl = await uploadToS3(await fs.readFile(file.path), s3Key, file.mimetype);
        await fs.unlink(file.path);
      }
      }
    // Merge new images with existing images (if any)
    let images = vehicleData.images || [];
    if (newImages.length > 0) {
      images = [...images, ...newImages];
    }
    // Update certificates
    let certificates = vehicleData.certificates || {};
    if (carfaxUrl) certificates.carfax = carfaxUrl;
    if (windowStickerUrl) certificates.windowSticker = windowStickerUrl;
    // Update in PostgreSQL
    const updateQuery = `
      UPDATE vehicles SET
        make = $1,
        model = $2,
        model_year = $3,
        price = $4,
        sales_price = $5,
        condition = $6,
        body = $7,
        transmission = $8,
        fuel_type = $9,
        engine = $10,
        drive = $11,
        mileage = $12,
        exterior_color = $13,
        interior_color = $14,
        stock_number = $15,
        description = $16,
        features = $17,
        certificates = $18,
        images = $19,
        updated_at = NOW()
      WHERE vin = $20
      RETURNING *;
    `;
    const values = [
      vehicleData.make,
      vehicleData.model,
      vehicleData.modelYear || vehicleData.year || null,
      vehicleData.pricing?.price || null,
      vehicleData.pricing?.salesPrice || null,
      vehicleData.condition || null,
      vehicleData.body || null,
      vehicleData.engine?.transmission || vehicleData.transmission || null,
      vehicleData.engine?.fuelType || vehicleData.fuelType || null,
      vehicleData.engine ? JSON.stringify(vehicleData.engine) : null,
      vehicleData.engine?.drive || vehicleData.driveType || vehicleData.drivetrain || null,
      vehicleData.mileage || null,
      vehicleData.exterior?.color || vehicleData.exteriorColor || vehicleData.color || null,
      vehicleData.interior?.color || vehicleData.interiorColor || null,
      vehicleData.stockNumber || null,
      vehicleData.description || null,
      vehicleData.features ? JSON.stringify(vehicleData.features) : null,
      certificates ? JSON.stringify(certificates) : null,
      images ? JSON.stringify(images) : null,
      vehicleData.vin
    ];
    const result = await pool.query(updateQuery, values);
    res.status(200).json({ message: 'Vehicle updated successfully', vehicle: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete vehicle
app.delete('/api/vehicles/:vin', async (req, res) => {
  try {
    // Optionally, delete files from filesystem here if you want
    await pool.query('DELETE FROM vehicles WHERE vin = $1', [req.params.vin]);
      res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all vehicles
app.delete('/api/vehicles', async (req, res) => {
  try {
    const carsDir = path.join(__dirname, '../../Cars');
    await fs.rm(carsDir, { recursive: true, force: true });
    await fs.mkdir(carsDir);
    res.json({ message: 'All vehicles deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files
app.use('/api/images', express.static(path.join(__dirname, '../../Cars')));

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../../build')));

// Explicitly serve manifest and icons
app.get(['/manifest.json', '/favicon.ico', '/logo192.png', '/logo512.png', '/asset-manifest.json', '/robots.txt'], (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', req.path));
});

// Catch-all: send back React's index.html for any non-API, non-static route
app.get(/^\/(?!api|static|manifest\.json|favicon\.ico|logo192\.png|logo512\.png|asset-manifest\.json|robots\.txt).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

// Robust error logging for unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for http://localhost:3001`);
}); 