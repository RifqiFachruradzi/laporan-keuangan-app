'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Account, AccountType, NormalBalance } from '@/types';

const accountTypes: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

const defaultNormalBalance: Record<AccountType, NormalBalance> = {
  Asset: 'Debit',
  Liability: 'Credit',
  Equity: 'Credit',
  Revenue: 'Credit',
  Expense: 'Debit',
};

export default function CoaPage() {
  const { accounts, addAccount, updateAccount, deleteAccount, isAccountUsed } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Asset');
  const [normalBalance, setNormalBalance] = useState<NormalBalance>('Debit');

  const isCodeValid = /^\d{9}$/.test(code);
  const isDuplicate = accounts.some(a => a.code === code && a.id !== editingId);
  const isValid = isCodeValid && !isDuplicate && name.trim() !== '';

  const handleTypeChange = (val: AccountType) => {
    setType(val);
    setNormalBalance(defaultNormalBalance[val]);
  };

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setName('');
    setType('Asset');
    setNormalBalance('Debit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const account = { code, name: name.trim(), type, normalBalance };
    if (editingId) {
      updateAccount(editingId, account);
    } else {
      addAccount(account);
    }
    resetForm();
  };

  const handleEdit = (acc: Account) => {
    setEditingId(acc.id);
    setCode(acc.code);
    setName(acc.name);
    setType(acc.type);
    setNormalBalance(acc.normalBalance);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, label: string) => {
    if (confirm(`Hapus akun ${label}?`)) {
      deleteAccount(id);
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Chart of Accounts (COA)</h1>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Akun' : 'Tambah Akun'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Kode Akun (9 digit)</Label>
                <Input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="111000000"
                  inputMode="numeric"
                  required
                />
                {code && !isCodeValid && <p className="text-xs text-red-500">Kode harus 9 digit angka.</p>}
                {isDuplicate && <p className="text-xs text-red-500">Kode sudah digunakan.</p>}
              </div>
              <div className="space-y-2">
                <Label>Nama Akun</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nama akun..." required />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={type} onValueChange={(val) => val && handleTypeChange(val as AccountType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Saldo Normal</Label>
                <Select value={normalBalance} onValueChange={(val) => val && setNormalBalance(val as NormalBalance)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!isValid}>
                {editingId ? (
                  <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> Tambah Akun</>
                )}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" /> Batal
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Akun</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Saldo Normal</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(acc => {
                const used = isAccountUsed(acc.id);
                return (
                  <TableRow key={acc.id} className={editingId === acc.id ? 'bg-emerald-50' : undefined}>
                    <TableCell className="font-mono">{acc.code}</TableCell>
                    <TableCell>{acc.name}</TableCell>
                    <TableCell><Badge variant="secondary">{acc.type}</Badge></TableCell>
                    <TableCell>{acc.normalBalance}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-slate-600"
                          onClick={() => handleEdit(acc)}
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          disabled={used}
                          title={used ? 'Akun sudah dipakai di jurnal, tidak bisa dihapus' : 'Hapus akun'}
                          onClick={() => handleDelete(acc.id, `${acc.code} - ${acc.name}`)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
