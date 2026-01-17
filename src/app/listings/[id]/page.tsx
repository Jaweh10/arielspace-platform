'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

// Keep this as fallback data
const mockListingsData: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Vegetable Cultivation',
    shortDescription: 'Learn sustainable farming techniques and modern agricultural practices.',
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
  },
  '2': {
    id: '2',
    title: 'Web Development Internship',
    shortDescription: 'Learn modern web development with React, Next.js, and TypeScript.',
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
  },
  '3': {
    id: '3',
    title: 'Mobile App Development',
    shortDescription: 'Build mobile applications using React Native.',
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
  },
  '4': {
    id: '4',
    title: 'Digital Marketing Project',
    shortDescription: 'Master social media marketing, SEO, and content strategy.',
    fullDetails: `## About This Project

Learn the fundamentals of digital marketing while working on real client campaigns and building your portfolio.

### What You'll Learn:
- Social media strategy and management
- SEO and content marketing
- Google Analytics and data analysis
- Email marketing campaigns
- Paid advertising (Google Ads, Facebook Ads)

### Requirements:
- Strong written communication skills
- Creative mindset
- Basic understanding of social media platforms
- Available 20+ hours per week

### Benefits:
- Industry certification
- Portfolio of campaign work
- Client interaction experience
- Potential for remote work

### Duration: 3 months
### Location: Hybrid
### Stipend: Performance-based`,
    hasCertification: true,
    applyUrl: 'https://example.com/apply/digital-marketing',
  },
  '5': {
    id: '5',
    title: 'Data Science Internship',
    shortDescription: 'Work with Python, machine learning, and data visualization.',
    fullDetails: `## About This Internship

Dive into the world of data science and machine learning with real-world projects and datasets.

### What You'll Learn:
- Python for data analysis
- Machine learning algorithms
- Data visualization (Matplotlib, Seaborn, Plotly)
- Statistical analysis
- Big data tools and techniques

### Requirements:
- Strong foundation in mathematics and statistics
- Python programming experience
- Familiarity with pandas and NumPy (preferred)
- Bachelor's degree in progress or completed

### Benefits:
- Work with industry-standard tools
- Certification in data science
- Access to cloud computing resources
- Mentorship from senior data scientists

### Duration: 6 months
### Location: Remote
### Stipend: Competitive`,
    hasCertification: true,
    applyUrl: 'https://example.com/apply/data-science',
  },
  '6': {
    id: '6',
    title: 'Graphic Design Project',
    shortDescription: 'Create stunning visuals using Adobe Creative Suite.',
    fullDetails: `## About This Project

Develop your design skills working on diverse projects from branding to digital marketing materials.

### What You'll Learn:
- Adobe Photoshop, Illustrator, InDesign
- Logo and brand identity design
- Print and digital design
- Typography and color theory
- Client presentation skills

### Requirements:
- Portfolio of design work
- Proficiency in at least one Adobe Creative Suite application
- Creative problem-solving skills
- Available 15+ hours per week

### Benefits:
- Diverse portfolio pieces
- Client feedback and iteration experience
- Flexible schedule

### Duration: 3-6 months (flexible)
### Location: Remote
### Stipend: Project-based`,
    hasCertification: false,
    applyUrl: 'https://example.com/apply/graphic-design',
  },
  '7': {
    id: '7',
    title: 'Content Writing Internship',
    shortDescription: 'Develop writing skills across blogs, articles, and social media.',
    fullDetails: `## About This Internship

Sharpen your writing skills while creating content for various industries and platforms.

### What You'll Learn:
- SEO content writing
- Blog and article writing
- Social media copywriting
- Content strategy
- Editorial processes

### Requirements:
- Excellent written English
- Research skills
- Attention to detail
- Portfolio of writing samples (preferred)

### Benefits:
- Published work in your portfolio
- Industry certification
- Feedback from professional editors
- Byline opportunities

### Duration: 3 months
### Location: Remote
### Stipend: Per article`,
    hasCertification: true,
    applyUrl: 'https://example.com/apply/content-writing',
  },
  '8': {
    id: '8',
    title: 'UI/UX Design Project',
    shortDescription: 'Design user-centered interfaces for web and mobile.',
    fullDetails: `## About This Project

Create intuitive and beautiful user experiences while learning industry-standard design processes.

### What You'll Learn:
- User research and personas
- Wireframing and prototyping
- Figma and design tools
- Usability testing
- Design systems

### Requirements:
- Portfolio showcasing UI/UX work
- Proficiency in Figma or similar tools
- Understanding of design principles
- Available 20+ hours per week

### Benefits:
- Real project experience
- Certification in UX design
- Collaboration with developers
- Portfolio case studies

### Duration: 4 months
### Location: Remote/Hybrid
### Stipend: Competitive`,
    hasCertification: true,
    applyUrl: 'https://example.com/apply/uiux-design',
  },
  '9': {
    id: '9',
    title: 'Cybersecurity Training',
    shortDescription: 'Learn network security, ethical hacking, and risk assessment.',
    fullDetails: `## About This Training

Comprehensive cybersecurity training covering network security, ethical hacking, and enterprise security practices.

### What You'll Learn:
- Network security fundamentals
- Ethical hacking techniques
- Vulnerability assessment
- Incident response
- Security compliance and frameworks

### Requirements:
- IT or Computer Science background
- Understanding of networking concepts
- Linux command line proficiency (preferred)
- Security+ or similar certification (bonus)

### Benefits:
- Industry-recognized certification
- Lab environment access
- Hands-on penetration testing
- Career guidance in cybersecurity

### Duration: 6 months
### Location: Hybrid
### Stipend: Competitive`,
    hasCertification: true,
    applyUrl: 'https://example.com/apply/cybersecurity',
  },
};

