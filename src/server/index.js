const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

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

// Check if vehicle exists
app.get('/api/vehicles/:vin', async (req, res) => {
  try {
    const carsDir = path.join(__dirname, '../../Cars');
    const folders = await fs.readdir(carsDir);
    const exists = folders.some(folder => folder.startsWith(req.params.vin));
    
    if (exists) {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ exists: false });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const carsDir = path.join(__dirname, '../../Cars');
    const folders = await fs.readdir(carsDir);
    
    const vehicles = await Promise.all(
      folders.map(async (folder) => {
        try {
          const vehiclePath = path.join(carsDir, folder);
          const dataFile = path.join(vehiclePath, 'data.json');
          const imagesDir = path.join(vehiclePath, 'images');
          
          const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
          const images = await fs.readdir(imagesDir);
          
          return {
            ...data,
            mainImage: images.length > 0 ? `/api/images/${folder}/images/${images[0]}` : null,
            images: images.map(image => `/api/images/${folder}/images/${image}`)
          };
        } catch (error) {
          console.error(`Error processing vehicle folder ${folder}:`, error);
          return null;
        }
      })
    );
    
    res.json(vehicles.filter(v => v !== null));
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json([]);
    } else {
      res.status(500).json({ error: error.message });
    }
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
    const folderName = `${vehicleData.vin}-${vehicleData.make}-${vehicleData.model}`;
    const folderPath = path.join(__dirname, '../../Cars', folderName);
    const imagesDir = path.join(folderPath, 'images');
    const certsDir = path.join(folderPath, 'certificates');
    await fs.mkdir(imagesDir, { recursive: true });
    await fs.mkdir(certsDir, { recursive: true });
    
    // Move files from tmp to correct folders
    vehicleData.images = [];
    vehicleData.certificates = {};
    let carfaxPath = null;
    let windowStickerPath = null;
    for (const file of req.files || []) {
      let destPath;
      if (file.fieldname === 'images') {
        destPath = path.join(imagesDir, file.filename);
        vehicleData.images.push({
          filename: file.filename,
          path: `/api/images/${folderName}/images/${file.filename}`
        });
        await fs.rename(file.path, destPath);
      } else if (file.fieldname === 'carfax') {
        // Always save as carfax.pdf
        const certName = `carfax.pdf`;
        destPath = path.join(certsDir, certName);
        await fs.rename(file.path, destPath);
        carfaxPath = `/api/images/${folderName}/certificates/${certName}`;
      } else if (file.fieldname === 'windowSticker') {
        // Always save as window-sticker.pdf
        const certName = `window-sticker.pdf`;
        destPath = path.join(certsDir, certName);
        await fs.rename(file.path, destPath);
        windowStickerPath = `/api/images/${folderName}/certificates/${certName}`;
      } else {
        // Unknown field, skip
        continue;
      }
    }
    // After moving files, robustly rename any certificate files to the correct VIN-based names
    const certFiles = await fs.readdir(certsDir);
    for (const file of certFiles) {
      if (file === 'carfax' || file === 'carfax.pdf') {
        const correctName = `${vehicleData.vin}-Carfax.pdf`;
        await fs.rename(
          path.join(certsDir, file),
          path.join(certsDir, correctName)
        );
        carfaxPath = `/api/images/${folderName}/certificates/${correctName}`;
      }
      if (file === 'window-sticker' || file === 'window-sticker.pdf') {
        const correctName = `${vehicleData.vin}-WindowSticker.pdf`;
        await fs.rename(
          path.join(certsDir, file),
          path.join(certsDir, correctName)
        );
        windowStickerPath = `/api/images/${folderName}/certificates/${correctName}`;
      }
    }
    if (carfaxPath) vehicleData.certificates.carfax = carfaxPath;
    if (windowStickerPath) vehicleData.certificates.windowSticker = windowStickerPath;
    
    // Save vehicle data
    await fs.writeFile(
      path.join(folderPath, 'data.json'),
      JSON.stringify(vehicleData, null, 2)
    );
    res.status(201).json({ 
      message: 'Vehicle added successfully',
      vehicle: vehicleData
    });
  } catch (error) {
    console.error('Error saving vehicle:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update vehicle
app.put('/api/vehicles', upload.any(), async (req, res) => {
  console.log('Received vehicle update request');
  try {
    if (!req.body.vehicleData) {
      console.error('No vehicle data provided');
      return res.status(400).json({ error: 'No vehicle data provided' });
    }

    const vehicleData = JSON.parse(req.body.vehicleData);
    console.log('Parsed vehicle data:', {
      vin: vehicleData.vin,
      make: vehicleData.make,
      model: vehicleData.model,
      imagesCount: vehicleData.images?.length,
      deletedImagesCount: vehicleData.deletedImages?.length
    });

    if (!vehicleData.vin || !vehicleData.make || !vehicleData.model) {
      console.error('Missing required vehicle information');
      return res.status(400).json({ error: 'Missing required vehicle information' });
    }

    const folderName = `${vehicleData.vin}-${vehicleData.make}-${vehicleData.model}`;
    const folderPath = path.join(__dirname, '../../Cars', folderName);
    
    // Handle deleted images
    if (vehicleData.deletedImages && vehicleData.deletedImages.length > 0) {
      console.log('Processing deleted images:', vehicleData.deletedImages);
      for (const imagePath of vehicleData.deletedImages) {
        try {
          // Extract filename from the path
          const filename = imagePath.split('/').pop();
          const imageFilePath = path.join(folderPath, 'images', filename);
          console.log('Attempting to delete image file:', imageFilePath);
          
          // Check if file exists before trying to delete
          try {
            await fs.access(imageFilePath);
            await fs.unlink(imageFilePath);
            console.log('Successfully deleted image:', filename);
          } catch (error) {
            if (error.code === 'ENOENT') {
              console.log('Image file not found:', filename);
            } else {
              throw error;
            }
          }
        } catch (error) {
          console.error('Error deleting image:', error);
          // Continue with other deletions even if one fails
        }
      }
    }

    // Add uploaded files information to vehicle data while preserving existing ones
    if (req.files && req.files.length > 0) {
      // Group files by type
      const images = req.files.filter(f => f.fieldname === 'images');
      const carfax = req.files.find(f => f.fieldname === 'carfax');
      const windowSticker = req.files.find(f => f.fieldname === 'windowSticker');

      // Add images
      let newImages = [];
      if (images.length > 0) {
        newImages = images.map(file => ({
          filename: file.filename,
          path: `/api/images/${folderName}/images/${file.filename}`
        }));
        for (const file of images) {
          await fs.rename(file.path, path.join(folderPath, 'images', file.filename));
        }
      }
      // Filter out deleted images from existing images
      const existingImages = (vehicleData.images || []).filter(img => {
        const isDeleted = vehicleData.deletedImages?.includes(img);
        if (isDeleted) {
          console.log('Filtering out deleted image:', img);
        }
        return !isDeleted;
      });
      vehicleData.images = [...existingImages, ...newImages];

      // Add certificates
      vehicleData.certificates = vehicleData.certificates || {};
      if (carfax) {
        const certName = `carfax.pdf`;
        const destPath = path.join(folderPath, 'certificates', certName);
        await fs.rename(carfax.path, destPath);
        vehicleData.certificates.carfax = `/api/images/${folderName}/certificates/${certName}`;
      }
      if (windowSticker) {
        const certName = `window-sticker.pdf`;
        const destPath = path.join(folderPath, 'certificates', certName);
        await fs.rename(windowSticker.path, destPath);
        vehicleData.certificates.windowSticker = `/api/images/${folderName}/certificates/${certName}`;
      }
    } else {
      // If no new images, just filter out deleted ones
      vehicleData.images = (vehicleData.images || []).filter(img => {
        const isDeleted = vehicleData.deletedImages?.includes(img);
        if (isDeleted) {
          console.log('Filtering out deleted image:', img);
        }
        return !isDeleted;
      });
      console.log('Updated images array (no new uploads):', vehicleData.images);
    }
    
    // Remove deletedImages from the data before saving
    delete vehicleData.deletedImages;
    
    // Save updated vehicle data
    const dataFilePath = path.join(folderPath, 'data.json');
    console.log('Saving updated vehicle data to:', dataFilePath);
    await fs.writeFile(dataFilePath, JSON.stringify(vehicleData, null, 2));
    
    console.log('Vehicle updated successfully');
    res.status(200).json({ 
      message: 'Vehicle updated successfully',
      vehicle: vehicleData
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete vehicle
app.delete('/api/vehicles/:vin', async (req, res) => {
  try {
    const carsDir = path.join(__dirname, '../../Cars');
    const folders = await fs.readdir(carsDir);
    const folder = folders.find(f => f.startsWith(req.params.vin));
    
    if (folder) {
      await fs.rm(path.join(carsDir, folder), { recursive: true });
      res.json({ message: 'Vehicle deleted successfully' });
    } else {
      res.status(404).json({ error: 'Vehicle not found' });
    }
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