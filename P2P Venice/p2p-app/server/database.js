const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'p2p_venice.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  // Users table (for admin authentication)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Teams table (primary registration)
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_name TEXT NOT NULL,
      primary_driver_name TEXT NOT NULL,
      primary_driver_email TEXT NOT NULL,
      primary_driver_phone TEXT NOT NULL,
      emergency_contact_name TEXT NOT NULL,
      emergency_contact_details TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      approved_paid BOOLEAN DEFAULT 0,
      ferry_booking_reference TEXT,
      gdpr_consent BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Passenger details table
  db.run(`
    CREATE TABLE IF NOT EXISTS passengers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      team_name TEXT NOT NULL,
      primary_driver_name TEXT NOT NULL,
      driver_2_name TEXT,
      driver_3_name TEXT,
      driver_4_name TEXT,
      rooms_required INTEGER DEFAULT 0,
      room_type TEXT,
      driver_1_dietary TEXT,
      driver_2_dietary TEXT,
      driver_3_dietary TEXT,
      driver_4_dietary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);

  // Notifications log
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      recipient TEXT NOT NULL,
      status TEXT DEFAULT 'sent',
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);

  // Create default admin user if not exists
  db.run(`
    INSERT OR IGNORE INTO users (username, password, role)
    VALUES ('admin', '$2a$10$rKZJYxYxYxYxYxYxYxYxYuZxZxZxZxZxZxZxZxZxZxZxZxZxZ', 'admin')
  `, (err) => {
    if (err) {
      console.error('Error creating default admin:', err);
    } else {
      console.log('Default admin user created (username: admin, password: admin123)');
    }
  });
}

module.exports = db;
