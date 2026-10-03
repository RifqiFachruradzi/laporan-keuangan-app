'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { Account, AccountType, Journal, JournalType, NormalBalance, accountSubTypes } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { nextDocumentNumber } from '@/lib/accounting-utils';
import { isSupabaseConfigured } from '@/lib/supabase/env';

// Seeded into the database the first time a user logs in
export const defaultAccounts: Account[] = [
  { id: '1', code: '111000000', name: 'Cash', type: 'Asset', subType: 'Aset Lancar', normalBalance: 'Debit' },
  { id: '2', code: '112000000', name: 'Accounts Receivable', type: 'Asset', subType: 'Aset Lancar', normalBalance: 'Debit' },
  { id: '3', code: '113000000', name: 'Inventory', type: 'Asset', subType: 'Aset Lancar', normalBalance: 'Debit' },
  { id: '4', code: '121000000', name: 'Equipment', type: 'Asset', subType: 'Aset Tidak Lancar', normalBalance: 'Debit' },
  { id: '5', code: '122000000', name: 'Accumulated Depreciation', type: 'Asset', subType: 'Aset Tidak Lancar', normalBalance: 'Credit' },
  
  { id: '6', code: '211000000', name: 'Accounts Payable', type: 'Liability', subType: 'Liabilitas Jangka Pendek', normalBalance: 'Credit' },
  { id: '7', code: '212000000', name: 'Accrued Expenses', type: 'Liability', subType: 'Liabilitas Jangka Pendek', normalBalance: 'Credit' },
  { id: '8', code: '221000000', name: 'Long-term Debt', type: 'Liability', subType: 'Liabilitas Jangka Panjang', normalBalance: 'Credit' },
  
  { id: '9', code: '311000000', name: 'Common Stock', type: 'Equity', subType: 'Modal', normalBalance: 'Credit' },
  { id: '10', code: '312000000', name: 'Retained Earnings', type: 'Equity', subType: 'Saldo Laba', normalBalance: 'Credit' },
  { id: '11', code: '313000000', name: 'Dividends', type: 'Equity', subType: 'Prive / Dividen', normalBalance: 'Debit' },
  
  { id: '12', code: '411000000', name: 'Sales Revenue', type: 'Revenue', subType: 'Pendapatan Usaha', normalBalance: 'Credit' },
  { id: '13', code: '412000000', name: 'Service Revenue', type: 'Revenue', subType: 'Pendapatan Usaha', normalBalance: 'Credit' },
  
  { id: '14', code: '511000000', name: 'Cost of Goods Sold', type: 'Expense', subType: 'Beban Pokok Penjualan', normalBalance: 'Debit' },
  { id: '15', code: '512000000', name: 'Salaries Expense', type: 'Expense', subType: 'Beban Operasional', normalBalance: 'Debit' },
  { id: '16', code: '513000000', name: 'Rent Expense', type: 'Expense', subType: 'Beban Operasional', normalBalance: 'Debit' },
  { id: '17', code: '514000000', name: 'Depreciation Expense', type: 'Expense', subType: 'Beban Operasional', normalBalance: 'Debit' },
];

type NewAccount = Omit<Account, 'id'>;

interface AccountRow {
  id: string;
  code: string;
  sub_code: string | null;
  name: string;
  sub_name: string | null;
  type: AccountType;
  sub_type: string;
  normal_balance: NormalBalance;
  description: string | null;
}

interface JournalRow {
  id: string;
  document_number: string | null;
  created_at: string;
  date: string;
  description: string;
  type: JournalType;
  journal_entries: { id: string; account_id: string; debit: number | string; credit: number | string }[];
}

const ACCOUNT_COLUMNS = 'id, code, sub_code, name, sub_name, type, sub_type, normal_balance, description';
const JOURNAL_COLUMNS = 'id, document_number, created_at, date, description, type, journal_entries(id, account_id, debit, credit)';

const toAccountRow = (a: NewAccount) => ({
  code: a.code,
  sub_code: a.subCode || null,
  name: a.name,
  sub_name: a.subName || null,
  type: a.type,
  sub_type: a.subType,
  normal_balance: a.normalBalance,
  description: a.description || null,
});

const fromAccountRow = (r: AccountRow): Account => ({
  id: r.id,
  code: r.code,
  subCode: r.sub_code ?? undefined,
  name: r.name,
  subName: r.sub_name ?? undefined,
  type: r.type,
  subType: r.sub_type,
  normalBalance: r.normal_balance,
  description: r.description ?? undefined,
});

