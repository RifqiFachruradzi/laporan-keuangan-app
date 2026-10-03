'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, Journal, JournalType, accountSubTypes } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const defaultAccounts: Account[] = [
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

interface AppContextType {
  accounts: Account[];
  journals: Journal[];
  addJournal: (journal: Omit<Journal, 'id'>) => void;
  deleteJournal: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  isAccountUsed: (id: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('journals');
    if (saved) {
      try {
        setJournals(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse journals', e);
      }
    }
    const savedAccounts = localStorage.getItem('accounts');
    if (savedAccounts) {
      try {
        const parsed: Account[] = JSON.parse(savedAccounts);
        // Accounts saved before Sub Type existed get a default one
        setAccounts(parsed.map(a => ({
          ...a,
          subType:
            a.subType ||
            defaultAccounts.find(d => d.id === a.id)?.subType ||
            accountSubTypes[a.type][0],
        })));
      } catch (e) {
        console.error('Failed to parse accounts', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('journals', JSON.stringify(journals));
    }
  }, [journals, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('accounts', JSON.stringify(accounts));
    }
  }, [accounts, isLoaded]);

  const addJournal = (journal: Omit<Journal, 'id'>) => {
    const newJournal: Journal = {
      ...journal,
      id: uuidv4(),
      entries: journal.entries.map(e => ({ ...e, id: uuidv4() }))
    };
    setJournals(prev => [...prev, newJournal]);
  };

  const deleteJournal = (id: string) => {
    setJournals(prev => prev.filter(j => j.id !== id));
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    setAccounts(prev =>
      [...prev, { ...account, id: uuidv4() }].sort((a, b) => a.code.localeCompare(b.code))
    );
  };

  const updateAccount = (id: string, account: Omit<Account, 'id'>) => {
    setAccounts(prev =>
      prev.map(a => (a.id === id ? { ...account, id } : a)).sort((a, b) => a.code.localeCompare(b.code))
    );
  };

  const isAccountUsed = (id: string) =>
    journals.some(j => j.entries.some(e => e.accountId === id));

  const deleteAccount = (id: string) => {
    if (isAccountUsed(id)) return;
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <AppContext.Provider value={{ accounts, journals, addJournal, deleteJournal, addAccount, updateAccount, deleteAccount, isAccountUsed }}>
      {children}
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
