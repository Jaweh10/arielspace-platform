import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables (without exposing sensitive data)
    const hasDbUrl = !!process.env.DATABASE_URL;
    const hasNetlifyDbUrl = !!process.env.NETLIFY_DATABASE_URL;
    const hasAdminEmail = !!process.env.ADMIN_EMAIL;
    const hasAdminPassword = !!process.env.ADMIN_PASSWORD;
    
    // Try to connect to database
    let dbStatus = 'not tested';
    let dbError = null;
    
    if (hasDbUrl || hasNetlifyDbUrl) {
      try {
        const { Pool } = require('pg');
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        await pool.end();
        
        dbStatus = 'connected';
      } catch (error: any) {
        dbStatus = 'failed';
        dbError = error.message;
      }
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      platform: process.env.NETLIFY ? 'Netlify' : 'Local',
      envVars: {
        DATABASE_URL: hasDbUrl ? 'set' : 'not set',
        NETLIFY_DATABASE_URL: hasNetlifyDbUrl ? 'set' : 'not set',
        ADMIN_EMAIL: hasAdminEmail ? 'set' : 'not set',
        ADMIN_PASSWORD: hasAdminPassword ? 'set' : 'not set',
      },
      database: {
        status: dbStatus,
        error: dbError,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
