'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateAccountBalances, calculateNetBalance, formatRupiah } from '@/lib/accounting-utils';

export default function Dashboard() {
  const { accounts, journals } = useAppContext();
  const balances = calculateAccountBalances(journals);

  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalRevenue = 0;
  let totalExpenses = 0;

  accounts.forEach(acc => {
    const accBalance = balances[acc.id] || { debit: 0, credit: 0 };
    const net = calculateNetBalance(accBalance.debit, accBalance.credit, acc.normalBalance);
    
    if (acc.type === 'Asset') totalAssets += net;
    if (acc.type === 'Liability') totalLiabilities += net;
    if (acc.type === 'Revenue') totalRevenue += net;
    if (acc.type === 'Expense') totalExpenses += net;
  });

  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatRupiah(totalAssets)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatRupiah(totalLiabilities)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatRupiah(totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatRupiah(netIncome)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {journals.length === 0 ? (
            <p className="text-slate-500 text-sm">No journal entries found.</p>
          ) : (
            <div className="space-y-4">
              {journals.slice(-5).reverse().map(journal => (
                <div key={journal.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold">{journal.date}</span>
                      <span className="ml-2 text-slate-500">- {journal.description}</span>
                    </div>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">{journal.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
