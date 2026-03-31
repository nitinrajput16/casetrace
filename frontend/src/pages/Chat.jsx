import React from 'react';
import ChatWidget from '../components/ChatWidget';

export default function Chat() {
  return (
    <div>
      <h1 className="text-2xl font-bold">AI Assistant</h1>
      <p className="mt-2">Ask the assistant about your case or legal rights.</p>
      <div className="mt-4"><ChatWidget /></div>
    </div>
  );
}
