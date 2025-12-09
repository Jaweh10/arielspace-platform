'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ListingCardProps {
  id: string;
  title: string;
  shortDescription: string;
  hasCertification: boolean;
}

export default function ListingCard({
  id,
  title,
  shortDescription,
  hasCertification,
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

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-slate-900 flex-1">{title}</h3>
        {hasCertification && (
          <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
            ✓ Certification
          </span>
        )}
      </div>
      
      <p className="text-slate-600 mb-6 line-clamp-3">
        {shortDescription}
      </p>
      
      <Link
        href={`/listings/${id}`}
        onClick={handleApplyClick}
        className="inline-block px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
      >
        Apply Now
      </Link>
    </div>
  );
}
