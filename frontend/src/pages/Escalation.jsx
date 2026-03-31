import React, { useState } from 'react';
import { buildApiUrl } from '../lib/api';

export default function Escalation() {
  const [complaintId, setComplaintId] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState(null);

  const submit = async () => {
    setStatus('loading');
    try {
      const res = await fetch(buildApiUrl('/escalate'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId, reason })
      });
      const data = await res.json();
      setStatus(data.ok ? 'ok' : 'error');
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Escalation</h1>
      <p className="mt-2">Escalation assistant and contact ladder (IO → SHO → DSP → SP → IGP → DGP).</p>
      <div className="mt-4 max-w-md bg-white p-4 rounded shadow">
        <label className="block text-sm font-medium">FIR ID</label>
        <input value={complaintId} onChange={(e) => setComplaintId(e.target.value)} className="w-full border p-2 rounded mt-1" placeholder="FIR-2026-DEL-001" />
        <label className="block text-sm font-medium mt-3">Reason (optional)</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border p-2 rounded mt-1" rows={4} />
        <div className="mt-3">
          <button onClick={submit} className="bg-blue-700 text-white px-4 py-2 rounded">Create Escalation</button>
        </div>
        {status === 'loading' && <div className="mt-2 text-sm text-gray-600">Creating escalation...</div>}
        {status === 'ok' && <div className="mt-2 text-sm text-green-600">Escalation created.</div>}
        {status === 'error' && <div className="mt-2 text-sm text-red-600">Failed to create escalation.</div>}
      </div>
    </div>
  );
}
