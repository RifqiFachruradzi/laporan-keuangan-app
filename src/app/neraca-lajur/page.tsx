'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateAccountBalances, formatRupiah } from '@/lib/accounting-utils';

export default function NeracaLajurPage() {
  const { accounts, journals } = useAppContext();
  
  const stdBalances = calculateAccountBalances(journals, ['Standard']);
  const adjBalances = calculateAccountBalances(journals, ['Adjustment']);

  let tbDebitTotal = 0, tbCreditTotal = 0;
  let adjDebitTotal = 0, adjCreditTotal = 0;
  let atbDebitTotal = 0, atbCreditTotal = 0;
  let isDebitTotal = 0, isCreditTotal = 0;
  let bsDebitTotal = 0, bsCreditTotal = 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Neraca Lajur (Worksheet)</h1>
      
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>10-Column Worksheet</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[1200px] text-xs">
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2} className="w-[200px]">Account</TableHead>
                <TableHead colSpan={2} className="text-center border-b">Trial Balance</TableHead>
                <TableHead colSpan={2} className="text-center border-b">Adjustments</TableHead>
                <TableHead colSpan={2} className="text-center border-b">Adjusted TB</TableHead>
                <TableHead colSpan={2} className="text-center border-b">Income Statement</TableHead>
                <TableHead colSpan={2} className="text-center border-b">Balance Sheet</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(acc => {
                const std = stdBalances[acc.id] || { debit: 0, credit: 0 };
                const adj = adjBalances[acc.id] || { debit: 0, credit: 0 };
                
                // Trial Balance
                let tbDebit = 0, tbCredit = 0;
                if (acc.normalBalance === 'Debit') {
                  const net = std.debit - std.credit;
                  if (net > 0) tbDebit = net; else tbCredit = -net;
                } else {
                  const net = std.credit - std.debit;
                  if (net > 0) tbCredit = net; else tbDebit = -net;
                }

                // Adjusted TB
                let atbDebit = 0, atbCredit = 0;
                if (acc.normalBalance === 'Debit') {
                  const net = tbDebit - tbCredit + adj.debit - adj.credit;
                  if (net > 0) atbDebit = net; else atbCredit = -net;
                } else {
                  const net = tbCredit - tbDebit + adj.credit - adj.debit;
                  if (net > 0) atbCredit = net; else atbDebit = -net;
                }

                // Income Statement & Balance Sheet
                let isDebit = 0, isCredit = 0;
                let bsDebit = 0, bsCredit = 0;
                
                if (acc.type === 'Revenue' || acc.type === 'Expense') {
                  isDebit = atbDebit;
                  isCredit = atbCredit;
                } else {
                  bsDebit = atbDebit;
                  bsCredit = atbCredit;
                }

                if (!tbDebit && !tbCredit && !adj.debit && !adj.credit && !atbDebit && !atbCredit) return null;

                tbDebitTotal += tbDebit; tbCreditTotal += tbCredit;
                adjDebitTotal += adj.debit; adjCreditTotal += adj.credit;
                atbDebitTotal += atbDebit; atbCreditTotal += atbCredit;
                isDebitTotal += isDebit; isCreditTotal += isCredit;
                bsDebitTotal += bsDebit; bsCreditTotal += bsCredit;

                return (
                  <TableRow key={acc.id}>
                    <TableCell>{acc.code} - {acc.name}</TableCell>
                    <TableCell className="text-right">{tbDebit > 0 ? formatRupiah(tbDebit) : '-'}</TableCell>
                    <TableCell className="text-right">{tbCredit > 0 ? formatRupiah(tbCredit) : '-'}</TableCell>
                    <TableCell className="text-right">{adj.debit > 0 ? formatRupiah(adj.debit) : '-'}</TableCell>
                    <TableCell className="text-right">{adj.credit > 0 ? formatRupiah(adj.credit) : '-'}</TableCell>
                    <TableCell className="text-right">{atbDebit > 0 ? formatRupiah(atbDebit) : '-'}</TableCell>
                    <TableCell className="text-right">{atbCredit > 0 ? formatRupiah(atbCredit) : '-'}</TableCell>
                    <TableCell className="text-right">{isDebit > 0 ? formatRupiah(isDebit) : '-'}</TableCell>
                    <TableCell className="text-right">{isCredit > 0 ? formatRupiah(isCredit) : '-'}</TableCell>
                    <TableCell className="text-right">{bsDebit > 0 ? formatRupiah(bsDebit) : '-'}</TableCell>
                    <TableCell className="text-right">{bsCredit > 0 ? formatRupiah(bsCredit) : '-'}</TableCell>
                  </TableRow>
                );
              })}
              
              {/* Totals */}
              <TableRow className="font-bold bg-slate-50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{formatRupiah(tbDebitTotal)}</TableCell>
                <TableCell className="text-right">{formatRupiah(tbCreditTotal)}</TableCell>
                <TableCell className="text-right">{formatRupiah(adjDebitTotal)}</TableCell>
                <TableCell className="text-right">{formatRupiah(adjCreditTotal)}</TableCell>
                <TableCell className="text-right">{formatRupiah(atbDebitTotal)}</TableCell>
                <TableCell className="text-right">{formatRupiah(atbCreditTotal)}</TableCell>
                <TableCell className="text-right">{formatRupiah(isDebitTotal)}</TableCell>
                <TableCell className="text-right">{formatRupiah(isCreditTotal)}</TableCell>
                <TableCell className="text-right">{formatRupiah(bsDebitTotal)}</TableCell>
                <TableCell className="text-right">{formatRupiah(bsCreditTotal)}</TableCell>
              </TableRow>

              {/* Net Income */}
              <TableRow className="font-bold">
                <TableCell>Net Income</TableCell>
                <TableCell colSpan={6}></TableCell>
                <TableCell className="text-right">{isCreditTotal > isDebitTotal ? formatRupiah(isCreditTotal - isDebitTotal) : '-'}</TableCell>
                <TableCell className="text-right">{isDebitTotal > isCreditTotal ? formatRupiah(isDebitTotal - isCreditTotal) : '-'}</TableCell>
                <TableCell className="text-right">{isDebitTotal > isCreditTotal ? formatRupiah(isDebitTotal - isCreditTotal) : '-'}</TableCell>
                <TableCell className="text-right">{isCreditTotal > isDebitTotal ? formatRupiah(isCreditTotal - isDebitTotal) : '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
