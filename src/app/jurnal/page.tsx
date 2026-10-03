import JournalForm from '@/components/JournalForm';
import JournalList from '@/components/JournalList';

export default function JurnalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Jurnal Umum (Standard Entries)</h1>
      <JournalForm type="Standard" title="Add New Journal Entry" />
      <JournalList type="Standard" title="Daftar Jurnal Umum" />
    </div>
  );
}
