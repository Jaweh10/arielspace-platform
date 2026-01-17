# ArielSpace Platform - Project Rules & Conventions

## Project Overview
**ArielSpace** - Internship and project listing platform with authentication, admin dashboard, and role-based access control.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v3
- **Styling**: Tailwind CSS v3 (NOT v4 - causes lightningcss issues)
- **Font**: Inter (Google Fonts)
- **State Management**: React Context API (AuthContext)
- **Database**: Neon PostgreSQL (migrating from localStorage)
- **Hosting**: Netlify (successfully deployed)

## Design System (Minimalist B2B Professional)
- **Primary Colors**: 
  - Blue: `#2563eb` (blue-600) - primary actions
  - Green: `#10b981` (green-600) - success, certifications
  - Slate: `#0f172a` to `#f8fafc` - text and backgrounds
- **Typography**: Inter font family, weights 400/500/600/700
- **Responsive Breakpoints**: sm:640px, md:768px, lg:1024px
- **Component Style**: Rounded corners (8px), shadows (md), clean spacing

## Authentication System

### Admin Credentials
```typescript
// Admin accounts with hardcoded credentials
const adminCredentials = {
  email: 'admin@arielspace.com',
  password: '$+davfil98+$'  // Fixed admin password
};

// Additional admin emails can be added
const adminEmails = [
  'admin@arielspace.com',
  'admin@example.com'
];
```

### Authentication Requirements
- **Login**: Only users with accounts in database can login
- **Signup**: Creates new user record in database
- **Admin Access**: Specific admin email with hardcoded password
- **Role Assignment**: Automatic based on email address

### Session Management
- **Timeout**: 5 minutes of inactivity
- **Warning**: Shows at 4 minutes (60-second countdown)
- **Activity Tracking**: mousedown, keydown, scroll, touchstart, click events
- **Storage**: Database for user data, localStorage for session tracking

### Authentication Flow
1. User attempts login with email/password
2. System checks database for existing user
3. Verifies password hash (or admin hardcoded password)
4. Checks if email is in admin list
5. Assigns role: 'admin' or 'user'
6. Creates session with 5-minute timeout

## Database Schema (Neon PostgreSQL)

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

### Sessions Table (optional for advanced session management)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage (shows first 3 listings from DB)
│   ├── explore/page.tsx            # All listings page (from DB)
│   ├── auth/
│   │   ├── login/page.tsx          # Email + password login (DB verification)
│   │   └── signup/page.tsx         # Full signup form (creates DB record)
│   ├── profile/page.tsx            # User profile (auth required)
│   ├── listings/[id]/page.tsx      # Listing details (auth required, from DB)
│   └── admin/                      # Admin dashboard (admin role required)
│       ├── page.tsx                # Dashboard overview
│       ├── listings/new/page.tsx   # Add listing form (saves to DB)
│       └── listings/[id]/edit/page.tsx  # Edit listing form (updates DB)
├── components/
│   ├── Navbar.tsx                  # Role-aware navigation
│   ├── ListingCard.tsx             # Listing card with auth check
│   ├── SessionWarning.tsx          # Timeout warning modal
│   └── WelcomeMessage.tsx          # Post-login greeting
├── contexts/
│   └── AuthContext.tsx             # Authentication & session management
├── lib/
│   ├── db.ts                       # Database connection utilities
│   └── listings.ts                 # Listing CRUD operations
└── api/
    ├── auth/
    │   ├── login.ts                # Login endpoint
    │   └── signup.ts               # Signup endpoint
    └── listings/
        ├── index.ts                # Get all listings
        └── [id].ts                 # Get/update/delete listing
```

## Security Patterns

### Route Protection
1. **Public Routes**: /, /explore, /about, /contact, /auth/*
2. **Auth Required**: /profile, /listings/[id]
3. **Admin Only**: /admin, /admin/listings/*

### Admin Check Pattern
```typescript
// In admin pages
const { isAuthenticated, isAdmin } = useAuth();

useEffect(() => {
  if (!isAuthenticated) {
    router.push('/auth/login');
    return;
  }
  if (!isAdmin) {
    alert('Access Denied: You do not have admin privileges.');
    router.push('/');
    return;
  }
}, [isAuthenticated, isAdmin, router]);
```

### Password Security
```typescript
// Use bcrypt for password hashing
import bcrypt from 'bcrypt';

// On signup
const passwordHash = await bcrypt.hash(password, 10);

// On login
const isValid = await bcrypt.compare(password, user.password_hash);