const fromJournalRow = (r: JournalRow): Journal => ({
  id: r.id,
  documentNumber: r.document_number ?? undefined,
  createdAt: r.created_at,
  date: r.date,
  description: r.description,
  type: r.type,
  entries: r.journal_entries.map(e => ({
    id: e.id,
    accountId: e.account_id,
    debit: Number(e.debit),
    credit: Number(e.credit),
  })),
});

const accountKey = (a: { code: string; subCode?: string }) => `${a.code}|${a.subCode ?? ''}`;

const compareAccounts = (a: Account, b: Account) =>
  a.code.localeCompare(b.code) || (a.subCode ?? '').localeCompare(b.subCode ?? '');

// Chronological: by date, then by the order they were entered
const compareJournals = (a: Journal, b: Journal) =>
  a.date.localeCompare(b.date) || (a.createdAt ?? '').localeCompare(b.createdAt ?? '');

const reportError = (action: string, error: { message: string } | null) => {
  if (!error) return false;
  console.error(action, error);
  alert(`${action}: ${error.message}`);
  return true;
};

const readLegacy = <T,>(key: string): T[] | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// First login: copy the chart of accounts and journals that were kept in this
// browser's localStorage (before the database existed), or the default accounts.
async function seedInitialData(supabase: SupabaseClient) {
  const legacyAccounts = readLegacy<Account>('accounts');
  const legacyJournals = readLegacy<Journal>('journals') ?? [];

  const sourceAccounts: Account[] = (legacyAccounts ?? defaultAccounts).map(a => ({
    ...a,
    subType: a.subType || defaultAccounts.find(d => d.id === a.id)?.subType || accountSubTypes[a.type][0],
  }));

  const { data: inserted, error } = await supabase
    .from('accounts')
    .insert(sourceAccounts.map(toAccountRow))
    .select(ACCOUNT_COLUMNS);
  if (error) throw error;

  const newIdByKey = new Map((inserted as AccountRow[]).map(r => [accountKey(fromAccountRow(r)), r.id]));
  const newIdByOldId = new Map(sourceAccounts.map(a => [a.id, newIdByKey.get(accountKey(a))]));

  const assignedNumbers: string[] = [];
  for (const journal of [...legacyJournals].sort((a, b) => a.date.localeCompare(b.date))) {
    const entries = journal.entries
      .map(e => ({ account_id: newIdByOldId.get(e.accountId), debit: e.debit, credit: e.credit }))
      .filter(e => e.account_id);
    if (entries.length === 0) continue;

    const documentNumber = nextDocumentNumber(assignedNumbers, journal.type, journal.date);
    assignedNumbers.push(documentNumber);

    const { data: row, error: journalError } = await supabase
      .from('journals')
      .insert({ document_number: documentNumber, date: journal.date, description: journal.description, type: journal.type })
      .select('id')
      .single();
    if (journalError) throw journalError;

    const { error: entriesError } = await supabase
      .from('journal_entries')
      .insert(entries.map(e => ({ ...e, journal_id: row.id })));
    if (entriesError) throw entriesError;
  }

  // Keep a backup instead of deleting, but stop using it
  for (const key of ['accounts', 'journals']) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      localStorage.setItem(`${key}-backup`, raw);
      localStorage.removeItem(key);
    }
  }
}

interface AppContextType {
  user: User | null;
  accounts: Account[];
  journals: Journal[];
  addJournal: (journal: Omit<Journal, 'id'>) => Promise<boolean>;
  deleteJournal: (id: string) => Promise<void>;
  addAccount: (account: NewAccount) => Promise<boolean>;
  updateAccount: (id: string, account: NewAccount) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<void>;
  isAccountUsed: (id: string) => boolean;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedForUser = useRef<string | null>(null);

