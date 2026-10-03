'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { formatAccountName, formatAccountNumber } from '@/lib/accounting-utils';
import { Account, AccountType, NormalBalance, accountSubTypes } from '@/types';

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
  const [subCode, setSubCode] = useState('');
  const [name, setName] = useState('');
  const [subName, setSubName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AccountType>('Asset');
  const [subType, setSubType] = useState(accountSubTypes.Asset[0]);
  const [normalBalance, setNormalBalance] = useState<NormalBalance>('Debit');

  const isCodeValid = /^\d{9}$/.test(code);
  const isDuplicate = accounts.some(a => a.code === code && (a.subCode ?? '') === subCode && a.id !== editingId);
  const isValid = isCodeValid && !isDuplicate && name.trim() !== '';

  const handleTypeChange = (val: AccountType) => {
    setType(val);
    setSubType(accountSubTypes[val][0]);
    setNormalBalance(defaultNormalBalance[val]);
  };

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setSubCode('');
    setName('');
    setSubName('');
    setDescription('');
    setType('Asset');
    setSubType(accountSubTypes.Asset[0]);
    setNormalBalance('Debit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const account = { code, subCode: subCode || undefined, name: name.trim(), subName: subName.trim() || undefined, type, subType, normalBalance, description: description.trim() || undefined };
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
    setSubCode(acc.subCode ?? '');
    setName(acc.name);
    setSubName(acc.subName ?? '');
    setDescription(acc.description ?? '');
    setType(acc.type);
    setSubType(acc.subType);
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
                <Label>Account Number (9 digit)</Label>
                <Input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="111000000"
                  inputMode="numeric"
                  required
                />
                {code && !isCodeValid && <p className="text-xs text-red-500">Account Number harus 9 digit angka.</p>}
                {isDuplicate && <p className="text-xs text-red-500">Account Number dan Sub Account Number sudah digunakan.</p>}
              </div>
              <div className="space-y-2">
                <Label>Sub Account Number</Label>
                <Input
                  value={subCode}
                  onChange={e => setSubCode(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="Opsional, mis. 001"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Account name..." required />
              </div>
              <div className="space-y-2">
                <Label>Sub Account Name</Label>
                <Input value={subName} onChange={e => setSubName(e.target.value)} placeholder="Opsional, mis. Kas Kecil" />
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
                <Label>Sub Type</Label>
                <Select value={subType} onValueChange={(val) => val && setSubType(val as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountSubTypes[type].map(st => (
                      <SelectItem key={st} value={st}>{st}</SelectItem>
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
              <div className="space-y-2 md:col-span-4">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Opsional, keterangan akun..."
                  rows={2}
                />
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
                <TableHead className="whitespace-normal">Account Number</TableHead>
                <TableHead className="whitespace-normal">Sub Account Number</TableHead>
                <TableHead className="whitespace-normal">Account Name</TableHead>
                <TableHead className="whitespace-normal">Sub Account Name</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Sub Type</TableHead>
                <TableHead className="whitespace-normal">Saldo Normal</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(acc => {
                const used = isAccountUsed(acc.id);
                const isEditing = editingId === acc.id;
                return (
                  <TableRow key={acc.id} className={isEditing ? 'bg-emerald-100 hover:bg-emerald-100' : undefined}>
                    <TableCell className={isEditing ? 'font-mono border-l-4 border-emerald-500' : 'font-mono'}>{acc.code}</TableCell>
                    <TableCell className="font-mono">{acc.subCode || '-'}</TableCell>
                    <TableCell className="whitespace-normal">
                      {acc.name}
                      {isEditing && (
                        <Badge className="ml-2 bg-emerald-600 text-white">Sedang diedit</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-normal">{acc.subName || '-'}</TableCell>
                    <TableCell><Badge variant="secondary">{acc.type}</Badge></TableCell>
                    <TableCell className="whitespace-normal">{acc.subType}</TableCell>
                    <TableCell>{acc.normalBalance}</TableCell>
                    <TableCell className="whitespace-normal min-w-32 text-slate-600">{acc.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-slate-600"
                          onClick={() => handleEdit(acc)}
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-red-500"
                          disabled={used}
                          title={used ? 'Akun sudah dipakai di jurnal, tidak bisa dihapus' : 'Hapus akun'}
                          onClick={() => handleDelete(acc.id, `${formatAccountNumber(acc)} - ${formatAccountName(acc)}`)}
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
