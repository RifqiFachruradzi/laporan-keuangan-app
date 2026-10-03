export const formatAccountNumber = (account: Pick<Account, 'code' | 'subCode'>) =>
  account.subCode ? `${account.code}-${account.subCode}` : account.code;

export const formatAccountName = (account: Pick<Account, 'name' | 'subName'>) =>
  account.subName ? `${account.name} - ${account.subName}` : account.name;

export const formatRupiah = (amount: number) => {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const formatted = formatter.format(Math.abs(amount));
  return amount < 0 ? `(${formatted})` : formatted;
};

import { Account, Journal, JournalType } from '@/types';

export const calculateAccountBalances = (journals: Journal[], type: JournalType[] = ['Standard', 'Adjustment']) => {
  const balances: Record<string, { debit: number; credit: number; net: number }> = {};
  
  const filteredJournals = journals.filter(j => type.includes(j.type));

  filteredJournals.forEach(journal => {
    journal.entries.forEach(entry => {
      if (!balances[entry.accountId]) {
        balances[entry.accountId] = { debit: 0, credit: 0, net: 0 };
      }
      balances[entry.accountId].debit += entry.debit;
      balances[entry.accountId].credit += entry.credit;
    });
  });

  return balances;
};

export const calculateNetBalance = (debit: number, credit: number, normalBalance: 'Debit' | 'Credit') => {
  if (normalBalance === 'Debit') {
    return debit - credit;
  }
  return credit - debit;
};
