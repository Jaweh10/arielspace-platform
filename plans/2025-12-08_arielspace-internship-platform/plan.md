# Spec Provenance

**User Request**: Build ArielSpace internship/project listing platform with auth-gated applications, admin-controlled content, search functionality, Google AdSense integration, and responsive design for both mobile and desktop.

**Date**: 2025-12-08

**Requirements Gathering**:
- Smallest scope: Full MVP with working authentication, database for listings, admin panel, ads integration, and user profiles
- Content management: Admin-only control via dashboard (full quality control)
- Revenue model: Google AdSense embedded in sidebar (external revenue)
- Responsive: Mobile-first design that looks professional on both phones and laptops

---

# Spec Header

## Name
**ArielSpace** - Internship and Project Listing Platform with Certification

## Smallest Acceptable Scope
A fully functional web application where:
- **Public users** can browse internship/project cards (title, short description, certification badge)
- **Search** filters listings by keywords in real-time
- **Auth wall**: Clicking "Apply Now" requires email OTP login/signup before viewing full details
- **Admin dashboard** allows creating, editing, and deleting internship/project listings
- **Google AdSense** displays in sidebar for revenue generation
- **Responsive design** works seamlessly on mobile phones and laptops

## Non-Goals (Defer to Later)
- User profiles with saved applications or history
- Company/organization accounts posting their own listings
- Advanced filtering (location, date range, category tags)
- Notification system for new listings
- Application tracking or status updates
- Rating/review system for internships
- Social sharing features

---

# Paths to Supplementary Guidelines

**Tech Stack**:
- https://raw.githubusercontent.com/memextech/templates/refs/heads/main/stack/fullstack_app.md

**Design** (choose one during implementation based on preference):
- https://raw.githubusercontent.com/memextech/templates/refs/heads/main/design/minimalist-b2b-professional.md (recommended for professional clarity)
- https://raw.githubusercontent.com/memextech/templates/refs/heads/main/design/dark-modern-professional.md (alternative for modern aesthetic)

---

# Decision Snapshot

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Auth Strategy** | Email OTP via Better Auth + Resend | Passwordless = less friction; follows fullstack_app.md guideline |
| **Database** | Turso (SQLite) | Lightweight, perfect for structured listing data; serverless-friendly |
| **Hosting** | Netlify | Zero-config deployment with edge functions; follows PaaS-first principle |
| **Frontend** | Next.js 15 (App Router) + Tailwind CSS | Server components + built-in routing; Tailwind for rapid responsive design |
| **Ads** | Google AdSense | Third-party handles ad serving and revenue; simple script integration |
| **Content Control** | Admin-only CRUD | Simplest approach; admin dashboard with protected routes |
| **Search** | Client-side filtering | Fast enough for MVP; no search infrastructure needed |

---

# Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                      PUBLIC ROUTES                           │
│  / (Homepage: Hero, Search Bar, Listing Cards)              │
│  /about, /contact (Static pages)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Click "Apply Now"
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AUTH WALL (Email OTP)                     │
│  /auth/login → Enter email → Receive OTP → Verify           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   PROTECTED ROUTES                           │
│  /listings/[id] (Full internship details, apply button)     │
│  /admin/* (Admin dashboard - role-based access)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Netlify)                        │
│  /api/listings (GET: fetch all, POST: create [admin])       │
│  /api/listings/[id] (GET, PUT, DELETE [admin])              │
│  /api/auth/* (Better Auth endpoints)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (Turso SQLite)                    │
│  - users (id, email, role, created_at)                      │
│  - listings (id, title, description, certification,          │
│              full_details, created_at, updated_at)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SIDEBAR (All Pages)                       │
│  Google AdSense script embedded (responsive ad units)       │
└─────────────────────────────────────────────────────────────┘
```

---

# Implementation Plan

## Phase 1: Project Scaffolding & Database Setup (Local Development)

### 1.1 Initialize Next.js Project
```bash
npx create-next-app@latest arielspace --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd arielspace
npm install @libsql/client drizzle-orm @netlify/functions uuid @types/uuid dotenv
npm install -D drizzle-kit
npm install -g netlify-cli
brew install tursodatabase/tap/turso  # macOS
```

### 1.2 Setup Turso Local Development
```bash
turso dev --db-file dev.db --port 8080
# Keep this running in a separate terminal
```

### 1.3 Define Database Schema
**File**: `src/db/schema.ts`
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('user'), // 'user' or 'admin'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const listings = sqliteTable('listings', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  shortDescription: text('short_description').notNull(),
  fullDetails: text('full_details').notNull(),
  hasCertification: integer('has_certification', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

**File**: `drizzle.config.ts`
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || 'http://127.0.0.1:8080',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
```

### 1.4 Push Schema & Seed Admin User
```bash
npx drizzle-kit push
```

Create seed script to add first admin user (run after first OTP login).

---

## Phase 2: Authentication with Better Auth + Email OTP

### 2.1 Setup Better Auth Configuration
**File**: `src/lib/auth.ts`
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(tursoClient);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Use Resend to send OTP email
      // In development: log OTP to console
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP for ${user.email}: ${url}`);
      }
    },
  },
});
```

### 2.2 Create Auth API Routes
**File**: `netlify/functions/auth.ts`
```typescript
import type { Handler } from '@netlify/functions';
import { auth } from '../../src/lib/auth';

export const handler: Handler = async (event, context) => {
  return auth.handler(event);
};
```

### 2.3 Build Login/Signup UI
**File**: `src/app/auth/login/page.tsx`
- Form with email input
- OTP verification input (appears after email submission)
- Auto-redirect to original "Apply Now" listing after successful auth
- Tailwind styling: clean, centered card design

---

## Phase 3: Public Homepage & Listing Display

### 3.1 Homepage Layout
**File**: `src/app/page.tsx`

**Components**:
1. **Header/Navbar**: 
   - Logo "ArielSpace" (left)
   - Links: Home, About, Contact (center)
   - Sign-In button (right, only if not logged in)
   - Sticky on scroll

2. **Hero Section**:
   - Large headline: "Launch Your Development And Growth with ArielSpace"
   - Subtext: "Explore Internship, Projects in your region with certification"
   - Search bar (prominent, centered)
   - Background: soft gradient (use design guideline colors)

3. **Search Bar**:
   - Input field with placeholder "Search internships and projects..."
   - "Search" button (green, matches design)
   - Client-side filtering of listings array

4. **Listings Grid**:
   - Display 3 cards per row (desktop), 1 per row (mobile)
   - Each card shows:
     - Title (e.g., "Vegetable Cultivation")
     - Short description (truncated at 100 chars)
     - Certification badge (if `hasCertification === true`)
     - "Apply Now" button (triggers auth check)
   - Use Tailwind grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

5. **Sidebar (AdSense)**:
   - Fixed position on desktop (right side, 300px wide)
   - Hidden on mobile (or move to bottom)
   - Google AdSense responsive ad unit

6. **Footer**:
   - "Join our community" section with social links (Email, Facebook, Twitter, LinkedIn)
   - "Where to?" links (placeholder for now)
   - Copyright notice

### 3.2 Responsive Design Rules
- Mobile-first approach: start with single-column layout
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`
- Hero text scales down on mobile
- Search bar full-width on mobile, max-width on desktop
- Cards stack vertically on mobile, grid on desktop
- Sidebar hidden on mobile (use `hidden lg:block`)

### 3.3 Fetch Listings from API
**File**: `netlify/functions/listings.ts`
```typescript
import type { Handler } from '@netlify/functions';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/http';
import { listings } from '../../src/db/schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'GET') {
    const allListings = await db.select().from(listings);
    return {
      statusCode: 200,
      body: JSON.stringify(allListings),
      headers: { 'Content-Type': 'application/json' },
    };
  }
  
  // POST handled in Phase 4 (admin only)
  return { statusCode: 405, body: 'Method Not Allowed' };
};
```

**Client-side fetch** in `page.tsx`:
```typescript
const [listings, setListings] = useState([]);

useEffect(() => {
  fetch('/api/listings')
    .then(res => res.json())
    .then(data => setListings(data));
}, []);
```

---

## Phase 4: Auth-Gated Listing Details

### 4.1 Protected Route Middleware
**File**: `src/middleware.ts`
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  
  if (request.nextUrl.pathname.startsWith('/listings/') && !token) {
    // Redirect to login, preserve intended destination
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (request.nextUrl.pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/listings/:path*', '/admin/:path*'],
};
```

### 4.2 Listing Detail Page
**File**: `src/app/listings/[id]/page.tsx`

**Layout**:
- Full listing title (large heading)
- Certification badge (if applicable)
- Full details (markdown-formatted text)
- Primary CTA: "Submit Application" button (for MVP, this can be a form or external link)
- Secondary: "Back to Listings" link

**API Endpoint** for single listing:
**File**: `netlify/functions/listings/[id].ts`
```typescript
export const handler: Handler = async (event) => {
  const listingId = event.path.split('/').pop();
  
  if (event.httpMethod === 'GET') {
    const listing = await db.select().from(listings).where(eq(listings.id, listingId)).get();
    return {
      statusCode: 200,
      body: JSON.stringify(listing),
    };
  }
  
  // PUT/DELETE in Phase 5 (admin only)
};
```

---

## Phase 5: Admin Dashboard

### 5.1 Admin Route Protection
- Check user role in middleware (extend Phase 4.1)
- Query user's role from database using auth token
- Only users with `role: 'admin'` can access `/admin/*`

### 5.2 Admin Layout
**File**: `src/app/admin/layout.tsx`
- Sidebar navigation: Dashboard, Listings, Add New
- Logout button
- Responsive: hamburger menu on mobile

### 5.3 Admin Listings Management
**File**: `src/app/admin/listings/page.tsx`

**Features**:
- Table view of all listings (title, created date, actions)
- Actions per row: Edit (link to edit form), Delete (with confirmation modal)
- "Add New Listing" button (top-right)

**File**: `src/app/admin/listings/new/page.tsx`
- Form fields:
  - Title (text input)
  - Short Description (textarea, 200 char limit)
  - Full Details (rich textarea or markdown editor)
  - Has Certification (checkbox)
- Submit button → POST to `/api/listings`

**File**: `src/app/admin/listings/[id]/edit/page.tsx`
- Same form as "new" but pre-filled with existing data
- Submit button → PUT to `/api/listings/[id]`

### 5.4 Admin API Endpoints

**POST /api/listings** (create new):
```typescript
if (event.httpMethod === 'POST') {
  // Verify admin role from auth token
  const body = JSON.parse(event.body);
  const newListing = await db.insert(listings).values({
    id: uuid(),
    title: body.title,
    shortDescription: body.shortDescription,
    fullDetails: body.fullDetails,
    hasCertification: body.hasCertification,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { statusCode: 201, body: JSON.stringify(newListing) };
}
```

**PUT /api/listings/[id]** (update):
```typescript
if (event.httpMethod === 'PUT') {
  // Verify admin role
  const body = JSON.parse(event.body);
  await db.update(listings).set({
    title: body.title,
    shortDescription: body.shortDescription,
    fullDetails: body.fullDetails,
    hasCertification: body.hasCertification,
    updatedAt: new Date(),
  }).where(eq(listings.id, listingId));
  return { statusCode: 200, body: 'Updated' };
}
```

**DELETE /api/listings/[id]** (delete):
```typescript
if (event.httpMethod === 'DELETE') {
  // Verify admin role
  await db.delete(listings).where(eq(listings.id, listingId));
  return { statusCode: 204 };
}
```

---

## Phase 6: Google AdSense Integration

### 6.1 Sign Up for AdSense
- Create Google AdSense account at https://www.google.com/adsense/
- Submit site for approval (may take 1-2 weeks)
- During review: use AdSense placeholder or demo ad units

### 6.2 Add AdSense Script to Layout
**File**: `src/app/layout.tsx`

Add to `<head>`:
```tsx
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

### 6.3 Create Sidebar Ad Component
**File**: `src/components/AdSidebar.tsx`
```tsx
export default function AdSidebar() {
  return (
    <aside className="hidden lg:block w-80 sticky top-20 h-fit">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot="YYYYYYYYYY"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </aside>
  );
}
```

**Placement**:
- Render `<AdSidebar />` in main layout alongside content
- Use flexbox: `<div className="flex gap-8"><main>...</main><AdSidebar /></div>`

---

## Phase 7: Search Functionality

### 7.1 Client-Side Search Implementation
**File**: `src/components/SearchBar.tsx`

```tsx
'use client';
import { useState } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSearch} className="flex items-center max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search internships and projects..."
        className="flex-1 px-6 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:border-green-500"
      />
      <button
        type="submit"
        className="px-8 py-3 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition"
      >
        Search
      </button>
    </form>
  );
}
```

**Filter logic in homepage**:
```tsx
const [filteredListings, setFilteredListings] = useState(listings);

const handleSearch = (query: string) => {
  const filtered = listings.filter(listing =>
    listing.title.toLowerCase().includes(query.toLowerCase()) ||
    listing.shortDescription.toLowerCase().includes(query.toLowerCase())
  );
  setFilteredListings(filtered);
};
```

---

## Phase 8: Polish & Responsiveness

### 8.1 Mobile-First Checklist
- [ ] Header collapses to hamburger menu on mobile
- [ ] Hero text scales appropriately (use `text-4xl md:text-6xl`)
- [ ] Search bar full-width on mobile
- [ ] Listing cards stack vertically (1 column)
- [ ] AdSense sidebar hidden on mobile (use bottom banner instead)
- [ ] Footer links stack vertically on mobile
- [ ] Admin dashboard sidebar becomes top navbar on mobile

### 8.2 Design System
Follow chosen design guideline (minimalist-b2b-professional.md recommended):
- Color palette: Primary green (from mockup), neutral grays, white backgrounds
- Typography: Clean sans-serif (e.g., Inter, Poppins)
- Spacing: Consistent padding/margins using Tailwind scale (4, 6, 8, 12)
- Shadows: Subtle card shadows (`shadow-md`)
- Hover states: Button color shifts, card lift effects

### 8.3 Loading States
- Skeleton loaders for listing cards while fetching
- Loading spinner on auth submission
- Disabled button states during form submission

---

# Verification & Demo Script

## Local Testing (Before Production)

### 1. Development Environment
```bash
# Terminal 1: Start Turso local
turso dev --db-file dev.db --port 8080

# Terminal 2: Start Netlify dev server
netlify dev
# App runs at http://localhost:8888
```

### 2. Test Authentication Flow
- [ ] Navigate to homepage at `http://localhost:8888`
- [ ] Click any "Apply Now" button (should redirect to `/auth/login`)
- [ ] Enter email address (use any valid format)
- [ ] Check console for OTP code (development mode)
- [ ] Enter OTP code, verify successful login
- [ ] Confirm redirect to intended listing detail page
- [ ] Verify "Apply Now" button now accessible without auth prompt

### 3. Test Admin Dashboard
**Setup first admin**:
```bash
# After first login, manually update user role in database
turso db shell dev.db
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

- [ ] Navigate to `/admin` (should be accessible)
- [ ] Click "Add New Listing" and create test internship
- [ ] Verify new listing appears on homepage
- [ ] Edit existing listing, confirm changes save
- [ ] Delete listing (with confirmation modal)
- [ ] Verify deleted listing removed from homepage

### 4. Test Search
- [ ] Enter keyword in search bar (e.g., "Vegetable")
- [ ] Verify filtered results display only matching listings
- [ ] Clear search, confirm all listings return

### 5. Responsive Testing
- [ ] Resize browser to mobile width (375px)
- [ ] Check header collapses to hamburger menu
- [ ] Verify cards stack in single column
- [ ] Test search bar full-width
- [ ] Confirm sidebar hidden on mobile
- [ ] Test on actual mobile device (optional but recommended)

### 6. AdSense Placeholder
- [ ] Verify sidebar shows placeholder ad unit on desktop
- [ ] Check ad unit hidden on mobile breakpoints

---

## Production Demo Script (Post-Deployment)

### Deploy Checklist First:
- [ ] Create production Turso database
- [ ] Generate production auth token
- [ ] Get Resend API key
- [ ] Set environment variables in Netlify
- [ ] Deploy via `netlify deploy --prod`

### Demo Flow:
1. **Public User Journey**:
   - Visit homepage on laptop and phone
   - Browse listing cards
   - Use search to filter
   - Click "Apply Now" → auth wall triggers
   - Complete email OTP flow
   - View full listing details

2. **Admin Journey**:
   - Login as admin
   - Navigate to `/admin`
   - Create 2-3 sample internships (diverse titles)
   - Edit one listing
   - Return to homepage, verify changes live

3. **AdSense Verification**:
   - Confirm AdSense script loads (check browser DevTools Network tab)
   - Verify no console errors related to ads
   - Check ad unit displays (or placeholder if not yet approved)

---

# Deploy

## Pre-Deployment Checklist

### 1. Environment Variables Needed
```bash
# Turso Production Database
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-production-token

# Resend (for OTP emails)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx

# Better Auth
AUTH_SECRET=generate-random-secret-here

# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXX
```

### 2. Create Production Database
```bash
# Create new Turso database
turso db create arielspace-prod

# Generate production token
turso db tokens create arielspace-prod

# Push schema to production
TURSO_DATABASE_URL=$(turso db show arielspace-prod --url) \
TURSO_AUTH_TOKEN=$(turso db tokens create arielspace-prod) \
npx drizzle-kit push
```

### 3. Get Resend API Key
- Sign up at https://resend.com
- Create API key from dashboard
- Configure sender email (use `onboarding@resend.dev` for testing)

---

## Netlify Deployment

### 1. Initialize Netlify Project
```bash
netlify init
# Follow prompts:
# - Create new site
# - Name: arielspace
# - Build command: npm run build
# - Publish directory: .next
```

### 2. Set Environment Variables
```bash
netlify env:set TURSO_DATABASE_URL "libsql://arielspace-prod.turso.io"
netlify env:set TURSO_AUTH_TOKEN "your-production-token"
netlify env:set RESEND_API_KEY "re_xxxxxxxxxxxxx"
netlify env:set AUTH_SECRET "your-random-secret"
netlify env:set NEXT_PUBLIC_ADSENSE_CLIENT "ca-pub-XXXXXXXXXX"
```

### 3. Deploy to Production
```bash
# Deploy
netlify deploy --prod

# Note the deployment URL (e.g., https://arielspace.netlify.app)
```

### 4. Post-Deployment Tasks
- [ ] Visit deployed site, verify homepage loads
- [ ] Test auth flow with real email (check inbox for OTP)
- [ ] Create first admin user (manually update role in production DB)
- [ ] Login as admin, create 3-5 real internship listings
- [ ] Submit site to Google AdSense for approval (if not already done)
- [ ] Configure custom domain (optional: e.g., arielspace.com)

---

## Custom Domain Setup (Optional)

### 1. Purchase Domain
- Recommended: Namecheap, Cloudflare, or Google Domains

### 2. Configure DNS
In Netlify dashboard:
- Go to Domain settings
- Add custom domain (e.g., `arielspace.com`)
- Follow DNS instructions (add A record or CNAME)

### 3. Enable HTTPS
- Netlify auto-provisions SSL certificate (Let's Encrypt)
- Verify HTTPS works after DNS propagation (up to 24 hours)

---

## Monitoring & Maintenance

### Post-Launch Checklist
- [ ] Monitor Netlify analytics for traffic
- [ ] Check Turso database usage (free tier: 10GB storage, 1B row reads/month)
- [ ] Review AdSense earnings dashboard weekly
- [ ] Monitor auth email delivery rate in Resend dashboard
- [ ] Set up error tracking (optional: Sentry integration)

### Regular Tasks
- **Weekly**: Review new internship submissions (if adding external submissions later)
- **Monthly**: Check database size, optimize queries if needed
- **Quarterly**: Review AdSense performance, adjust ad placements if needed

---

## Success Metrics

**MVP Success Criteria**:
- [ ] 10+ internship listings live
- [ ] 50+ user signups in first month
- [ ] 100+ "Apply Now" clicks
- [ ] AdSense approved and serving ads
- [ ] Zero auth-related errors in logs
- [ ] <2s page load time (mobile)
- [ ] Responsive design works on iPhone, Android, laptop

**Next Phase Ideas** (post-MVP):
- User application history/dashboard
- Email notifications for new listings
- Category/tag filtering system
- Application status tracking
- Company accounts for self-service posting
- Analytics dashboard for admin (popular listings, conversion rates)

---

**End of Plan** 🚀