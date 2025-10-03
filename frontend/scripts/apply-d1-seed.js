const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const repoRoot = path.resolve(__dirname, '..', '..');
const seedSqlPath = path.join(repoRoot, 'tmp', 'seed_d1.sql');
const localDbPath = path.join(repoRoot, 'tmp', 'd1_local.sqlite');

if (!fs.existsSync(seedSqlPath)) {
  console.error('Seed SQL not found at', seedSqlPath);
  process.exit(1);
}

const sql = fs.readFileSync(seedSqlPath, 'utf8');

console.log('Applying D1 seed SQL to local SQLite DB at', localDbPath);

const db = new sqlite3.Database(localDbPath, err => {
  if (err) {
    console.error('Failed to open local DB:', err.message);
    process.exit(1);
  }
});

db.exec(sql, function(err) {
  if (err) {
    console.error('Failed to apply seed SQL:', err.message);
    process.exit(1);
  }
  console.log('Seed SQL applied successfully.');
  db.close();
});
