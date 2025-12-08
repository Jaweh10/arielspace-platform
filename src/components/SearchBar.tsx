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
      <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search internships and projects..."
          className="flex-1 px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="px-8 py-4 bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
