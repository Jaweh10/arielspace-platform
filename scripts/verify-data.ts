import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyData() {
  const client = await pool.connect();

  try {
    console.log('\n========================================');
    console.log('   DATABASE VERIFICATION');
    console.log('========================================\n');

    // Check users
    const users = await client.query(
      'SELECT email, role, first_name, last_name, created_at FROM users ORDER BY created_at'
    );
    
    console.log(`✅ Users in Database (${users.rows.length} total):`);
    users.rows.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email}`);
      console.log(`      Role: ${u.role}`);
      console.log(`      Name: ${u.first_name} ${u.last_name}`);
      console.log(`      Created: ${new Date(u.created_at).toLocaleString()}\n`);
    });

    // Check listings
    const listings = await client.query(
      'SELECT id, title, has_certification, created_at FROM listings ORDER BY created_at DESC'
    );
    
    console.log(`✅ Listings in Database (${listings.rows.length} total):`);
    listings.rows.forEach((l, i) => {
      console.log(`   ${i + 1}. ${l.title}`);
      console.log(`      Certification: ${l.has_certification ? 'Yes' : 'No'}`);
      console.log(`      ID: ${l.id}\n`);
    });

    console.log('========================================');
    console.log('✅ Database verification complete!');
    console.log('========================================\n');

  } finally {
    client.release();
    await pool.end();
  }
}

verifyData();
