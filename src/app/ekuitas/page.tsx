'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateAccountBalances, calculateNetBalance, formatRupiah } from '@/lib/accounting-utils';

export default function EkuitasPage() {
  const { accounts, journals } = useAppContext();
  const balances = calculateAccountBalances(journals);

  // Net Income
  let totalRevenue = 0;
  let totalExpense = 0;
  accounts.forEach(acc => {
    const b = balances[acc.id] || { debit: 0, credit: 0 };
    const net = calculateNetBalance(b.debit, b.credit, acc.normalBalance);
    if (acc.type === 'Revenue') totalRevenue += net;
    if (acc.type === 'Expense') totalExpense += net;
  });
  const netIncome = totalRevenue - totalExpense;

  // Equity details
  const retainedEarningsAcc = accounts.find(a => a.name.includes('Retained'));
  const dividendsAcc = accounts.find(a => a.name.includes('Dividends'));
  
  const retainedEarnings = retainedEarningsAcc ? calculateNetBalance(balances[retainedEarningsAcc.id]?.debit || 0, balances[retainedEarningsAcc.id]?.credit || 0, 'Credit') : 0;
  const dividends = dividendsAcc ? calculateNetBalance(balances[dividendsAcc.id]?.debit || 0, balances[dividendsAcc.id]?.credit || 0, 'Debit') : 0;

  const beginningEquity = retainedEarnings; // simplified
  const endingEquity = beginningEquity + netIncome - dividends;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Laporan Perubahan Ekuitas (Statement of Equity)</h1>
      
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Perusahaan<br/>
            Laporan Perubahan Ekuitas<br/>
            <span className="text-sm font-normal text-slate-500">Periode yang Berakhir</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            <div className="flex justify-between">
              <span>Modal Awal (Beginning Retained Earnings)</span>
              <span>{formatRupiah(beginningEquity)}</span>
            </div>
            
            <div className="flex justify-between text-emerald-600 pl-4">
              <span>Ditambah: Laba Bersih (Net Income)</span>
              <span>{formatRupiah(netIncome)}</span>
            </div>
            
            <div className="flex justify-between text-red-600 pl-4">
              <span>Dikurangi: Dividen (Dividends)</span>
              <span>({formatRupiah(dividends)})</span>
            </div>
            
            <div className="flex justify-between font-bold pt-4 border-t-2 border-slate-800">
              <span>Modal Akhir (Ending Retained Earnings)</span>
              <span>{formatRupiah(endingEquity)}</span>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
