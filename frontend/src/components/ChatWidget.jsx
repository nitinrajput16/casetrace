import React, { useState } from 'react';

import { buildApiUrl } from '../lib/api';

export default function ChatWidget({ complaintId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/chat'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, complaintId })
      });
      const data = await res.json();
      const reply = data.reply?.text || data.reply || 'No reply';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setText('');
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error contacting AI' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-3">
      <div className="h-48 overflow-auto mb-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <div className={`inline-block px-3 py-1 rounded ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex">
        <input className="flex-1 p-2 border rounded-l" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask the AI for help..." />
        <button onClick={send} className="bg-blue-600 text-white px-4 rounded-r" disabled={loading}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  );
}
