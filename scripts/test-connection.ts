/**
 * Test database connection
 * Run: npx tsx scripts/test-connection.ts
 */

import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function testConnection() {
  console.log('🔌 Testing database connection...\n');
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  console.log('Connection string (masked):', connectionString.replace(/:[^@]+@/, ':***@'));

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!\n');

    // Test query
    const result = await client.query('SELECT NOW(), version()');
    console.log('📅 Server time:', result.rows[0].now);
    console.log('🗄️  PostgreSQL version:', result.rows[0].version.split('\n')[0]);

    client.release();
    await pool.end();

    console.log('\n🎉 Connection test passed!');
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();
