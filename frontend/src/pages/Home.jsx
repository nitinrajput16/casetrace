import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const navigate = useNavigate();
  const onSearch = (value) => {
    if (!value) return;
    navigate(`/dashboard?id=${encodeURIComponent(value)}`);
  };

  const goToSample = (id) => navigate(`/dashboard?id=${encodeURIComponent(id)}`);

  return (
    <div>
      <section className="bg-blue-900 text-white rounded-lg p-10 mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:flex-1">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Track Your Police Complaint Status</h1>
            <p className="mt-4 text-lg text-blue-100">Enter your Complaint ID (FIR Number) to get real-time updates on your case.</p>
            <div className="mt-6 max-w-lg">
              <SearchBar onSearch={onSearch} />
            </div>
            <div className="mt-3 text-sm text-blue-200">
              Try sample IDs: 
              <button onClick={() => goToSample('FIR-2026-DEL-001')} className="underline mx-1">FIR-2026-DEL-001</button>
              |
              <button onClick={() => goToSample('FIR-2026-MUM-002')} className="underline mx-1">FIR-2026-MUM-002</button>
            </div>
          </div>
          <div className="hidden md:block md:w-1/3 ml-6">
            <div className="bg-white rounded-lg p-6 text-blue-900">
              <h3 className="font-semibold">AI Case Follow-up Assistant</h3>
              <p className="mt-2 text-sm">Chat with our intelligent assistant to understand your rights and next steps.</p>
              <button onClick={() => goToSample('FIR-2026-DEL-001')} className="mt-4 bg-blue-900 text-white px-4 py-2 rounded">Click to test</button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-semibold">Case Timeline</h3>
          <p className="mt-2 text-sm">View a transparent timeline of actions taken by the police department.</p>
          <button onClick={() => goToSample('FIR-2026-DEL-001')} className="mt-4 text-sm text-blue-700 underline">Click to test</button>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-semibold">Escalation Alerts</h3>
          <p className="mt-2 text-sm">Automatic alerts to higher authorities if your case is delayed.</p>
          <button onClick={() => goToSample('FIR-2026-MUM-002')} className="mt-4 text-sm text-blue-700 underline">Click to test</button>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-semibold">Know Your Rights</h3>
          <p className="mt-2 text-sm">Simple explanations of CrPC 154, 156, 173 in Hindi and English.</p>
          <button onClick={() => navigate('/rights')} className="mt-4 text-sm text-blue-700 underline">Learn more</button>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-500 mt-12">
        CaseTrace © 2026 — Civic-Tech Initiative
      </footer>
    </div>
  );
}
