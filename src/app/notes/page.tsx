'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function NotesPage() {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('financial_notes');
    if (saved) setNotes(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem('financial_notes', notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Catatan Atas Laporan Keuangan (Notes to Financial Statements)</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Accounting Policies & Disclosures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Enter accounting policies, contingencies, and other disclosures here..."
              className="min-h-[400px]"
            />
            <div className="flex items-center gap-4">
              <Button onClick={handleSave}>Save Notes</Button>
              {isSaved && <span className="text-emerald-600 text-sm">Saved successfully!</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
