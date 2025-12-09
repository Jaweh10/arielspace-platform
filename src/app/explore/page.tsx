'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import Footer from '@/components/Footer';
import SessionWarning from '@/components/SessionWarning';
import { getAllListings } from '@/lib/listings';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allListings, setAllListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);

  useEffect(() => {
    const listings = getAllListings();
    setAllListings(listings);
    setFilteredListings(listings);
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
      <Navbar />
      
      {/* Header Section */}
      <section className="bg-gradient-to-br from-slate-100 to-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Explore All Opportunities
            </h1>
            <p className="text-lg text-slate-600">
              Browse {allListings.length} internships and projects available right now
            </p>
          </div>
          
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredListings.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredListings.length}</span> result{filteredListings.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <div className="text-slate-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No listings found</h3>
            <p className="text-slate-500">Try adjusting your search to find what you're looking for.</p>
            <button 
              onClick={() => handleSearch('')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
