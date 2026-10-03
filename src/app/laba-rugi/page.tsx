'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateAccountBalances, calculateNetBalance, formatRupiah } from '@/lib/accounting-utils';

export default function LabaRugiPage() {
  const { accounts, journals } = useAppContext();
  const balances = calculateAccountBalances(journals); // include standard + adj

  let totalRevenue = 0;
  let totalExpense = 0;

  const revenues = accounts.filter(a => a.type === 'Revenue').map(acc => {
    const b = balances[acc.id] || { debit: 0, credit: 0 };
    const net = calculateNetBalance(b.debit, b.credit, acc.normalBalance);
    totalRevenue += net;
    return { ...acc, balance: net };
  }).filter(a => a.balance !== 0);

  const expenses = accounts.filter(a => a.type === 'Expense').map(acc => {
    const b = balances[acc.id] || { debit: 0, credit: 0 };
    const net = calculateNetBalance(b.debit, b.credit, acc.normalBalance);
    totalExpense += net;
    return { ...acc, balance: net };
  }).filter(a => a.balance !== 0);

  const netIncome = totalRevenue - totalExpense;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Laporan Laba Rugi (Income Statement)</h1>
      
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Perusahaan<br/>
            Laporan Laba Rugi<br/>
            <span className="text-sm font-normal text-slate-500">Periode yang Berakhir</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Revenues */}
            <div>
              <h3 className="font-bold text-lg mb-2 border-b pb-1">Pendapatan (Revenues)</h3>
              <div className="space-y-1">
                {revenues.map(rev => (
                  <div key={rev.id} className="flex justify-between">
                    <span>{rev.name}</span>
                    <span>{formatRupiah(rev.balance)}</span>
                  </div>
                ))}
                {revenues.length === 0 && <div className="text-slate-500 italic">Tidak ada pendapatan</div>}
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total Pendapatan</span>
                <span>{formatRupiah(totalRevenue)}</span>
              </div>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="font-bold text-lg mb-2 border-b pb-1">Beban (Expenses)</h3>
              <div className="space-y-1">
                {expenses.map(exp => (
                  <div key={exp.id} className="flex justify-between">
                    <span>{exp.name}</span>
                    <span>{formatRupiah(exp.balance)}</span>
                  </div>
                ))}
                {expenses.length === 0 && <div className="text-slate-500 italic">Tidak ada beban</div>}
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total Beban</span>
                <span>{formatRupiah(totalExpense)}</span>
              </div>
            </div>

            {/* Net Income */}
            <div className={`flex justify-between text-xl font-bold p-4 rounded-md ${netIncome >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              <span>{netIncome >= 0 ? 'Laba Bersih (Net Income)' : 'Rugi Bersih (Net Loss)'}</span>
              <span>{formatRupiah(Math.abs(netIncome))}</span>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
