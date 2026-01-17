/**
 * Add location, duration, and deadline fields to listings table
 * Run: npx tsx scripts/add-listing-fields.ts
 */

import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function addFields() {
  console.log('🚀 Adding new fields to listings table...\n');

  const client = await pool.connect();

  try {
    // Add location field
    console.log('Adding location field...');
    await client.query(`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS location VARCHAR(255)
    `);
    console.log('✅ Location field added\n');

    // Add duration field
    console.log('Adding duration field...');
    await client.query(`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS duration VARCHAR(100)
    `);
    console.log('✅ Duration field added\n');

    // Add deadline field
    console.log('Adding deadline field...');
    await client.query(`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS deadline DATE
    `);
    console.log('✅ Deadline field added\n');

    // Update existing listings with default values
    console.log('Updating existing listings with default values...');
    await client.query(`
      UPDATE listings 
      SET 
        location = 'Remote',
        duration = '3 months',
        deadline = CURRENT_DATE + INTERVAL '30 days'
      WHERE location IS NULL
    `);
    console.log('✅ Existing listings updated\n');

    console.log('🎉 All fields added successfully!');
    console.log('\nNew schema:');
    console.log('  - location: VARCHAR(255)');
    console.log('  - duration: VARCHAR(100)');
    console.log('  - deadline: DATE');

  } catch (error) {
    console.error('❌ Error adding fields:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addFields();
