'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateAging, formatAccountName, formatAccountNumber, formatRupiah } from '@/lib/accounting-utils';
import { AgingKind } from '@/types';

interface AgingReportProps {
  kind: AgingKind;
  title: string;
}

const accountPattern: Record<AgingKind, RegExp> = {
  receivable: /receivable|piutang/i,
  payable: /payable|hutang|utang/i,
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default function AgingReport({ kind, title }: AgingReportProps) {
  const { accounts, journals } = useAppContext();

  const candidateAccounts = accounts.filter(a => a.type === (kind === 'receivable' ? 'Asset' : 'Liability'));
  const defaultAccount = candidateAccounts.find(a => accountPattern[kind].test(a.name)) ?? candidateAccounts[0];

  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccount?.id ?? '');
  const [asOfDate, setAsOfDate] = useState(formatDate(new Date()));
  const [termDays, setTermDays] = useState(30);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const aging = selectedAccount
    ? calculateAging(journals, selectedAccount.id, kind, asOfDate, termDays)
    : null;

  const bucketLabels = ['Belum Jatuh Tempo', '1-30 Hari', '31-60 Hari', '61-90 Hari', '> 90 Hari'];
  const accountLabel = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? `${formatAccountNumber(acc)} - ${formatAccountName(acc)}` : '';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select
                value={selectedAccountId}
                onValueChange={(val) => setSelectedAccountId(val || '')}
                itemToStringLabel={(val) => accountLabel(val as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih akun" />
                </SelectTrigger>
                <SelectContent>
                  {candidateAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {formatAccountNumber(acc)} - {formatAccountName(acc)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Per Tanggal</Label>
              <Input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Termin Pembayaran (hari)</Label>
              <Input
                type="number"
                min="0"
                value={termDays}
                onChange={e => setTermDays(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedAccount && aging && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {bucketLabels.map((label, i) => (
              <Card key={label} size="sm">
                <CardContent>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-lg font-semibold text-slate-800">{formatRupiah(aging.bucketTotals[i])}</p>
                </CardContent>
              </Card>
            ))}
            <Card size="sm" className="bg-slate-900 text-white">
              <CardContent>
                <p className="text-xs text-slate-300">Total Saldo</p>
                <p className="text-lg font-semibold">{formatRupiah(aging.total)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {formatAccountNumber(selectedAccount)} - {formatAccountName(selectedAccount)} per {asOfDate}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="whitespace-normal">Jatuh Tempo</TableHead>
                    <TableHead className="text-right whitespace-normal">Umur (hari)</TableHead>
                    <TableHead className="text-right">Nilai Awal</TableHead>
                    {bucketLabels.map(label => (
                      <TableHead key={label} className="text-right whitespace-normal">{label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aging.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-slate-500">
                        Tidak ada saldo terbuka.
                      </TableCell>
                    </TableRow>
                  ) : (
                    aging.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="whitespace-normal">{item.description}</TableCell>
                        <TableCell>{item.dueDate}</TableCell>
                        <TableCell className="text-right">{item.age}</TableCell>
                        <TableCell className="text-right">{formatRupiah(item.amount)}</TableCell>
                        {bucketLabels.map((label, i) => (
                          <TableCell key={label} className="text-right">
                            {item.bucket === i ? formatRupiah(item.outstanding) : '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                  <TableRow className="font-bold bg-slate-50">
                    <TableCell colSpan={5} className="text-right">Total</TableCell>
                    {aging.bucketTotals.map((total, i) => (
                      <TableCell key={i} className="text-right">{formatRupiah(total)}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
              <p className="mt-4 text-xs text-slate-500">
                Pembayaran dialokasikan ke transaksi paling lama terlebih dahulu (FIFO). Jatuh tempo dihitung dari
                tanggal transaksi ditambah termin pembayaran. Jurnal eliminasi tidak diikutkan.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
