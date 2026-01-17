import { neon } from '@neondatabase/serverless';

// Get database connection string from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create Neon SQL client
export const sql = neon(databaseUrl);

// Database utility functions
export const db = {
  /**
   * Execute a raw SQL query
   * @param query SQL query string
   * @param params Query parameters
   * @returns Query results
   */
  async query(query: string, params: any[] = []) {
    try {
      return await sql(query, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result[0] || null;
  },

  /**
   * Create new user
   */
  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) {
    const result = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES (
        ${data.email},
        ${data.passwordHash},
        ${data.firstName},
        ${data.lastName},
        ${data.phone || null},
        ${data.role || 'user'}
      )
      RETURNING id, email, first_name, last_name, phone, role, created_at
    `;
    return result[0];
  },

  /**
   * Get all listings
   */
  async getAllListings() {
    const result = await sql`
      SELECT * FROM listings ORDER BY created_at DESC
    `;
    return result;
  },

  /**
   * Get single listing by ID
   */
  async getListingById(id: string) {
    const result = await sql`
      SELECT * FROM listings WHERE id = ${id} LIMIT 1
    `;
    return result[0] || null;
  },

  /**
   * Create new listing
   */
  async createListing(data: {
    title: string;
    shortDescription: string;
    fullDetails: string;
    hasCertification: boolean;
    applyUrl: string;
    createdBy?: string;
  }) {
    const result = await sql`
      INSERT INTO listings (title, short_description, full_details, has_certification, apply_url, created_by)
      VALUES (
        ${data.title},
        ${data.shortDescription},
        ${data.fullDetails},
        ${data.hasCertification},
        ${data.applyUrl},
        ${data.createdBy || null}
      )
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Update listing
   */
  async updateListing(id: string, data: {
    title: string;
    shortDescription: string;
    fullDetails: string;
    hasCertification: boolean;
    applyUrl: string;
  }) {
    const result = await sql`
      UPDATE listings
      SET 
        title = ${data.title},
        short_description = ${data.shortDescription},
        full_details = ${data.fullDetails},
        has_certification = ${data.hasCertification},
        apply_url = ${data.applyUrl},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Delete listing
   */
  async deleteListing(id: string) {
    await sql`
      DELETE FROM listings WHERE id = ${id}
    `;
    return true;
  },
};
