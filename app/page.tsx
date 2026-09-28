'use client';
export const dynamic = 'force-dynamic'; // <-- Add this line

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface Company {
  id: string;
  name: string;
  sector: string;
  pre_event_surplus: number;
  post_event_surplus: number;
  fleet_efficiency: number;
}

interface Note {
  id: string;
  company_id: string;
  researcher_name: string;
  note: string;
  created_at: string;
}

export default function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchCompanies();
    fetchNotes();
  }, []);

  async function fetchCompanies() {
    const { data } = await supabase.from('companies').select('*');
    if (data) {
      setCompanies(data);
      if (data.length > 0) setSelectedCompanyId(data[0].id);
    }
  }

  async function fetchNotes() {
    const { data } = await supabase.from('research_notes').select('*').order('created_at', { ascending: false });
    if (data) setNotes(data);
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim() || !selectedCompanyId) return;

    await supabase.from('research_notes').insert([
      { company_id: selectedCompanyId, note: newNote, researcher_name: 'Lead Researcher' }
    ]);

    setNewNote('');
    fetchNotes();
  }

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-900">MITRANS Event Performance Dashboard</h1>
        <p className="text-slate-600">Real-time before/after research metrics & collaborative logs</p>
      </header>

      {/* Main Chart */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Pre vs Post Surplus Comparison (USD)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={companies}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pre_event_surplus" name="Pre-Event Surplus" fill="#94a3b8" />
              <Bar dataKey="post_event_surplus" name="Post-Event Surplus" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Research Notes Panel */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Collaborative Research Log</h2>
        
        <form onSubmit={handleAddNote} className="flex gap-4">
          <select 
            value={selectedCompanyId} 
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="p-2 border rounded-md text-slate-800"
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Add researcher insight or observation..." 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 p-2 border rounded-md"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
            Post Note
          </button>
        </form>

        <div className="divide-y max-h-60 overflow-y-auto">
          {notes.map(n => (
            <div key={n.id} className="py-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">{n.researcher_name}</span>
                <span>{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <p className="text-slate-800 text-sm">{n.note}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}