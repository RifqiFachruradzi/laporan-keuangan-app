'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { JournalType, JournalEntryLine } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { formatAccountLabel, formatAccountName, formatAccountNumber } from '@/lib/accounting-utils';

interface JournalFormProps {
  type: JournalType;
  title: string;
}

export default function JournalForm({ type, title }: JournalFormProps) {
  const { accounts, addJournal } = useAppContext();
  const accountNumber = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? formatAccountNumber(acc) : '';
  };
  const accountName = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? formatAccountName(acc) : '';
  };
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [lines, setLines] = useState<Partial<JournalEntryLine>[]>([
    { id: uuidv4(), accountId: '', debit: 0, credit: 0 },
    { id: uuidv4(), accountId: '', debit: 0, credit: 0 }
  ]);

  const addLine = () => {
    setLines([...lines, { id: uuidv4(), accountId: '', debit: 0, credit: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof JournalEntryLine, value: any) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        if (field === 'debit') return { ...l, debit: Number(value), credit: 0 };
        if (field === 'credit') return { ...l, credit: Number(value), debit: 0 };
        return { ...l, [field]: value };
      }
      return l;
    }));
  };

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;
  
  const isValid = isBalanced && date && description && lines.every(l => l.accountId);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSaving) return;

    setIsSaving(true);
    const saved = await addJournal({
      date,
      description,
      type,
      entries: lines as JournalEntryLine[]
    });
    setIsSaving(false);
    if (!saved) return;

    // Reset
    setDescription('');
    setLines([
      { id: uuidv4(), accountId: '', debit: 0, credit: 0 },
      { id: uuidv4(), accountId: '', debit: 0, credit: 0 }
    ]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} required placeholder="Transaction description..." />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 px-2">
              <div className="col-span-2">Account Number</div>
              <div className="col-span-4">Account Name</div>
              <div className="col-span-2">Debit</div>
              <div className="col-span-2">Credit</div>
              <div className="col-span-2 text-center">Action</div>
            </div>

            {lines.map((line, index) => (
              <div key={line.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2">
                  <Select
                    value={line.accountId}
                    onValueChange={(val) => updateLine(line.id!, 'accountId', val || '')}
                    itemToStringLabel={(val) => accountNumber(val as string)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Number" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {formatAccountLabel(acc)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-4">
                  <Select
                    value={line.accountId}
                    onValueChange={(val) => updateLine(line.id!, 'accountId', val || '')}
                    itemToStringLabel={(val) => accountName(val as string)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select account name" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {formatAccountName(acc)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input 
                    type="number" 
                    min="0" 
                    value={line.debit || ''} 
                    onChange={e => updateLine(line.id!, 'debit', e.target.value)}
                    disabled={Number(line.credit) > 0}
                  />
                </div>
                <div className="col-span-2">
                  <Input 
                    type="number" 
                    min="0" 
                    value={line.credit || ''} 
                    onChange={e => updateLine(line.id!, 'credit', e.target.value)}
                    disabled={Number(line.debit) > 0}
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(line.id!)} disabled={lines.length <= 2} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="w-4 h-4 mr-2" /> Add Line
            </Button>

            <div className="flex space-x-8 text-sm font-bold">
              <div className={totalDebit !== totalCredit ? 'text-red-500' : 'text-slate-700'}>
                Total Debit: {totalDebit}
              </div>
              <div className={totalDebit !== totalCredit ? 'text-red-500' : 'text-slate-700'}>
                Total Credit: {totalCredit}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={!isValid || isSaving}>
              {isSaving ? 'Saving...' : 'Save Journal Entry'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
