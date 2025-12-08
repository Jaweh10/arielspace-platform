'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SessionWarning() {
  const { showSessionWarning, extendSession, logout } = useAuth();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (showSessionWarning) {
      setCountdown(60);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showSessionWarning]);

  if (!showSessionWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-scale-in">
        {/* Warning Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Session Expiring Soon</h3>
          <p className="text-slate-600 mb-4">
            You've been inactive for a while. For your security, you'll be logged out in:
          </p>
          
          {/* Countdown */}
          <div className="text-5xl font-bold text-yellow-600 mb-2">
            {countdown}s
          </div>
          <p className="text-sm text-slate-500">
            Click "Stay Logged In" to continue your session
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-yellow-600 transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / 60) * 100}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={logout}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Logout Now
          </button>
          <button
            onClick={extendSession}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
