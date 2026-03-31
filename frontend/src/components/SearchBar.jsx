import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState('');
  return (
    <div className="flex">
      <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 p-2 rounded-l border" placeholder="Enter FIR ID e.g. FIR-2026-DEL-001" />
      <button onClick={() => onSearch(q)} className="bg-blue-600 text-white px-4 rounded-r">Search</button>
    </div>
  );
}
