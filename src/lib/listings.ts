// Default/seed listings
export const defaultListings = [
  {
    id: '1',
    title: 'Vegetable Cultivation',
    shortDescription: 'Learn sustainable farming techniques and modern agricultural practices. Gain hands-on experience with crop management.',
    fullDetails: `## About This Internship

This comprehensive vegetable cultivation internship offers hands-on experience in sustainable farming practices and modern agricultural techniques.

### What You'll Learn:
- Sustainable farming methods
- Crop rotation and soil management
- Organic pest control
- Harvest and post-harvest handling
- Farm-to-market supply chain

### Requirements:
- Interest in agriculture and sustainability
- Physical fitness for outdoor work
- Basic understanding of plant biology (preferred)
- Commitment to 3-month program

### Benefits:
- Industry certification upon completion
- Hands-on experience with modern farming equipment
- Mentorship from experienced agronomists
- Potential for full-time employment

### Duration: 3 months
### Location: On-site
### Stipend: Available`,
    hasCertification: true,
    applyUrl: 'https://example.com/apply/vegetable-cultivation',
    createdAt: new Date('2025-01-01').toISOString(),
  },
  {
    id: '2',
    title: 'Web Development Internship',
    shortDescription: 'Learn modern web development with React, Next.js, and TypeScript in a professional environment',
    fullDetails: `## About This Internship

Join our development team and gain practical experience building modern web applications using cutting-edge technologies.

### What You'll Learn:
- React and Next.js development
- TypeScript programming
- RESTful API integration
- Database design and management
- Git and collaborative development

### Requirements:
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of programming fundamentals
- Portfolio of personal projects (preferred)
- Available for full-time internship

### Benefits:
- Industry-recognized certification
- Work on real client projects
- Code reviews and mentorship
- Modern tech stack experience

### Duration: 6 months
### Location: Remote/Hybrid
### Stipend: Competitive`,
    hasCertification: true,
    applyUrl: 'https://example.com/apply/web-development',
    createdAt: new Date('2025-01-02').toISOString(),
  },
  {
    id: '3',
    title: 'Mobile App Development',
    shortDescription: 'Build mobile applications using React Native and gain hands-on experience with real projects',
    fullDetails: `## About This Project

Work on exciting mobile app projects using React Native and gain experience in cross-platform mobile development.

### What You'll Learn:
- React Native development
- iOS and Android app deployment
- Mobile UI/UX best practices
- App performance optimization
- Mobile-specific APIs and features

### Requirements:
- JavaScript/TypeScript knowledge
- Understanding of React (preferred)
- Own a smartphone for testing
- 4-month availability

### Benefits:
- Published apps in your portfolio
- Exposure to mobile development lifecycle
- Flexible working hours

### Duration: 4 months
### Location: Remote
### Stipend: TBD`,
    hasCertification: false,
    applyUrl: 'https://example.com/apply/mobile-app',
    createdAt: new Date('2025-01-03').toISOString(),
  },
];

// Get all listings from localStorage or use defaults
export function getAllListings() {
  if (typeof window === 'undefined') return defaultListings;
  
  const stored = localStorage.getItem('internship_listings');
  if (stored) {
    try {
      const listings = JSON.parse(stored);
      return listings.length > 0 ? listings : defaultListings;
    } catch {
      return defaultListings;
    }
  }
  
  // Initialize with default listings
  localStorage.setItem('internship_listings', JSON.stringify(defaultListings));
  return defaultListings;
}

// Get single listing by ID
export function getListingById(id: string) {
  const listings = getAllListings();
  return listings.find((l: any) => l.id === id);
}
