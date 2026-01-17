/**
 * Seed default listings to database
 * Run: npx tsx scripts/seed-listings.ts
 */

import { Pool } from 'pg';
import { defaultListings } from '../src/lib/listings';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function seedListings() {
  console.log('🚀 Seeding listings...\n');

  const client = await pool.connect();

  try {
    // Check if listings already exist
    const existingListings = await client.query('SELECT COUNT(*) FROM listings');
    const count = parseInt(existingListings.rows[0].count);

    if (count > 0) {
      console.log(`⚠️  Database already has ${count} listings`);
      console.log('✅ No action needed\n');
      client.release();
      await pool.end();
      return;
    }

    console.log('📝 Inserting default listings...\n');

    // Insert each listing
    for (const listing of defaultListings) {
      const result = await client.query(
        `INSERT INTO listings (title, short_description, full_details, has_certification, apply_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title`,
        [
          listing.title,
          listing.shortDescription,
          listing.fullDetails,
          listing.hasCertification,
          listing.applyUrl,
          listing.createdAt
        ]
      );

      console.log(`✅ Created: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
    }

    console.log(`\n🎉 Successfully seeded ${defaultListings.length} listings!`);

    client.release();
    await pool.end();

  } catch (error) {
    console.error('❌ Error seeding listings:', error);
    client.release();
    await pool.end();
    process.exit(1);
  }
}

seedListings();
