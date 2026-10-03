'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, Journal, JournalType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const defaultAccounts: Account[] = [
  { id: '1', code: '111000000', name: 'Cash', type: 'Asset', normalBalance: 'Debit' },
  { id: '2', code: '112000000', name: 'Accounts Receivable', type: 'Asset', normalBalance: 'Debit' },
  { id: '3', code: '113000000', name: 'Inventory', type: 'Asset', normalBalance: 'Debit' },
  { id: '4', code: '121000000', name: 'Equipment', type: 'Asset', normalBalance: 'Debit' },
  { id: '5', code: '122000000', name: 'Accumulated Depreciation', type: 'Asset', normalBalance: 'Credit' },
  
  { id: '6', code: '211000000', name: 'Accounts Payable', type: 'Liability', normalBalance: 'Credit' },
  { id: '7', code: '212000000', name: 'Accrued Expenses', type: 'Liability', normalBalance: 'Credit' },
  { id: '8', code: '221000000', name: 'Long-term Debt', type: 'Liability', normalBalance: 'Credit' },
  
  { id: '9', code: '311000000', name: 'Common Stock', type: 'Equity', normalBalance: 'Credit' },
  { id: '10', code: '312000000', name: 'Retained Earnings', type: 'Equity', normalBalance: 'Credit' },
  { id: '11', code: '313000000', name: 'Dividends', type: 'Equity', normalBalance: 'Debit' },
  
  { id: '12', code: '411000000', name: 'Sales Revenue', type: 'Revenue', normalBalance: 'Credit' },
  { id: '13', code: '412000000', name: 'Service Revenue', type: 'Revenue', normalBalance: 'Credit' },
  
  { id: '14', code: '511000000', name: 'Cost of Goods Sold', type: 'Expense', normalBalance: 'Debit' },
  { id: '15', code: '512000000', name: 'Salaries Expense', type: 'Expense', normalBalance: 'Debit' },
  { id: '16', code: '513000000', name: 'Rent Expense', type: 'Expense', normalBalance: 'Debit' },
  { id: '17', code: '514000000', name: 'Depreciation Expense', type: 'Expense', normalBalance: 'Debit' },
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