export default function ListingDetailPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', `/listings/${params.id}`);
      router.push('/auth/login');
      return;
    }

    // Fetch listing from API
    async function fetchListing() {
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setListing(data.listing);
        } else {
          console.error('Listing not found');
          router.push('/explore');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        router.push('/explore');
      }
    }
    
    fetchListing();
  }, [isAuthenticated, params.id, router]);

  if (!isAuthenticated || !listing) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Listings
        </button>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {listing.title}
                </h1>
                
                {/* Location, Duration, Deadline badges */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {listing.location && (
                    <div className="flex items-center text-blue-100">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{listing.location}</span>
                    </div>
                  )}
                  {listing.duration && (
                    <div className="flex items-center text-blue-100">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{listing.duration}</span>
                    </div>
                  )}
                  {listing.deadline && (
                    <div className="flex items-center text-blue-100">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">
                        Deadline: {new Date(listing.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-blue-100 text-lg">
                  {listing.shortDescription}
                </p>
              </div>
              {listing.hasCertification && (
                <span className="ml-4 px-4 py-2 bg-white text-green-700 text-sm font-semibold rounded-full whitespace-nowrap">
                  ✓ Certification Available
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="px-8 py-8">
            <div className="prose prose-slate max-w-none">
              {listing.fullDetails.split('\n').map((paragraph: string, index: number) => {
                if (paragraph.startsWith('##')) {
                  return (
                    <h2 key={index} className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                      {paragraph.replace('##', '').trim()}
                    </h2>
                  );
                } else if (paragraph.startsWith('###')) {
                  return (
                    <h3 key={index} className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                      {paragraph.replace('###', '').trim()}
                    </h3>
                  );
                } else if (paragraph.startsWith('-')) {
                  return (
                    <li key={index} className="text-slate-700 ml-6 mb-2">
                      {paragraph.replace('-', '').trim()}
                    </li>
                  );
                } else if (paragraph.trim()) {
                  return (
                    <p key={index} className="text-slate-700 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                }
                return null;
              })}
            </div>

            {/* Apply button */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-slate-600">
                  <p className="text-sm">Logged in as: <span className="font-medium text-slate-900">{user?.email}</span></p>
                </div>
                <a
                  href={listing.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  Submit Application
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
