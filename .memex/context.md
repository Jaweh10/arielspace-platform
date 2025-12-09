# ArielSpace Platform - Project Rules & Conventions

## Project Overview
**ArielSpace** - Internship and project listing platform with authentication, admin dashboard, and role-based access control.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v3
- **Styling**: Tailwind CSS v3 (NOT v4 - causes lightningcss issues)
- **Font**: Inter (Google Fonts)
- **State Management**: React Context API (AuthContext)
- **Data Storage**: localStorage (client-side, max 30 listings)
- **Hosting**: Netlify (deployment target)

## Design System (Minimalist B2B Professional)
- **Primary Colors**: 
  - Blue: `#2563eb` (blue-600) - primary actions
  - Green: `#10b981` (green-600) - success, certifications
  - Slate: `#0f172a` to `#f8fafc` - text and backgrounds
- **Typography**: Inter font family, weights 400/500/600/700
- **Responsive Breakpoints**: sm:640px, md:768px, lg:1024px
- **Component Style**: Rounded corners (8px), shadows (md), clean spacing

## Authentication System

### Role-Based Access Control
```typescript
// User Roles
type Role = 'user' | 'admin';

// Admin Emails (hardcoded in AuthContext.tsx)
const adminEmails = [
  'admin@arielspace.com',
  'admin@example.com'
];
```

### Session Management
- **Timeout**: 5 minutes of inactivity
- **Warning**: Shows at 4 minutes (60-second countdown)
- **Activity Tracking**: mousedown, keydown, scroll, touchstart, click events
- **Storage**: `localStorage` for user data and `lastActivity` timestamp

### Authentication Flow
1. User signs up/logs in
2. System checks if email is in admin list
3. Assigns role: 'admin' or 'user'
4. Stores in localStorage with session tracking
5. Auto-logout after 5 minutes of inactivity

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage (shows first 3 listings)
│   ├── explore/page.tsx            # All listings page
│   ├── auth/
│   │   ├── login/page.tsx          # Email + password login
│   │   └── signup/page.tsx         # Full signup form (6 fields + terms)
│   ├── profile/page.tsx            # User profile (auth required)
│   ├── listings/[id]/page.tsx      # Listing details (auth required)
│   └── admin/                      # Admin dashboard (admin role required)
│       ├── page.tsx                # Dashboard overview
│       ├── listings/new/page.tsx   # Add listing form
│       └── listings/[id]/edit/page.tsx  # Edit listing form
├── components/
│   ├── Navbar.tsx                  # Role-aware navigation
│   ├── ListingCard.tsx             # Listing card with auth check
│   ├── SessionWarning.tsx          # Timeout warning modal
│   └── WelcomeMessage.tsx          # Post-login greeting
├── contexts/
│   └── AuthContext.tsx             # Authentication & session management
└── lib/
    └── listings.ts                 # Data utilities (localStorage)
```

## Data Model

### User Object
```typescript
interface User {
  id: string;              // Timestamp-based ID
  email: string;
  name: string;            // First + Last name
  role: 'user' | 'admin';
}
```

### Listing Object
```typescript
interface Listing {
  id: string;              // Timestamp-based ID
  title: string;
  shortDescription: string;     // Max 200 chars, shown on cards
  fullDetails: string;          // Full markdown-style description
  hasCertification: boolean;
  applyUrl: string;            // External application link
  createdAt: string;           // ISO timestamp
}
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

## Data Management

### localStorage Keys
- `user` - Current user object
- `lastActivity` - Timestamp for session timeout
- `internship_listings` - Array of all listings (max 30)

### Listing CRUD Operations
```typescript
// Get all listings
const listings = JSON.parse(localStorage.getItem('internship_listings') || '[]');

// Add listing
listings.push(newListing);
localStorage.setItem('internship_listings', JSON.stringify(listings));

// Update listing
const index = listings.findIndex(l => l.id === id);
listings[index] = updatedListing;
localStorage.setItem('internship_listings', JSON.stringify(listings));

// Delete listing
const filtered = listings.filter(l => l.id !== id);
localStorage.setItem('internship_listings', JSON.stringify(filtered));
```

## Form Validation Rules

### Signup Form Requirements
- First Name: Required
- Last Name: Required
- Email: Valid email format
- Phone: Min 10 characters, accepts +()- and spaces
- Password: Min 6 characters
- Confirm Password: Must match password
- Terms: Must be checked

### Listing Form Requirements
- Title: Min 3 characters
- Short Description: Min 20 characters, max 200 characters
- Full Details: Min 50 characters
- Apply URL: Valid URL format
- Certification: Boolean (checkbox)

## UI Patterns

### Modal/Overlay Pattern
```typescript
// Session Warning Modal
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-scale-in">
    {/* Content */}
  </div>
</div>
```

### Dropdown Menu Pattern
```typescript
// User menu in navbar
const [showUserMenu, setShowUserMenu] = useState(false);
<div className="relative">
  <button onClick={() => setShowUserMenu(!showUserMenu)}>
  {showUserMenu && (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg">
      {/* Menu items */}
    </div>
  )}
</div>
```

## Deployment Considerations

### Known Issues
1. **Windows Lock File**: `package-lock.json` generated on Windows contains `@next/swc-win32-x64-msvc` which fails on Linux (Netlify)
   - **Solution**: Delete `package-lock.json` before deploying to Netlify
   - Netlify will generate Linux-compatible lock file

2. **localStorage Limitation**: Data is client-side only
   - Each user/browser has separate data
   - Listings added by admin won't show to other users
   - **Future upgrade**: Migrate to Turso/PostgreSQL for global persistence

### Deployment Steps (Netlify)
1. Remove `package-lock.json` from git
2. Commit and push to GitHub
3. Deploy via Netlify (auto-detects Next.js)
4. Build command: `npm run build`
5. Publish directory: `.next`

## Environment Variables (Future)
```
NODE_ENV=production
TURSO_DATABASE_URL=          # When migrating from localStorage
TURSO_AUTH_TOKEN=            # When migrating from localStorage
```

## Code Conventions

### Component Structure
- Use 'use client' directive for interactive components
- TypeScript interfaces at top of file
- Export default at bottom
- Group imports: React → Next.js → Components → Utilities

### Naming Conventions
- Components: PascalCase (Navbar.tsx)
- Utilities: camelCase (listings.ts)
- Pages: lowercase folders (auth/login/page.tsx)
- CSS classes: Tailwind utility classes only

### Error Handling
- Show user-friendly alerts for denied access
- Display inline error messages in forms
- Redirect to login when authentication fails
- Clear error states after successful actions

## Testing Accounts

### Admin Access
- Email: `admin@arielspace.com` or `admin@example.com`
- Password: Any (6+ characters)
- Access: Full admin dashboard

### Regular User
- Email: Any email except admin emails
- Password: Any (6+ characters)
- Access: View and apply to listings only

## Performance Notes
- First 3 listings shown on homepage (performance)
- All listings shown on /explore page
- Client-side search/filter (fast for <30 listings)
- Session timeout prevents memory leaks from event listeners

## Future Enhancements (Documented for later)
1. Replace localStorage with Turso database
2. Implement real email OTP via Resend
3. Add Google AdSense (currently placeholder)
4. User application tracking/history
5. Email notifications for new listings
6. Advanced filtering (tags, location, date)
7. Analytics dashboard for admins