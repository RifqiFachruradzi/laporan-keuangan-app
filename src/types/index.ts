export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
export type NormalBalance = 'Debit' | 'Credit';
export type JournalType = 'Standard' | 'Adjustment' | 'Elimination';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
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
