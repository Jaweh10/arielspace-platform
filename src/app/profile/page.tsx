'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SessionWarning from '@/components/SessionWarning';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SessionWarning />
      <Navbar />
      
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">My Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <p className="text-blue-100 mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                  <p className="text-slate-900 font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                  <p className="text-slate-900 font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Member Since</label>
                  <p className="text-slate-900 font-medium">
                    {new Date(parseInt(user.id)).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Account Status</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Active
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">My Applications</h3>
              <div className="bg-slate-50 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-600">You haven't applied to any internships yet</p>
                <a
                  href="/explore"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Opportunities
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
