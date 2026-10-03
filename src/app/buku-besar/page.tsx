'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah, calculateNetBalance } from '@/lib/accounting-utils';

export default function BukuBesarPage() {
  const { accounts, journals } = useAppContext();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // Get all entries for this account
  const ledgerEntries = journals.flatMap(journal => 
    journal.entries
      .filter(entry => entry.accountId === selectedAccountId)
      .map(entry => ({
        ...entry,
        date: journal.date,
        description: journal.description,
        journalType: journal.type
      }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Buku Besar (General Ledger)</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAccountId} onValueChange={(val) => setSelectedAccountId(val || '')}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Choose an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedAccount.code} - {selectedAccount.name} ({selectedAccount.normalBalance} Balance)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500">No transactions found.</TableCell>
                  </TableRow>
                ) : (
                  ledgerEntries.map((entry, idx) => {
                    if (selectedAccount.normalBalance === 'Debit') {
                      runningBalance += entry.debit - entry.credit;
                    } else {
                      runningBalance += entry.credit - entry.debit;
                    }

                    return (
                      <TableRow key={idx}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.journalType}</TableCell>
                        <TableCell className="text-right">{entry.debit > 0 ? formatRupiah(entry.debit) : '-'}</TableCell>
                        <TableCell className="text-right">{entry.credit > 0 ? formatRupiah(entry.credit) : '-'}</TableCell>
                        <TableCell className="text-right font-medium">{formatRupiah(runningBalance)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
