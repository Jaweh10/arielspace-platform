import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET single listing by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT * FROM listings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const listing = {
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
    };

    client.release();

    return NextResponse.json({ listing });

  } catch (error: any) {
    client.release();
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// PUT update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { title, shortDescription, fullDetails, hasCertification, applyUrl, location, duration, deadline } = body;

    // Validate required fields
    if (!title || !shortDescription || !fullDetails || !applyUrl) {
      client.release();
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await client.query(
      `UPDATE listings
       SET title = $1, short_description = $2, full_details = $3, 
           has_certification = $4, apply_url = $5, location = $6, duration = $7, deadline = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, shortDescription, fullDetails, hasCertification || false, applyUrl, location || null, duration || null, deadline || null, id]
    );

    if (result.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const listing = {
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
    };

    client.release();

    return NextResponse.json({ listing });

  } catch (error: any) {
    client.release();
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      'DELETE FROM listings WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    client.release();

    return NextResponse.json({ success: true });

  } catch (error: any) {
    client.release();
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
