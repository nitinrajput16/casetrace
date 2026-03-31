import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Escalation from './pages/Escalation';
import Rights from './pages/Rights';
import Chat from './pages/Chat';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { i18n: lng } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-900 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-xl font-bold"><Link to="/">CaseTrace</Link></div>
          <div className="space-x-4 flex items-center">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/chat">AI Chat</Link>
            <Link to="/escalation">Escalation</Link>
            <Link to="/rights">Know Your Rights</Link>
            <select className="ml-4 text-black p-1 rounded" value={lng.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
              <option value="en">EN</option>
              <option value="hi">HI</option>
            </select>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/escalation" element={<Escalation />} />
          <Route path="/rights" element={<Rights />} />
        </Routes>
      </main>
    </div>
  );
}
