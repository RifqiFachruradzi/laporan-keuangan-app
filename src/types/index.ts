export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
export type NormalBalance = 'Debit' | 'Credit';

export const accountSubTypes: Record<AccountType, string[]> = {
  Asset: ['Aset Lancar', 'Aset Tidak Lancar'],
  Liability: ['Liabilitas Jangka Pendek', 'Liabilitas Jangka Panjang'],
  Equity: ['Modal', 'Saldo Laba', 'Prive / Dividen'],
  Revenue: ['Pendapatan Usaha', 'Pendapatan Lain-lain'],
  Expense: ['Beban Pokok Penjualan', 'Beban Operasional', 'Beban Lain-lain'],
};
export type JournalType = 'Standard' | 'Adjustment' | 'Elimination';

export interface Account {
  id: string;
  code: string;
  subCode?: string;
  name: string;
  subName?: string;
  type: AccountType;
  subType: string;
  normalBalance: NormalBalance;
  description?: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
}

export interface Journal {
  id: string;
  // Generated on save, e.g. JU-202610-0001
  documentNumber?: string;
  createdAt?: string;
  date: string;
  description: string;
  type: JournalType;
  entries: JournalEntryLine[];
}

export type AgingKind = 'receivable' | 'payable';

export interface AgingItem {
  id: string;
  date: string;
  dueDate: string;
  description: string;
  amount: number;
  outstanding: number;
  age: number;
  // 0: not yet due, 1: 1-30, 2: 31-60, 3: 61-90, 4: > 90 days overdue
  bucket: number;
}
