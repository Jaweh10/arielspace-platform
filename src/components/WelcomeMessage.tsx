'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeMessage() {
  const { user, showWelcome, dismissWelcome } = useAuth();

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        dismissWelcome();
      }, 5000); // Auto-dismiss after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [showWelcome, dismissWelcome]);

  if (!showWelcome || !user) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 max-w-md">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold">Welcome back, {user.name}!</p>
          <p className="text-sm text-green-100">You're successfully logged in</p>
        </div>
        <button
          onClick={dismissWelcome}
          className="flex-shrink-0 hover:bg-green-700 rounded p-1 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
