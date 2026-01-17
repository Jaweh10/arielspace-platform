import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET all listings
export async function GET(request: NextRequest) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT * FROM listings ORDER BY created_at DESC'
    );

    const listings = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      shortDescription: row.short_description,
      fullDetails: row.full_details,
      hasCertification: row.has_certification,
      applyUrl: row.apply_url,
      location: row.location,
      duration: row.duration,
      deadline: row.deadline,
      createdAt: row.created_at,
      createdBy: row.created_by,
    }));

    client.release();

    return NextResponse.json({ listings });

  } catch (error: any) {
    client.release();
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

// POST create new listing
export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { title, shortDescription, fullDetails, hasCertification, applyUrl, location, duration, deadline, createdBy } = body;

    // Validate required fields
    if (!title || !shortDescription || !fullDetails || !applyUrl) {
      client.release();
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await client.query(
      `INSERT INTO listings (title, short_description, full_details, has_certification, apply_url, location, duration, deadline, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, shortDescription, fullDetails, hasCertification || false, applyUrl, location || null, duration || null, deadline || null, createdBy || null]
    );

    const listing = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      shortDescription: result.rows[0].short_description,
      fullDetails: result.rows[0].full_details,
      hasCertification: result.rows[0].has_certification,
      applyUrl: result.rows[0].apply_url,
      location: result.rows[0].location,
      duration: result.rows[0].duration,
      deadline: result.rows[0].deadline,
      createdAt: result.rows[0].created_at,
      createdBy: result.rows[0].created_by,
    };

    client.release();

    return NextResponse.json({ listing }, { status: 201 });

  } catch (error: any) {
    client.release();
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
