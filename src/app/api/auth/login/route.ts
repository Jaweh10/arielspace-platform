import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@arielspace.com';
const ADMIN_PASSWORD = '$+davfil98+$';

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL && !process.env.NETLIFY_DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get database pool
    const dbPool = getPool();
    client = await dbPool.connect();

    // Find user by email
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Special case: Admin with hardcoded password
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      // Check if using hardcoded admin password
      if (password === ADMIN_PASSWORD) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            role: 'admin',
            name: `${user.first_name} ${user.last_name}`,
          },
        });
      }
    }

    // Regular password verification
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user data (without password hash)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    console.error('DATABASE_URL set:', !!process.env.DATABASE_URL);
    console.error('NETLIFY_DATABASE_URL set:', !!process.env.NETLIFY_DATABASE_URL);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  } finally {
    // Always release the client
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}
