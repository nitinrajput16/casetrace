import React from 'react';

export default function OfficerCard({ name, phone }) {
  const phoneDigits = (phone || '').replace(/\D/g, '');
  return (
    <div className="border rounded p-3">
      <div className="font-semibold">{name}</div>
      <div className="text-sm">{phone}</div>
      <div className="mt-2">
        <a className="text-green-600" href={`https://wa.me/${phoneDigits}`}>WhatsApp</a>
      </div>
    </div>
  );
}
