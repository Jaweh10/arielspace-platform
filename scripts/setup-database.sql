-- ArielSpace Platform Database Setup
-- Run this SQL in your Neon database console

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  short_description TEXT NOT NULL,
  full_details TEXT NOT NULL,
  has_certification BOOLEAN DEFAULT false,
  apply_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Insert admin user (password will NOT be hashed - will use hardcoded password check)
-- We'll insert a dummy hash since the hardcoded password check happens first
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('admin@arielspace.com', '$2a$10$dummyhashforplaceholder', 'Admin', 'User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions (if needed)
-- This depends on your Neon setup, usually not needed for Neon free tier

-- Verify tables were created
SELECT 'Users table created' AS status, COUNT(*) AS user_count FROM users;
SELECT 'Listings table created' AS status, COUNT(*) AS listing_count FROM listings;
