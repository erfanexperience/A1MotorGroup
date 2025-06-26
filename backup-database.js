const fs = require('fs').promises;
const path = require('path');

async function backupDatabase() {
  const dbPath = path.join(__dirname, 'dealership.db');
  const backupDir = path.join(__dirname, 'backups');
  
  try {
    // Create backups directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `dealership-backup-${timestamp}.db`);
    
    // Copy database file
    await fs.copyFile(dbPath, backupPath);
    
    console.log(`✓ Database backed up to: ${backupPath}`);
    
    // Keep only the last 5 backups
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(file => file.startsWith('dealership-backup-'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 5) {
      const filesToDelete = backupFiles.slice(5);
      for (const file of filesToDelete) {
        await fs.unlink(path.join(backupDir, file));
        console.log(`Deleted old backup: ${file}`);
      }
    }
    
  } catch (error) {
    console.error('Backup failed:', error);
  }
}

// Run backup if this file is executed directly
if (require.main === module) {
  backupDatabase();
}

module.exports = backupDatabase; 