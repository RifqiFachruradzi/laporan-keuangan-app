import JournalForm from '@/components/JournalForm';

export default function JurnalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Jurnal Umum (Standard Entries)</h1>
      <JournalForm type="Standard" title="Add New Journal Entry" />
    </div>
  );
}
