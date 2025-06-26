const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, '../../dealership.db');
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createVehiclesTable = `
        CREATE TABLE IF NOT EXISTS vehicles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vin TEXT UNIQUE NOT NULL,
          make TEXT NOT NULL,
          model TEXT NOT NULL,
          year INTEGER,
          trim TEXT,
          mileage INTEGER,
          price REAL,
          salesPrice REAL,
          financingPerMonth REAL,
          description TEXT,
          body TEXT,
          transmission TEXT,
          engine TEXT,
          drivetrain TEXT,
          exteriorColor TEXT,
          interiorColor TEXT,
          fuelType TEXT,
          features TEXT,
          images TEXT,
          certificates TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createVehiclesTable, (err) => {
        if (err) {
          console.error('Error creating vehicles table:', err);
          reject(err);
        } else {
          console.log('Vehicles table ready');
          resolve();
        }
      });
    });
  }

  async getAllVehicles() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM vehicles ORDER BY created_at DESC';
      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse JSON fields
          const vehicles = rows.map(row => ({
            ...row,
            images: row.images ? JSON.parse(row.images) : [],
            certificates: row.certificates ? JSON.parse(row.certificates) : {},
            features: row.features ? JSON.parse(row.features) : []
          }));
          resolve(vehicles);
        }
      });
    });
  }

  async getVehicleByVin(vin) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM vehicles WHERE vin = ?';
      this.db.get(query, [vin], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          // Parse JSON fields
          const vehicle = {
            ...row,
            images: row.images ? JSON.parse(row.images) : [],
            certificates: row.certificates ? JSON.parse(row.certificates) : {},
            features: row.features ? JSON.parse(row.features) : []
          };
          resolve(vehicle);
        }
      });
    });
  }

  async vehicleExists(vin) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM vehicles WHERE vin = ?';
      this.db.get(query, [vin], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }

  async addVehicle(vehicleData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO vehicles (
          vin, make, model, year, trim, mileage, price, salesPrice, 
          financingPerMonth, description, body, transmission, engine, 
          drivetrain, exteriorColor, interiorColor, fuelType, features, 
          images, certificates
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        vehicleData.vin,
        vehicleData.make,
        vehicleData.model,
        vehicleData.year,
        vehicleData.trim,
        vehicleData.mileage,
        vehicleData.price,
        vehicleData.salesPrice,
        vehicleData.financingPerMonth,
        vehicleData.description,
        vehicleData.body,
        vehicleData.transmission,
        vehicleData.engine,
        vehicleData.drivetrain,
        vehicleData.exteriorColor,
        vehicleData.interiorColor,
        vehicleData.fuelType,
        JSON.stringify(vehicleData.features || []),
        JSON.stringify(vehicleData.images || []),
        JSON.stringify(vehicleData.certificates || {})
      ];

      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...vehicleData });
        }
      });
    });
  }

  async updateVehicle(vehicleData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE vehicles SET 
          make = ?, model = ?, year = ?, trim = ?, mileage = ?, 
          price = ?, salesPrice = ?, financingPerMonth = ?, description = ?, 
          body = ?, transmission = ?, engine = ?, drivetrain = ?, 
          exteriorColor = ?, interiorColor = ?, fuelType = ?, features = ?, 
          images = ?, certificates = ?, updated_at = CURRENT_TIMESTAMP
        WHERE vin = ?
      `;

      const values = [
        vehicleData.make,
        vehicleData.model,
        vehicleData.year,
        vehicleData.trim,
        vehicleData.mileage,
        vehicleData.price,
        vehicleData.salesPrice,
        vehicleData.financingPerMonth,
        vehicleData.description,
        vehicleData.body,
        vehicleData.transmission,
        vehicleData.engine,
        vehicleData.drivetrain,
        vehicleData.exteriorColor,
        vehicleData.interiorColor,
        vehicleData.fuelType,
        JSON.stringify(vehicleData.features || []),
        JSON.stringify(vehicleData.images || []),
        JSON.stringify(vehicleData.certificates || {}),
        vehicleData.vin
      ];

      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes, ...vehicleData });
        }
      });
    });
  }

  async deleteVehicle(vin) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM vehicles WHERE vin = ?';
      this.db.run(query, [vin], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  async deleteAllVehicles() {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM vehicles';
      this.db.run(query, [], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = Database; 