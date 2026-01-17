/**
 * Seed admin user script
 * Run: npx tsx scripts/seed-admin.ts
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@arielspace.com';
const adminPassword = process.env.ADMIN_PASSWORD || '$+davfil98+$';

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function seedAdmin() {
  console.log('🚀 Seeding admin user...\n');

  const client = await pool.connect();

  try {
    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT email FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists:', adminEmail);
      console.log('✅ No action needed\n');
      client.release();
      await pool.end();
      return;
    }

    // Hash the admin password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [adminEmail, passwordHash, 'Admin', 'User', '+1234567890', 'admin']
    );

    console.log('✅ Admin user created successfully!\n');
    console.log('📧 Email:', result.rows[0].email);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Role:', result.rows[0].role);
    console.log('🆔 ID:', result.rows[0].id);
    console.log('\n🎉 You can now login with these credentials!');

    client.release();
    await pool.end();

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    client.release();
    await pool.end();
    process.exit(1);
  }
}

seedAdmin();
