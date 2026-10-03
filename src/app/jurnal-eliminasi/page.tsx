import JournalForm from '@/components/JournalForm';

export default function JurnalEliminasiPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Jurnal Eliminasi (Elimination Entries)</h1>
      <JournalForm type="Elimination" title="Add Elimination Entry" />
    </div>
  );
}
