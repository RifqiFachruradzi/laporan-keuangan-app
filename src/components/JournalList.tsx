'use client';

import { Fragment, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { formatRupiah } from '@/lib/accounting-utils';
import { JournalType } from '@/types';

interface JournalListProps {
  type: JournalType;
  title: string;
}

export default function JournalList({ type, title }: JournalListProps) {
  const { accounts, journals, deleteJournal } = useAppContext();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Running balance per account (previous balance + debit - credit), in
  // chronological order across all journals so it matches the ledger
  const balanceAfter = new Map<string, number>();
  const running = new Map<string, number>();
  for (const journal of journals) {
    for (const entry of journal.entries) {
      const balance = (running.get(entry.accountId) ?? 0) + entry.debit - entry.credit;
      running.set(entry.accountId, balance);
      balanceAfter.set(entry.id, balance);
    }
  }

  const query = search.trim().toLowerCase();
  const list = journals
    .filter(j => j.type === type)
    .filter(j =>
      !query ||
      j.description.toLowerCase().includes(query) ||
      j.date.includes(query) ||
      (j.documentNumber ?? '').toLowerCase().includes(query)
    )
    .slice()
    .reverse();

  const handleDelete = async (id: string, description: string) => {
    if (!confirm(`Hapus jurnal "${description}"?`)) return;
    setDeletingId(id);
    await deleteJournal(id);
    setDeletingId(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>{title}</CardTitle>
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari no. dokumen, keterangan, atau tanggal..."
          className="max-w-xs"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Tanggal</TableHead>
              <TableHead>No. Dokumen</TableHead>
              <TableHead>Sub Account Number</TableHead>
              <TableHead>Sub Account Name</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                  {query ? 'Tidak ada jurnal yang cocok.' : 'Belum ada jurnal yang disimpan.'}
                </TableCell>
              </TableRow>
            ) : (
              list.map(journal => {
                const totalDebit = journal.entries.reduce((sum, e) => sum + e.debit, 0);
                const totalCredit = journal.entries.reduce((sum, e) => sum + e.credit, 0);
                // Debit lines first, then credit lines (indented), as in a written journal
                const entries = [...journal.entries].sort((a, b) => b.debit - a.debit);
                return (
                  <Fragment key={journal.id}>
                    <TableRow className="border-t-2 border-slate-200 bg-white hover:bg-white">
                      <TableCell className="font-medium text-slate-900">{journal.date}</TableCell>
                      <TableCell className="font-mono font-medium text-emerald-700">{journal.documentNumber ?? '-'}</TableCell>
                      <TableCell colSpan={5} className="whitespace-normal font-medium text-slate-900">
                        {journal.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500"
                          title="Hapus jurnal"
                          disabled={deletingId === journal.id}
                          onClick={() => handleDelete(journal.id, journal.description)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {entries.map(entry => {
                      const acc = accounts.find(a => a.id === entry.accountId);
                      const isCredit = entry.credit > 0;
                      return (
                        <TableRow key={entry.id} className="text-slate-600">
                          <TableCell />
                          <TableCell />
                          <TableCell className={isCredit ? 'pl-8 font-mono' : 'font-mono'}>
                            {acc ? acc.subCode || acc.code : '-'}
                          </TableCell>
                          <TableCell className={isCredit ? 'pl-8 whitespace-normal' : 'whitespace-normal'}>
                            {acc ? acc.subName || acc.name : 'Akun tidak ditemukan'}
                          </TableCell>
                          <TableCell className="text-right">{entry.debit > 0 ? formatRupiah(entry.debit) : '-'}</TableCell>
                          <TableCell className="text-right">{isCredit ? formatRupiah(entry.credit) : '-'}</TableCell>
                          <TableCell className="text-right font-medium text-slate-900">
                            {formatRupiah(balanceAfter.get(entry.id) ?? 0)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      );
                    })}
                    <TableRow className="text-slate-900 hover:bg-transparent">
                      <TableCell colSpan={4} className="text-right text-xs uppercase tracking-wide text-slate-500">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatRupiah(totalDebit)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatRupiah(totalCredit)}</TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
