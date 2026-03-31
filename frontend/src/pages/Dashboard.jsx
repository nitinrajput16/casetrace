import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Timeline from '../components/Timeline';
import ChatWidget from '../components/ChatWidget';
import { buildApiUrl } from '../lib/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Dashboard() {
  const query = useQuery();
  const id = query.get('id');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    // buildApiUrl imported from lib/api
    (async () => {
      try {
        const res = await fetch(buildApiUrl(`/complaints/${id}`));
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setComplaint(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id]);

  const [list, setList] = useState(null);

  if (!id) {
    // show list of complaints if available
    useEffect(() => {
      (async () => {
        try {
          const res = await fetch(buildApiUrl('/complaints'));
          if (res.ok) {
            const data = await res.json();
            setList(data);
          }
        } catch (e) {
          // ignore
        }
      })();
    }, []);
    return (
      <div>
        <h1 className="text-2xl font-bold">Complaints</h1>
        <p className="mt-2">Select a sample FIR or search from Home.</p>
        <ul className="mt-4 space-y-2">
          {(list || []).map(c => (
            <li key={c.complaintId} className="p-3 bg-white rounded shadow">
              <a href={`#/dashboard?id=${encodeURIComponent(c.complaintId)}`} className="font-semibold text-blue-700">{c.complaintId}</a>
              <div className="text-sm text-gray-600">{c.title} — {c.status}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!complaint) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{complaint.title} — {complaint.complaintId}</h1>
      <div className="mt-2">
        <span className={`px-2 py-1 rounded ${complaint.status === 'NEGLECTED' ? 'bg-red-200 text-red-800' : complaint.status === 'RESOLVED' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>{complaint.status}</span>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Officer</h3>
          <p>{complaint.assignedOfficer} — {complaint.officerPhone}</p>
          <a className="text-green-600" href={`https://wa.me/${(complaint.officerPhone||'').replace(/\D/g,'')}`}>WhatsApp Officer</a>
        </div>
        <div>
          <h3 className="font-semibold">Police Station</h3>
          <p>{complaint.policeStation} — {complaint.district}</p>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Timeline</h2>
        <Timeline events={complaint.updates || []} />
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
        <ChatWidget complaintId={complaint.complaintId} />
      </div>
    </div>
  );
}
