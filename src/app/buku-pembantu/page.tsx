'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/lib/accounting-utils';

const subLedgers = [
  { id: '1', type: 'AR', name: 'PT Alfa (Customer)', balance: 5000000 },
  { id: '2', type: 'AR', name: 'PT Beta (Customer)', balance: 2500000 },
  { id: '3', type: 'AP', name: 'CV Gamma (Vendor)', balance: 3000000 },
];

export default function BukuPembantuPage() {
  const [selectedSub, setSelectedSub] = useState<string>('');
  
  const sub = subLedgers.find(s => s.id === selectedSub);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Buku Pembantu (Subsidiary Ledger)</h1>
      <p className="text-slate-500">Note: This is a simplified mockup as subsidiary ledgers require detailed customer/vendor tracking per journal entry line.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Sub-Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedSub}
            onValueChange={(val) => setSelectedSub(val || '')}
            itemToStringLabel={(val) => {
              const s = subLedgers.find(x => x.id === val);
              return s ? `${s.type} - ${s.name}` : '';
            }}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Choose a sub-ledger" />
            </SelectTrigger>
            <SelectContent>
              {subLedgers.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.type} - {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {sub && (
        <Card>
          <CardHeader>
            <CardTitle>{sub.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2024-01-01</TableCell>
                  <TableCell>Beginning Balance</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-medium">{formatRupiah(sub.balance)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
