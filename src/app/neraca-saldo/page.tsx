'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calculateAccountBalances, calculateNetBalance, formatRupiah } from '@/lib/accounting-utils';

export default function NeracaSaldoPage() {
  const { accounts, journals } = useAppContext();
  
  // Only standard entries for Trial Balance before adjustment
  const balances = calculateAccountBalances(journals, ['Standard']);

  let totalDebit = 0;
  let totalCredit = 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Neraca Saldo (Trial Balance)</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Unadjusted Trial Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(acc => {
                const accBalance = balances[acc.id];
                if (!accBalance) return null;
                
                const net = calculateNetBalance(accBalance.debit, accBalance.credit, acc.normalBalance);
                if (net === 0) return null;

                const isDebit = acc.normalBalance === 'Debit' ? net > 0 : net < 0;
                const absNet = Math.abs(net);
                
                if (isDebit) totalDebit += absNet;
                else totalCredit += absNet;

                return (
                  <TableRow key={acc.id}>
                    <TableCell>{acc.code}</TableCell>
                    <TableCell>{acc.name}</TableCell>
                    <TableCell className="text-right">{isDebit ? formatRupiah(absNet) : '-'}</TableCell>
                    <TableCell className="text-right">{!isDebit ? formatRupiah(absNet) : '-'}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="font-bold bg-slate-50">
                <TableCell colSpan={2} className="text-right">Total</TableCell>
                <TableCell className={`text-right ${totalDebit !== totalCredit ? 'text-red-500' : ''}`}>
                  {formatRupiah(totalDebit)}
                </TableCell>
                <TableCell className={`text-right ${totalDebit !== totalCredit ? 'text-red-500' : ''}`}>
                  {formatRupiah(totalCredit)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
