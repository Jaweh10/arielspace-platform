'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

export default function EditListingPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDetails: '',
    hasCertification: true,
    applyUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

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

    // Load listing data
    const stored = localStorage.getItem('internship_listings');
    if (stored) {
      const listings = JSON.parse(stored);
      const listing = listings.find((l: any) => l.id === params.id);
      
      if (listing) {
        setFormData({
          title: listing.title,
          shortDescription: listing.shortDescription,
          fullDetails: listing.fullDetails,
          hasCertification: listing.hasCertification,
          applyUrl: listing.applyUrl,
        });
      } else {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, [isAuthenticated, params.id, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.title.length < 3) {
      setError('Title must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    if (formData.shortDescription.length < 20) {
      setError('Short description must be at least 20 characters');
      setIsLoading(false);
      return;
    }

    if (formData.fullDetails.length < 50) {
      setError('Full details must be at least 50 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Get existing listings
      const stored = localStorage.getItem('internship_listings');
      const listings = stored ? JSON.parse(stored) : [];

      // Find and update the listing
      const index = listings.findIndex((l: any) => l.id === params.id);
      if (index !== -1) {
        listings[index] = {
          ...listings[index],
          ...formData,
        };

        // Save to localStorage
        localStorage.setItem('internship_listings', JSON.stringify(listings));

        setIsLoading(false);
        router.push('/admin');
      } else {
        setError('Listing not found');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to update listing. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Listing Not Found</h3>
            <p className="text-slate-600 mb-6">The listing you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Edit Listing</h1>
          <p className="text-slate-600">Update the internship or project details</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                placeholder="e.g., Web Development Internship"
              />
            </div>

            {/* Short Description */}
            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-slate-700 mb-2">
                Short Description * (shown on listing cards)
              </label>
              <textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                required
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                placeholder="Brief description that appears on the listing card (max 200 characters)"
              />
              <p className="text-sm text-slate-500 mt-1">
                {formData.shortDescription.length}/200 characters
              </p>
            </div>

            {/* Full Details */}
            <div>
              <label htmlFor="fullDetails" className="block text-sm font-medium text-slate-700 mb-2">
                Full Details * (detailed description)
              </label>
              <textarea
                id="fullDetails"
                value={formData.fullDetails}
                onChange={(e) => setFormData({ ...formData, fullDetails: e.target.value })}
                required
                rows={12}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-mono text-sm"
                placeholder="Full listing details. You can use:
## Heading
### Subheading
- Bullet point
Regular paragraph text"
              />
              <p className="text-sm text-slate-500 mt-2">
                Formatting tips: Use ## for headings, ### for subheadings, - for bullet points
              </p>
            </div>

            {/* Application URL */}
            <div>
              <label htmlFor="applyUrl" className="block text-sm font-medium text-slate-700 mb-2">
                Application URL *
              </label>
              <input
                type="url"
                id="applyUrl"
                value={formData.applyUrl}
                onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                placeholder="https://example.com/apply"
              />
              <p className="text-sm text-slate-500 mt-1">
                External link where users will submit their applications
              </p>
            </div>

            {/* Certification */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="hasCertification"
                checked={formData.hasCertification}
                onChange={(e) => setFormData({ ...formData, hasCertification: e.target.checked })}
                className="w-5 h-5 mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasCertification" className="ml-3 text-slate-700">
                <span className="font-medium">Includes Certification</span>
                <p className="text-sm text-slate-500">Check this if the internship/project offers a certificate upon completion</p>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
