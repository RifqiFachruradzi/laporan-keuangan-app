export const formatAccountNumber = (account: Pick<Account, 'code' | 'subCode'>) =>
  account.subCode ? `${account.code}-${account.subCode}` : account.code;

export const formatAccountName = (account: Pick<Account, 'name' | 'subName'>) =>
  account.subName ? `${account.name} - ${account.subName}` : account.name;

export const formatAccountLabel = (account: Pick<Account, 'code' | 'subCode' | 'name' | 'subName'>) =>
  `${formatAccountNumber(account)} - ${formatAccountName(account)}`;

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

import { Account, AgingItem, AgingKind, Journal, JournalType } from '@/types';

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

const DAY_MS = 24 * 60 * 60 * 1000;

const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
};

const daysBetween = (from: string, to: string) =>
  Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / DAY_MS);

const agingBucket = (daysOverdue: number) => {
  if (daysOverdue <= 0) return 0;
  if (daysOverdue <= 30) return 1;
  if (daysOverdue <= 60) return 2;
  if (daysOverdue <= 90) return 3;
  return 4;
};

// Ages the open balance of a receivable or payable account as of a date.
// Increases (debit for receivables, credit for payables) open new items; decreases
// are applied to the oldest open items first (FIFO).
export const calculateAging = (
  journals: Journal[],
  accountId: string,
  kind: AgingKind,
  asOfDate: string,
  termDays: number
) => {
  const lines = journals
    .filter(j => j.type !== 'Elimination' && j.date <= asOfDate)
    .flatMap(j =>
      j.entries
        .filter(e => e.accountId === accountId)
        .map(e => ({
          id: e.id,
          date: j.date,
          description: j.description,
          increase: kind === 'receivable' ? e.debit - e.credit : e.credit - e.debit,
        }))
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const open: { id: string; date: string; description: string; amount: number; outstanding: number }[] = [];
  let unapplied = 0;

  lines.forEach(line => {
    if (line.increase > 0) {
      const applied = Math.min(unapplied, line.increase);
      unapplied -= applied;
      open.push({ ...line, amount: line.increase, outstanding: line.increase - applied });
    } else if (line.increase < 0) {
      let remaining = -line.increase;
      for (const item of open) {
        if (remaining === 0) break;
        const applied = Math.min(item.outstanding, remaining);
        item.outstanding -= applied;
        remaining -= applied;
      }
      unapplied += remaining;
    }
  });

  const items: AgingItem[] = open
    .filter(item => item.outstanding > 0)
    .map(item => {
      const dueDate = addDays(item.date, termDays);
      return {
        ...item,
        dueDate,
        age: daysBetween(item.date, asOfDate),
        bucket: agingBucket(daysBetween(dueDate, asOfDate)),
      };
    });

  const bucketTotals = [0, 0, 0, 0, 0];
  items.forEach(item => {
    bucketTotals[item.bucket] += item.outstanding;
  });
  // Overpayments not matched to any item reduce the current bucket
  bucketTotals[0] -= unapplied;

  const total = bucketTotals.reduce((sum, v) => sum + v, 0);

  return { items, bucketTotals, total };
};
