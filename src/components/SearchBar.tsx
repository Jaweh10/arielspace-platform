'use client';

import { useState, FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-stretch bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search internships and projects..."
          className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
        />
        <button
          type="submit"
          className="px-4 sm:px-8 py-3 sm:py-4 bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex-shrink-0 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Search</span>
          <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
