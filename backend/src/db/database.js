const fs = require('node:fs');
const path = require('node:path');
// Built into Node 22+ — no native modules to compile.
const { DatabaseSync } = require('node:sqlite');

/** Opens (and creates, if needed) the SQLite database and its tables. */
function openDatabase(file) {
  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON'); // enforce Device → Sensor relationship
  db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  return db;
}

module.exports = { openDatabase };
