'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

export default function NewListingPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDetails: '',
    hasCertification: true,
    applyUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  if (!isAdmin) {
    alert('Access Denied: You do not have admin privileges.');
    router.push('/');
    return null;
  }

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

      // Check capacity (max 30)
      if (listings.length >= 30) {
        setError('Maximum capacity reached (30 listings). Please delete some listings first.');
        setIsLoading(false);
        return;
      }

      // Create new listing
      const newListing = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      listings.push(newListing);
      localStorage.setItem('internship_listings', JSON.stringify(listings));

      setIsLoading(false);
      router.push('/admin');
    } catch (err) {
      setError('Failed to create listing. Please try again.');
      setIsLoading(false);
    }
  };

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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Add New Listing</h1>
          <p className="text-slate-600">Create a new internship or project opportunity</p>
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
                    Creating...
                  </span>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
