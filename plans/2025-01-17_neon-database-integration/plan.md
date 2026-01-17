# Neon Database Integration Plan

**Created:** 2025-01-17  
**Goal:** Connect ArielSpace platform to Neon PostgreSQL and implement proper authentication with database verification

## Problem Statement

Currently, the login and signup functions are not connected to any database:
- Login accepts ANY credentials (demo mode)
- Signup doesn't save user data to database
- Listings still use localStorage instead of database
- No database connection to Neon PostgreSQL
- Security vulnerability: anyone can login without registration

## Solution Overview

Integrate Neon PostgreSQL database with proper authentication flow:
1. Set up Neon database connection
2. Create database schema (users, listings tables)
3. Implement API routes for authentication
4. Update login page to verify against database
5. Update signup page to save to database
6. Migrate listings from localStorage to database

## Tech Stack

- **Database:** Neon PostgreSQL (serverless)
- **Database Client:** `@neondatabase/serverless` or `pg`
- **Password Hashing:** `bcrypt` or `bcryptjs`
- **Environment:** `.env.local` for local dev, Netlify env vars for production

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Listings Table
```sql
CREATE TABLE listings (
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
```

## Implementation Phases

### Phase 1: Database Setup [P1]
- [P1-1] Install required packages (`@neondatabase/serverless`, `bcryptjs`)
- [P1-2] Update `.env.local` with Neon database URL
- [P1-3] Create `src/lib/db.ts` - database connection utility
- [P1-4] Create database migration script to set up tables

### Phase 2: Authentication API [P2]
- [P2-1] Create `src/app/api/auth/signup/route.ts` - handles user registration
- [P2-2] Create `src/app/api/auth/login/route.ts` - handles user login with DB verification
- [P2-3] Update AuthContext to handle API responses and errors

### Phase 3: Update Auth Pages [P3]
- [P3-1] Update login page to call `/api/auth/login` and show proper errors
- [P3-2] Update signup page to call `/api/auth/signup` and handle DB errors
- [P3-3] Add loading states and error handling

### Phase 4: Listings Database Migration [P4]
- [P4-1] Create `src/lib/listings-db.ts` with database CRUD operations
- [P4-2] Create seed script to migrate localStorage listings to database
- [P4-3] Update all pages to use database listings instead of localStorage

### Phase 5: Admin Functionality [P5]
- [P5-1] Update admin dashboard to check user role from database
- [P5-2] Update listing create/edit pages to save to database
- [P5-3] Create admin seeding script (create initial admin user)

### Phase 6: Testing & Deployment [P6]
- [P6-1] Test complete auth flow (signup, login, logout)
- [P6-2] Test listing CRUD operations
- [P6-3] Update Netlify environment variables with Neon URL
- [P6-4] Deploy and verify production

## Authentication Flow

### Signup Flow
1. User fills signup form
2. Frontend validates inputs
3. POST to `/api/auth/signup`
4. API checks if email exists in database
5. If new: hash password, insert user into database
6. Return user data (without password hash)
7. Frontend logs user in via AuthContext

### Login Flow
1. User enters email + password
2. POST to `/api/auth/login`
3. API queries database for user by email
4. If not found: return error "User not found"
5. If found: compare password with bcrypt
6. If match: check if admin email, return user data with role
7. If no match: return error "Invalid password"
8. Frontend logs user in via AuthContext

### Admin Login (Special Case)
- Email: `admin@arielspace.com`
- Password: `$+davfil98+$` (hardcoded, bypasses bcrypt)
- Role: `admin` (set automatically)

## Security Considerations

- Passwords hashed with bcrypt (10 rounds)
- Admin password hardcoded for special access
- SQL injection prevented by parameterized queries
- Environment variables never exposed to client
- Session timeout remains at 5 minutes
- HTTPS enforced by Netlify

## File Structure

```
src/
├── lib/
│   ├── db.ts                       # Neon connection utility
│   └── listings-db.ts              # Listing CRUD operations
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── signup/route.ts     # Signup API
│   │       └── login/route.ts      # Login API
│   ├── auth/
│   │   ├── login/page.tsx          # Updated login page
│   │   └── signup/page.tsx         # Updated signup page
│   └── admin/
│       └── listings/
│           └── new/page.tsx        # Updated to save to DB
└── scripts/
    ├── migrate-db.ts               # Database schema setup
    └── seed-admin.ts               # Create initial admin user
```

## Environment Variables

### Local Development (`.env.local`)
```bash
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
ADMIN_EMAIL=admin@arielspace.com
ADMIN_PASSWORD=$+davfil98+$
NODE_ENV=development
```

### Netlify Production
Same variables set in Netlify dashboard under Environment Variables

## Success Criteria

- [ ] User cannot login without registered account
- [ ] Signup creates user in database
- [ ] Login verifies credentials against database
- [ ] Admin login works with hardcoded password
- [ ] Listings stored in database (not localStorage)
- [ ] Admin can create/edit/delete listings in database
- [ ] Deployment successful with Neon connection
- [ ] All auth flows tested and working

## Rollback Plan

If database integration fails:
1. Keep current localStorage implementation as backup
2. Environment variable to switch between localStorage/database
3. Test thoroughly in development before deploying

## Next Steps

1. Get Neon database connection string from user
2. Start with Phase 1: Database setup
3. Proceed sequentially through phases
4. Test each phase before moving to next
