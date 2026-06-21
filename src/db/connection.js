const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite'); // SQLite nativo de Node.js (>=22.5)

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'mediqueue.db');

function getConnection(dbPath = DB_PATH) {
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  return db;
}

module.exports = { getConnection, DB_PATH };
