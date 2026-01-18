import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

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

// GET single listing by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let client;

  try {
    const dbPool = getPool();
    client = await dbPool.connect();

    const result = await client.query(
      'SELECT * FROM listings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
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

    return NextResponse.json({ listing });

  } catch (error: any) {
    console.error('Database error fetching listing:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch listing',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}

// PUT update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let client;

  try {
    const body = await request.json();
    const { title, shortDescription, fullDetails, hasCertification, applyUrl, location, duration, deadline } = body;

    // Validate required fields
    if (!title || !shortDescription || !fullDetails || !applyUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dbPool = getPool();
    client = await dbPool.connect();

    const result = await client.query(
      `UPDATE listings
       SET title = $1, short_description = $2, full_details = $3, 
           has_certification = $4, apply_url = $5, location = $6, duration = $7, deadline = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, shortDescription, fullDetails, hasCertification || false, applyUrl, location || null, duration || null, deadline || null, id]
    );

    if (result.rows.length === 0) {
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

    return NextResponse.json({ listing });

  } catch (error: any) {
    console.error('Database error updating listing:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update listing',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}

// DELETE listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let client;

  try {
    const dbPool = getPool();
    client = await dbPool.connect();

    const result = await client.query(
      'DELETE FROM listings WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Database error deleting listing:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete listing',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}
