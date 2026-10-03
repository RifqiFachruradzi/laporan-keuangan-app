import JournalForm from '@/components/JournalForm';
import JournalList from '@/components/JournalList';

export default function JurnalAdjustmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Jurnal Penyesuaian (Adjusting Entries)</h1>
      <JournalForm type="Adjustment" title="Add Adjusting Entry" />
      <JournalList type="Adjustment" title="Daftar Jurnal Penyesuaian" />
    </div>
  );
}
