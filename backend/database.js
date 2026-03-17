const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'geoattend.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Promisify database methods for async/await
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },
  
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Users table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'lecturer', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Courses table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        lecturer_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lecturer_id) REFERENCES users(id)
      )
    `);

    // Attendance sessions table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS attendance_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        lecturer_id INTEGER NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius INTEGER NOT NULL DEFAULT 50,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        active BOOLEAN DEFAULT 1,
        duration INTEGER DEFAULT 60,
        FOREIGN KEY (course_id) REFERENCES courses(id),
        FOREIGN KEY (lecturer_id) REFERENCES users(id)
      )
    `);

    // Attendance records table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        session_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        distance INTEGER NOT NULL,
        verified BOOLEAN DEFAULT 1,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (session_id) REFERENCES attendance_sessions(id),
        FOREIGN KEY (course_id) REFERENCES courses(id),
        UNIQUE(student_id, session_id)
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

module.exports = { db, dbAsync, initDatabase };
