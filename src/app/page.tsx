'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import AdSidebar from '@/components/AdSidebar';
import Footer from '@/components/Footer';
import WelcomeMessage from '@/components/WelcomeMessage';
import SessionWarning from '@/components/SessionWarning';
import { getAllListings } from '@/lib/listings';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allListings, setAllListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);

  useEffect(() => {
    const listings = getAllListings();
    // Show only first 3 on homepage
    const featured = listings.slice(0, 3);
    setAllListings(featured);
    setFilteredListings(featured);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredListings(allListings);
    } else {
      const filtered = allListings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query.toLowerCase()) ||
          listing.shortDescription.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredListings(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SessionWarning />
      <WelcomeMessage />
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-100 to-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
              Launch Your Development
            </h1>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              And Growth with ArielSpace
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Explore Internship, Projects in your region with certification
            </p>
          </div>
          
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Listings Grid */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Find Your Next Project And Internship With Certification
            </h2>
            
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">No listings found matching your search.</p>
              </div>
            )}

            {/* Explore More Button */}
            {filteredListings.length > 0 && (
              <div className="mt-12 text-center">
                <a 
                  href="/explore"
                  className="inline-block px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Explore More
                </a>
              </div>
            )}
          </div>

          {/* Ad Sidebar */}
          <AdSidebar />
        </div>
      </section>

      <Footer />
    </div>
  );
}
