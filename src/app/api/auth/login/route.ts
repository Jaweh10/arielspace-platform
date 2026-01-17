import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@arielspace.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '$+davfil98+$';

export async function POST(request: NextRequest) {
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

    const client = await pool.connect();

    try {
      // Find user by email
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        client.release();
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
          client.release();
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
        client.release();
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      client.release();

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

    } catch (dbError: any) {
      client.release();
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
