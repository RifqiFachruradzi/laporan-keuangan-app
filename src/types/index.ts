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
  type: AccountType;
  subType: string;
  normalBalance: NormalBalance;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
}

export interface Journal {
  id: string;
  date: string;
  description: string;
  type: JournalType;
  entries: JournalEntryLine[];
}