// Exception: Admin password is hardcoded and checked directly
if (email === 'admin@arielspace.com' && password === '$+davfil98+$') {
  // Grant admin access
}
```

### Auth-Gated Links Pattern
```typescript
// In ListingCard.tsx
const handleApplyClick = (e: React.MouseEvent) => {
  if (!isAuthenticated) {
    e.preventDefault();
    sessionStorage.setItem('redirectAfterLogin', `/listings/${id}`);
    router.push('/auth/login');
  }
};
```

## Form Validation Rules

### Signup Form Requirements
- First Name: Required, min 2 characters
- Last Name: Required, min 2 characters
- Email: Valid email format, unique in database
- Phone: Min 10 characters, accepts +()- and spaces
- Password: Min 6 characters
- Confirm Password: Must match password
- Terms: Must be checked

### Login Form Requirements
- Email: Required, must exist in database
- Password: Required, must match hashed password in database
- Exception: Admin email with hardcoded password

### Listing Form Requirements
- Title: Min 3 characters
- Short Description: Min 20 characters, max 200 characters
- Full Details: Min 50 characters
- Apply URL: Valid URL format
- Certification: Boolean (checkbox)

## Deployment Configuration

### Netlify Setup
- **Status**: Successfully deployed
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: 22.x (auto-detected)

### Environment Variables (Netlify)
```bash
# Database Connection
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Admin Credentials
ADMIN_EMAIL=admin@arielspace.com
ADMIN_PASSWORD=$+davfil98+$

# Session Secret (for JWT or session tokens)
SESSION_SECRET=generate-random-secret-here

# Environment
NODE_ENV=production
```

### Known Deployment Issues (RESOLVED)
1. **Windows Lock File**: `package-lock.json` with Windows-specific `@next/swc-win32-x64-msvc` fails on Linux
   - **Solution**: Delete before deploying, Netlify generates Linux-compatible version
   
2. **Drizzle Config Error**: TypeScript error with `driver: "turso"` type
   - **Solution**: Removed drizzle dependencies since using Neon PostgreSQL

3. **Database Dependencies**: Removed unused Turso/Drizzle packages
   - **Solution**: Using `@neondatabase/serverless` or `pg` for PostgreSQL

## Custom Domain Configuration

### DNS Setup Steps
1. **Netlify Dashboard** → Domain settings → Add custom domain
2. **Option A: Netlify DNS** (recommended)
   - Update nameservers at domain registrar
   - Point to Netlify nameservers (provided by Netlify)
   
3. **Option B: Registrar DNS**
   - Add A record: `@` → Netlify IP
   - Add CNAME: `www` → `[site-name].netlify.app`
   
4. **SSL Certificate**: Auto-provisioned by Netlify (Let's Encrypt)

## Code Conventions

### Component Structure
- Use 'use client' directive for interactive components
- TypeScript interfaces at top of file
- Export default at bottom
- Group imports: React → Next.js → Components → Utilities → Types

### Naming Conventions
- Components: PascalCase (Navbar.tsx)
- Utilities: camelCase (listings.ts, db.ts)
- Pages: lowercase folders (auth/login/page.tsx)
- API Routes: RESTful naming (api/listings/[id].ts)
- CSS classes: Tailwind utility classes only

### Error Handling
- Show user-friendly alerts for denied access
- Display inline error messages in forms
- Redirect to login when authentication fails
- Log errors server-side for debugging
- Never expose sensitive error details to client

## Database Migration Notes

### Migration from localStorage to Neon
1. Export existing listings from localStorage (admin tool)
2. Seed initial admin user in database
3. Import listings to database
4. Update all CRUD operations to use database
5. Remove localStorage fallbacks
6. Test authentication flow thoroughly
7. Deploy with database environment variables

### Capacity Limits
- **localStorage**: 30 listings max (removed)
- **Neon Free Tier**: 10GB storage, 100 hours compute/month
- **Neon Paid Tier**: Scalable for production use

## Testing Accounts

### Admin Access
- Email: `admin@arielspace.com`
- Password: `$+davfil98+$` (hardcoded, never hashed)
- Access: Full admin dashboard, manage all listings

### Regular User
- Email: Any email not in admin list
- Password: User-defined (min 6 characters, hashed in DB)
- Access: View and apply to listings only
- Must signup to create account in database

## Performance Notes
- First 3 listings shown on homepage (performance)
- All listings shown on /explore page
- Server-side rendering for listing pages (SEO)
- Client-side search/filter (fast for <100 listings)
- Database connection pooling for efficiency
- Session timeout prevents memory leaks from event listeners

## Security Best Practices
- Passwords hashed with bcrypt (10 rounds)
- SQL injection prevented by parameterized queries
- CSRF protection via SameSite cookies
- HTTPS enforced by Netlify
- Session tokens expire after 5 minutes inactivity
- Admin password hardcoded (not in database for security)
- Environment variables never committed to git

## Future Enhancements
1. Email verification on signup (via Resend)
2. Password reset functionality
3. Multi-factor authentication for admins
4. Advanced admin management (add/remove admins via UI)
5. Application tracking for users
6. Email notifications for new listings
7. Advanced filtering (tags, location, date)
8. Analytics dashboard for admins
9. Rate limiting on API endpoints
10. Audit logs for admin actions