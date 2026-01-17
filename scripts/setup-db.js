/**
 * Database Setup Script
 * Run this with: node scripts/setup-db.js
 * 
 * Make sure DATABASE_URL environment variable is set:
 * - Windows PowerShell: $env:DATABASE_URL="your-connection-string"
 * - Windows CMD: set DATABASE_URL=your-connection-string
 * - Linux/Mac: export DATABASE_URL="your-connection-string"
 */

const { Pool } = require('pg');
const path = require('path');

// Load .env.local file
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  const client = await pool.connect();

  try {
    // Create users table
    console.log('📋 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created\n');

    // Create listings table
    console.log('📋 Creating listings table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        short_description TEXT NOT NULL,
        full_details TEXT NOT NULL,
        has_certification BOOLEAN DEFAULT false,
        apply_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
      )
    `);
    console.log('✅ Listings table created\n');

    // Create indexes
    console.log('📋 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC)
    `);
    console.log('✅ Indexes created\n');

    // Insert admin user
    console.log('📋 Creating admin user...');
    const result = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ('admin@arielspace.com', '$2a$10$dummyhashforplaceholder', 'Admin', 'User', 'admin')
      ON CONFLICT (email) DO NOTHING
      RETURNING email
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Admin user created: admin@arielspace.com\n');
    } else {
      console.log('ℹ️  Admin user already exists\n');
    }

    // Verify setup
    console.log('📊 Verifying setup...');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const listingCount = await client.query('SELECT COUNT(*) FROM listings');
    
    console.log(`✅ Users in database: ${userCount.rows[0].count}`);
    console.log(`✅ Listings in database: ${listingCount.rows[0].count}\n`);

    console.log('🎉 Database setup complete!\n');
    console.log('You can now login with:');
    console.log('  Email: admin@arielspace.com');
    console.log('  Password: $+davfil98+$\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('\nPlease set it first:');
  console.error('  PowerShell: $env:DATABASE_URL="your-connection-string"');
  console.error('  CMD: set DATABASE_URL=your-connection-string');
  console.error('  Linux/Mac: export DATABASE_URL="your-connection-string"\n');
  process.exit(1);
}

// Run setup
setupDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
