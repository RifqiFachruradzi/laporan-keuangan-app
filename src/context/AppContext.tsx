'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, Journal, JournalType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const defaultAccounts: Account[] = [
  { id: '1', code: '111', name: 'Cash', type: 'Asset', normalBalance: 'Debit' },
  { id: '2', code: '112', name: 'Accounts Receivable', type: 'Asset', normalBalance: 'Debit' },
  { id: '3', code: '113', name: 'Inventory', type: 'Asset', normalBalance: 'Debit' },
  { id: '4', code: '121', name: 'Equipment', type: 'Asset', normalBalance: 'Debit' },
  { id: '5', code: '122', name: 'Accumulated Depreciation', type: 'Asset', normalBalance: 'Credit' },
  
  { id: '6', code: '211', name: 'Accounts Payable', type: 'Liability', normalBalance: 'Credit' },
  { id: '7', code: '212', name: 'Accrued Expenses', type: 'Liability', normalBalance: 'Credit' },
  { id: '8', code: '221', name: 'Long-term Debt', type: 'Liability', normalBalance: 'Credit' },
  
  { id: '9', code: '311', name: 'Common Stock', type: 'Equity', normalBalance: 'Credit' },
  { id: '10', code: '312', name: 'Retained Earnings', type: 'Equity', normalBalance: 'Credit' },
  { id: '11', code: '313', name: 'Dividends', type: 'Equity', normalBalance: 'Debit' },
  
  { id: '12', code: '411', name: 'Sales Revenue', type: 'Revenue', normalBalance: 'Credit' },
  { id: '13', code: '412', name: 'Service Revenue', type: 'Revenue', normalBalance: 'Credit' },
  
  { id: '14', code: '511', name: 'Cost of Goods Sold', type: 'Expense', normalBalance: 'Debit' },
  { id: '15', code: '512', name: 'Salaries Expense', type: 'Expense', normalBalance: 'Debit' },
  { id: '16', code: '513', name: 'Rent Expense', type: 'Expense', normalBalance: 'Debit' },
  { id: '17', code: '514', name: 'Depreciation Expense', type: 'Expense', normalBalance: 'Debit' },
];

interface AppContextType {
  accounts: Account[];
  journals: Journal[];
  addJournal: (journal: Omit<Journal, 'id'>) => void;
  deleteJournal: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accounts] = useState<Account[]>(defaultAccounts);
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
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('journals', JSON.stringify(journals));
    }
  }, [journals, isLoaded]);

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

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <AppContext.Provider value={{ accounts, journals, addJournal, deleteJournal }}>
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
