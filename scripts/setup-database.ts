/**
 * Database setup script
 * Run: npx tsx scripts/setup-database.ts
 */

import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setupDatabase() {
  console.log('🚀 Setting up database tables...\n');

  try {
    // Create users table
    console.log('Creating users table...');
    await sql`
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
    `;
    console.log('✅ Users table created\n');

    // Create listings table
    console.log('Creating listings table...');
    await sql`
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
    `;
    console.log('✅ Listings table created\n');

    // Create indexes for better performance
    console.log('Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC)
    `;
    console.log('✅ Indexes created\n');

    console.log('🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npx tsx scripts/seed-admin.ts (to create admin user)');
    console.log('2. Run: npx tsx scripts/seed-listings.ts (to migrate listings)');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
