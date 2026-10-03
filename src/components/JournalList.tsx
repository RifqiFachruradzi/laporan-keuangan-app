'use client';

import { Fragment, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { formatRupiah } from '@/lib/accounting-utils';
import { Journal, JournalType } from '@/types';

interface JournalListProps {
  type: JournalType;
  title: string;
}

export default function JournalList({ type, title }: JournalListProps) {
  const { accounts, journals, deleteJournal } = useAppContext();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debit lines first, then credit lines
  const orderedEntries = (journal: Journal) => [...journal.entries].sort((a, b) => b.debit - a.debit);

  // Running balance over every line of this journal type in date order:
  // previous balance + debit - credit
  const balanceAfter = new Map<string, number>();
  let running = 0;
  for (const journal of journals.filter(j => j.type === type)) {
    for (const entry of orderedEntries(journal)) {
      running += entry.debit - entry.credit;
      balanceAfter.set(entry.id, running);
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
                const entries = orderedEntries(journal);
                return (
                  <Fragment key={journal.id}>
                    <TableRow className="border-t-2 border-slate-200 bg-white hover:bg-white">
                      <TableCell colSpan={7} className="whitespace-normal font-medium text-slate-900">
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
                          <TableCell>{journal.date}</TableCell>
                          <TableCell className="font-mono text-emerald-700">{journal.documentNumber ?? '-'}</TableCell>
                          <TableCell className="font-mono">
                            {acc ? acc.subCode || acc.code : '-'}
                          </TableCell>
                          <TableCell className="whitespace-normal">
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