  const loadData = useCallback(async (client: SupabaseClient) => {
    let { data: accountRows, error } = await client.from('accounts').select(ACCOUNT_COLUMNS);
    if (reportError('Gagal memuat akun', error)) return;

    if (accountRows?.length === 0) {
      try {
        await seedInitialData(client);
      } catch (e) {
        reportError('Gagal menyiapkan data awal', e as { message: string });
      }
      ({ data: accountRows, error } = await client.from('accounts').select(ACCOUNT_COLUMNS));
      if (reportError('Gagal memuat akun', error)) return;
    }

    const { data: journalRows, error: journalError } = await client.from('journals').select(JOURNAL_COLUMNS);
    if (reportError('Gagal memuat jurnal', journalError)) return;

    setAccounts((accountRows as AccountRow[]).map(fromAccountRow).sort(compareAccounts));
    setJournals((journalRows as JournalRow[]).map(fromJournalRow).sort(compareJournals));
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const handleUser = async (nextUser: User | null) => {
      setUser(nextUser);
      if (!nextUser) {
        loadedForUser.current = null;
        setAccounts([]);
        setJournals([]);
        setIsLoaded(true);
        return;
      }
      if (loadedForUser.current === nextUser.id) return;
      loadedForUser.current = nextUser.id;
      setIsLoaded(false);
      await loadData(supabase);
      setIsLoaded(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer so Supabase calls aren't made inside the auth callback
      setTimeout(() => handleUser(session?.user ?? null), 0);
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadData]);

  const addJournal = async (journal: Omit<Journal, 'id'>) => {
    if (!supabase) return false;

    const insertJournal = (existing: Journal[]) =>
      supabase
        .from('journals')
        .insert({
          document_number: nextDocumentNumber(existing.map(j => j.documentNumber), journal.type, journal.date),
          date: journal.date,
          description: journal.description,
          type: journal.type,
        })
        .select('id')
        .single();

    let { data: row, error } = await insertJournal(journals);
    if (error?.code === '23505') {
      // Number taken (e.g. saved from another tab): refresh and take the next one
      const { data: latest } = await supabase.from('journals').select(JOURNAL_COLUMNS);
      ({ data: row, error } = await insertJournal(((latest ?? []) as JournalRow[]).map(fromJournalRow)));
    }
    if (reportError('Gagal menyimpan jurnal', error) || !row) return false;

    const { error: entriesError } = await supabase.from('journal_entries').insert(
      journal.entries.map(e => ({ journal_id: row.id, account_id: e.accountId, debit: e.debit, credit: e.credit }))
    );
    if (reportError('Gagal menyimpan baris jurnal', entriesError)) {
      await supabase.from('journals').delete().eq('id', row.id);
      return false;
    }

    const { data: saved, error: reloadError } = await supabase
      .from('journals')
      .select(JOURNAL_COLUMNS)
      .eq('id', row.id)
      .single();
    if (reportError('Gagal memuat jurnal', reloadError)) return false;

    setJournals(prev => [...prev, fromJournalRow(saved as JournalRow)].sort(compareJournals));
    return true;
  };

  const deleteJournal = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('journals').delete().eq('id', id);
    if (reportError('Gagal menghapus jurnal', error)) return;
    setJournals(prev => prev.filter(j => j.id !== id));
  };

  const addAccount = async (account: NewAccount) => {
    if (!supabase) return false;
    const { data, error } = await supabase.from('accounts').insert(toAccountRow(account)).select(ACCOUNT_COLUMNS).single();
    if (reportError('Gagal menambah akun', error)) return false;
    setAccounts(prev => [...prev, fromAccountRow(data as AccountRow)].sort(compareAccounts));
    return true;
  };

  const updateAccount = async (id: string, account: NewAccount) => {
    if (!supabase) return false;
    const { data, error } = await supabase
      .from('accounts')
      .update(toAccountRow(account))
      .eq('id', id)
      .select(ACCOUNT_COLUMNS)
      .single();
    if (reportError('Gagal mengubah akun', error)) return false;
    setAccounts(prev => prev.map(a => (a.id === id ? fromAccountRow(data as AccountRow) : a)).sort(compareAccounts));
    return true;
  };

  const isAccountUsed = (id: string) =>
    journals.some(j => j.entries.some(e => e.accountId === id));

  const deleteAccount = async (id: string) => {
    if (!supabase || isAccountUsed(id)) return;
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (reportError('Gagal menghapus akun', error)) return;
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // The login page doesn't need the user's data
  const showChildren = isLoaded || !supabase || pathname === '/login';

  return (
    <AppContext.Provider
      value={{ user, accounts, journals, addJournal, deleteJournal, addAccount, updateAccount, deleteAccount, isAccountUsed, signOut }}
    >
      {showChildren ? children : (
        <div className="flex h-screen w-full items-center justify-center text-slate-500">Memuat data...</div>
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
