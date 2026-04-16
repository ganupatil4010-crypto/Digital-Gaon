const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'digital-gaon.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT '',
    village TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    role TEXT DEFAULT 'user',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT DEFAULT '',
    img TEXT DEFAULT 'https://images.unsplash.com/photo-1592982537447-6f23b3793f77?auto=format&fit=crop&q=80&w=400',
    sellerEmail TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userEmail TEXT NOT NULL,
    productId INTEGER NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    UNIQUE(userEmail, productId)
  );

  CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);

// Run migrations safely
try {
  db.exec("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''");
} catch(e) {}

try {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
} catch(e) {}

// Set default admin
try {
  const adminEmail = 'tgund5858@gmail.com';
  
  // Demote all other admins first (safety measure)
  db.prepare("UPDATE users SET role = 'user' WHERE email != ?").run(adminEmail);
  
  // Promote the specific admin
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  if (existing) {
    db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(adminEmail);
  } else {
    db.prepare("INSERT INTO users (email, role) VALUES (?, 'admin')").run(adminEmail);
  }
} catch(e) {
  console.error('Error setting default admin:', e);
}

console.log('--- SQLITE DATABASE READY ---');

module.exports = db;
