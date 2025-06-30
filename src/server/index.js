const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const mysql = require('mysql2/promise');

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

async function getDbConnection() {
  return await mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    database: process.env.MYSQLDATABASE,
    password: process.env.MYSQLPASSWORD,
    port: process.env.MYSQLPORT
  });
}

// Check if vehicle exists
app.get('/api/vehicles/:vin', async (req, res) => {
  try {
    const db = await getDbConnection();
    const [rows] = await db.execute('SELECT * FROM vehicles WHERE vin = ?', [req.params.vin]);
    await db.end();
    if (rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const db = await getDbConnection();
    const [rows] = await db.execute('SELECT * FROM vehicles');
    await db.end();
    // Parse JSON columns
    const vehicles = rows.map(row => ({
      ...row,
      features: row.features ? JSON.parse(row.features) : [],
      images: row.images ? JSON.parse(row.images) : [],
      certificates: row.certificates ? JSON.parse(row.certificates) : {},
      additionalFeatures: row.additionalFeatures ? JSON.parse(row.additionalFeatures) : [],
      safety: row.safety ? JSON.parse(row.safety) : [],
      deletedImages: row.deletedImages ? JSON.parse(row.deletedImages) : []
    }));
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    // Handle images/certificates uploads
    vehicleData.images = vehicleData.images || [];
    vehicleData.certificates = vehicleData.certificates || {};
    for (const file of req.files || []) {
      if (file.fieldname === 'images') {
        vehicleData.images.push({ filename: file.filename, path: `/api/images/${file.filename}` });
      } else if (file.fieldname === 'carfax') {
        vehicleData.certificates.carfax = `/api/images/${file.filename}`;
      } else if (file.fieldname === 'windowSticker') {
        vehicleData.certificates.windowSticker = `/api/images/${file.filename}`;
      }
    }
    // Insert into MySQL
    const db = await getDbConnection();
    await db.execute(
      `INSERT INTO vehicles (
        vin, stockNumber, make, model, modelYear, body, description, features, engine_type, engine_transmission, engine_drive, engine_fuelType, engine_cylinders, engine_displacement, exterior_color, interior_color, mileage, vehicle_condition, price, salesPrice, financingPerMonth, images, certificates, additionalFeatures, safety, deletedImages
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicleData.vin,
        vehicleData.stockNumber || '',
        vehicleData.make || '',
        vehicleData.model || '',
        vehicleData.modelYear || '',
        vehicleData.body || '',
        vehicleData.description || '',
        JSON.stringify(vehicleData.features || []),
        vehicleData.engine?.type || '',
        vehicleData.engine?.transmission || '',
        vehicleData.engine?.drive || '',
        vehicleData.engine?.fuelType || '',
        vehicleData.engine?.cylinders || '',
        vehicleData.engine?.displacement || '',
        vehicleData.exterior?.color || '',
        vehicleData.interior?.color || '',
        vehicleData.mileage || '',
        vehicleData.condition || '',
        vehicleData.pricing?.price || '',
        vehicleData.pricing?.salesPrice || '',
        vehicleData.pricing?.financingPerMonth || '',
        JSON.stringify(vehicleData.images || []),
        JSON.stringify(vehicleData.certificates || {}),
        JSON.stringify(vehicleData.additionalFeatures || []),
        JSON.stringify(vehicleData.safety || []),
        JSON.stringify(vehicleData.deletedImages || [])
      ]
    );
    await db.end();
    res.status(201).json({ message: 'Vehicle added successfully', vehicle: vehicleData });
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
    // Handle images/certificates uploads
    vehicleData.images = vehicleData.images || [];
    vehicleData.certificates = vehicleData.certificates || {};
    for (const file of req.files || []) {
      if (file.fieldname === 'images') {
        vehicleData.images.push({ filename: file.filename, path: `/api/images/${file.filename}` });
      } else if (file.fieldname === 'carfax') {
        vehicleData.certificates.carfax = `/api/images/${file.filename}`;
      } else if (file.fieldname === 'windowSticker') {
        vehicleData.certificates.windowSticker = `/api/images/${file.filename}`;
      }
    }
    // Update in MySQL
    const db = await getDbConnection();
    await db.execute(
      `UPDATE vehicles SET
        stockNumber=?, make=?, model=?, modelYear=?, body=?, description=?, features=?, engine_type=?, engine_transmission=?, engine_drive=?, engine_fuelType=?, engine_cylinders=?, engine_displacement=?, exterior_color=?, interior_color=?, mileage=?, vehicle_condition=?, price=?, salesPrice=?, financingPerMonth=?, images=?, certificates=?, additionalFeatures=?, safety=?, deletedImages=?
      WHERE vin=?`,
      [
        vehicleData.stockNumber || '',
        vehicleData.make || '',
        vehicleData.model || '',
        vehicleData.modelYear || '',
        vehicleData.body || '',
        vehicleData.description || '',
        JSON.stringify(vehicleData.features || []),
        vehicleData.engine?.type || '',
        vehicleData.engine?.transmission || '',
        vehicleData.engine?.drive || '',
        vehicleData.engine?.fuelType || '',
        vehicleData.engine?.cylinders || '',
        vehicleData.engine?.displacement || '',
        vehicleData.exterior?.color || '',
        vehicleData.interior?.color || '',
        vehicleData.mileage || '',
        vehicleData.condition || '',
        vehicleData.pricing?.price || '',
        vehicleData.pricing?.salesPrice || '',
        vehicleData.pricing?.financingPerMonth || '',
        JSON.stringify(vehicleData.images || []),
        JSON.stringify(vehicleData.certificates || {}),
        JSON.stringify(vehicleData.additionalFeatures || []),
        JSON.stringify(vehicleData.safety || []),
        JSON.stringify(vehicleData.deletedImages || []),
        vehicleData.vin
      ]
    );
    await db.end();
    res.status(200).json({ message: 'Vehicle updated successfully', vehicle: vehicleData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete vehicle
app.delete('/api/vehicles/:vin', async (req, res) => {
  try {
    const db = await getDbConnection();
    await db.execute('DELETE FROM vehicles WHERE vin = ?', [req.params.vin]);
    await db.end();
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

// Catch-all: send back React's index.html for any non-API route
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for http://localhost:3001`);
}); 