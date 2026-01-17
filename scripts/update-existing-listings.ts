/**
 * Update existing listings with proper location, duration, and deadline
 * Run: npx tsx scripts/update-existing-listings.ts
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

async function updateListings() {
  console.log('🚀 Updating existing listings with new field values...\n');

  const client = await pool.connect();

  try {
    // Get all listings
    const result = await client.query('SELECT id, title FROM listings ORDER BY created_at');
    
    if (result.rows.length === 0) {
      console.log('⚠️  No listings found in database');
      client.release();
      await pool.end();
      return;
    }

    console.log(`Found ${result.rows.length} listings to update:\n`);

    // Update Vegetable Cultivation
    const vegListing = result.rows.find(r => r.title.includes('Vegetable'));
    if (vegListing) {
      await client.query(
        `UPDATE listings 
         SET location = $1, duration = $2, deadline = $3 
         WHERE id = $4`,
        ['Lagos, Nigeria', '3 months', '2024-12-31', vegListing.id]
      );
      console.log('✅ Updated: Vegetable Cultivation');
      console.log('   Location: Lagos, Nigeria');
      console.log('   Duration: 3 months');
      console.log('   Deadline: Dec 31, 2024\n');
    }

    // Update Web Development
    const webListing = result.rows.find(r => r.title.includes('Web Development'));
    if (webListing) {
      await client.query(
        `UPDATE listings 
         SET location = $1, duration = $2, deadline = $3 
         WHERE id = $4`,
        ['Remote', '6 months', '2024-11-30', webListing.id]
      );
      console.log('✅ Updated: Web Development Internship');
      console.log('   Location: Remote');
      console.log('   Duration: 6 months');
      console.log('   Deadline: Nov 30, 2024\n');
    }

    // Update Mobile App Development
    const mobileListing = result.rows.find(r => r.title.includes('Mobile App'));
    if (mobileListing) {
      await client.query(
        `UPDATE listings 
         SET location = $1, duration = $2, deadline = $3 
         WHERE id = $4`,
        ['Abuja, Nigeria', '4 months', '2025-01-15', mobileListing.id]
      );
      console.log('✅ Updated: Mobile App Development');
      console.log('   Location: Abuja, Nigeria');
      console.log('   Duration: 4 months');
      console.log('   Deadline: Jan 15, 2025\n');
    }

    console.log('🎉 All listings updated successfully!');
    console.log('You can now edit them as admin in the dashboard.');

  } catch (error) {
    console.error('❌ Error updating listings:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

updateListings();
