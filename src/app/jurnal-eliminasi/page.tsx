import JournalForm from '@/components/JournalForm';

export default function JurnalEliminasiPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Jurnal Eliminasi (Elimination Entries)</h1>
      <JournalForm type="Elimination" title="Add Elimination Entry" />
    </div>
  );
}
