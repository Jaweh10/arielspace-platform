'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ListingCardProps {
  id: string;
  title: string;
  shortDescription: string;
  hasCertification: boolean;
  location?: string;
  duration?: string;
  deadline?: string;
}

export default function ListingCard({
  id,
  title,
  shortDescription,
  hasCertification,
  location,
  duration,
  deadline,
}: ListingCardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleApplyClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      // Store the intended destination
      sessionStorage.setItem('redirectAfterLogin', `/listings/${id}`);
      router.push('/auth/login');
    }
  };

  // Format deadline
  const formatDeadline = (deadlineStr: string | undefined) => {
    if (!deadlineStr) return null;
    const date = new Date(deadlineStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md border border-green-200 p-6 hover:shadow-lg transition-shadow">
      {/* Location and Duration badges */}
      <div className="flex items-center justify-between mb-4 text-sm">
        {location && (
          <div className="flex items-center text-green-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{location}</span>
          </div>
        )}
        {duration && (
          <div className="flex items-center text-green-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{duration}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-slate-900 mb-4 underline decoration-2">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-slate-800 mb-6 line-clamp-3 leading-relaxed">
        {shortDescription}
      </p>
      
      {/* Footer: Deadline and Apply button */}
      <div className="flex items-center justify-between">
        <div className="text-slate-800 font-medium">
          {deadline && (
            <span>Deadline: {formatDeadline(deadline)}</span>
          )}
        </div>
        <Link
          href={`/listings/${id}`}
          onClick={handleApplyClick}
          className="px-6 py-2 bg-white text-slate-800 font-semibold rounded-full hover:bg-slate-100 transition-colors shadow-md"
        >
          Apply Now
        </Link>
      </div>

      {/* Certification Badge (if applicable) */}
      {hasCertification && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <span className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Certification Available
          </span>
        </div>
      )}
    </div>
  );
}
