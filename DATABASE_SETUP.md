# SQLite Database Setup

Your dealership app now uses **SQLite** for persistent data storage instead of file-based storage. This ensures your vehicles and data will persist across server restarts and deployments.

## What Changed

- ✅ **Persistent Storage**: All vehicle data is now stored in a SQLite database (`dealership.db`)
- ✅ **No Data Loss**: Vehicles won't disappear when the server restarts
- ✅ **Better Performance**: Faster queries and data retrieval
- ✅ **Easy Backup**: Simple database backup system included

## Files Created/Modified

### New Files:
- `src/server/database.js` - SQLite database operations
- `src/server/migrate.js` - Migration script for existing data
- `backup-database.js` - Database backup utility
- `dealership.db` - SQLite database file (created automatically)

### Modified Files:
- `src/server/index.js` - Updated to use SQLite instead of file storage
- `package.json` - Added new scripts for database management

## Available Commands

### Development:
```bash
npm run dev          # Start both React app and server
npm run server-only  # Start only the server
```

### Database Management:
```bash
npm run migrate      # Migrate existing vehicles to database
npm run backup       # Create a backup of the database
```

## Database Backup

Your database is automatically backed up when you run:
```bash
npm run backup
```

This creates timestamped backups in a `backups/` folder and keeps the last 5 backups.

## Deployment to DigitalOcean

When deploying to DigitalOcean:

1. **Upload all files** including the `dealership.db` file
2. **Install dependencies**: `npm install`
3. **Start the server**: `npm run server-only` or `node src/server/index.js`

## Data Persistence

- ✅ Vehicle information is stored in SQLite database
- ✅ Images are still stored in the `Cars/` directory structure
- ✅ Certificates (Carfax, Window Sticker) are stored in the `Cars/` directory
- ✅ All data persists across server restarts

## Troubleshooting

### If vehicles disappear:
1. Check if the `dealership.db` file exists in your project root
2. Ensure the server has write permissions to the database file
3. Check server logs for any database errors

### If you need to reset the database:
1. Stop the server
2. Delete `dealership.db`
3. Restart the server (a new database will be created automatically)

### If you need to restore from backup:
1. Stop the server
2. Copy a backup file from `backups/` to `dealership.db`
3. Restart the server

## Benefits of SQLite

- **Free**: No monthly costs or external services needed
- **Reliable**: ACID compliant, crash-safe
- **Portable**: Single file database, easy to backup and move
- **Fast**: Excellent performance for small to medium applications
- **No Setup**: No separate database server required

Your dealership app is now much more robust and reliable! 🚗💾 