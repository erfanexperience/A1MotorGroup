const fs = require('fs').promises;
const path = require('path');
const Database = require('./database');

async function migrateVehicles() {
  const db = new Database();
  
  try {
    console.log('Starting migration...');
    
    // Initialize database
    await db.init();
    
    // Read existing vehicles from file system
    const carsDir = path.join(__dirname, '../../Cars');
    let folders = [];
    
    try {
      folders = await fs.readdir(carsDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No Cars directory found. Nothing to migrate.');
        return;
      }
      throw error;
    }
    
    // Filter out tmp directory and non-vehicle folders
    folders = folders.filter(folder => 
      folder !== 'tmp' && 
      !folder.startsWith('.') && 
      folder.includes('-')
    );
    
    if (folders.length === 0) {
      console.log('No existing vehicles found to migrate.');
      return;
    }
    
    console.log(`Found ${folders.length} vehicles to migrate...`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const folder of folders) {
      try {
        const vehiclePath = path.join(carsDir, folder);
        const dataFile = path.join(vehiclePath, 'data.json');
        
        // Check if data.json exists
        try {
          await fs.access(dataFile);
        } catch (error) {
          console.log(`Skipping ${folder}: no data.json file found`);
          continue;
        }
        
        // Read vehicle data
        const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
        
        // Check if vehicle already exists in database
        const exists = await db.vehicleExists(data.vin);
        if (exists) {
          console.log(`Skipping ${folder}: vehicle already exists in database`);
          continue;
        }
        
        // Add vehicle to database
        await db.addVehicle(data);
        console.log(`✓ Migrated: ${data.make} ${data.model} (${data.vin})`);
        migratedCount++;
        
      } catch (error) {
        console.error(`✗ Error migrating ${folder}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\nMigration completed!');
    console.log(`✓ Successfully migrated: ${migratedCount} vehicles`);
    if (errorCount > 0) {
      console.log(`✗ Errors: ${errorCount} vehicles`);
    }
    
    // Show total vehicles in database
    const allVehicles = await db.getAllVehicles();
    console.log(`Total vehicles in database: ${allVehicles.length}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await db.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateVehicles();
}

module.exports = migrateVehicles; 