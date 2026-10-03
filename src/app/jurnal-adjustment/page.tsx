import JournalForm from '@/components/JournalForm';

export default function JurnalAdjustmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Jurnal Penyesuaian (Adjusting Entries)</h1>
      <JournalForm type="Adjustment" title="Add Adjusting Entry" />
    </div>
  );
}
