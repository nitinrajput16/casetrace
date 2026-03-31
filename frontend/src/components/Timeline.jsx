import React from 'react';

export default function Timeline({ events }) {
  return (
    <ol className="border-l-2 border-gray-200 pl-4">
      {events.map(ev => (
        <li key={ev.id} className="mb-4">
          <div className="text-sm text-gray-500">{new Date(ev.createdAt).toLocaleString()}</div>
          <div className="mt-1">{ev.updateText}</div>
          <div className="text-xs text-gray-400">By: {ev.updatedBy || 'Police/Citizen'}</div>
        </li>
      ))}
    </ol>
  );
}
