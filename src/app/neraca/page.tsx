'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateAccountBalances, calculateNetBalance, formatRupiah } from '@/lib/accounting-utils';

export default function NeracaPage() {
  const { accounts, journals } = useAppContext();
  const balances = calculateAccountBalances(journals);

  // Calculate Net Income first
  let totalRevenue = 0;
  let totalExpense = 0;
  accounts.forEach(acc => {
    const b = balances[acc.id] || { debit: 0, credit: 0 };
    const net = calculateNetBalance(b.debit, b.credit, acc.normalBalance);
    if (acc.type === 'Revenue') totalRevenue += net;
    if (acc.type === 'Expense') totalExpense += net;
  });
  const netIncome = totalRevenue - totalExpense;

  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquityBeforeNet = 0;

  const assets = accounts.filter(a => a.type === 'Asset').map(acc => {
    const b = balances[acc.id] || { debit: 0, credit: 0 };
    const net = calculateNetBalance(b.debit, b.credit, acc.normalBalance);
    totalAssets += net;
    return { ...acc, balance: net };
  }).filter(a => a.balance !== 0);

  const liabilities = accounts.filter(a => a.type === 'Liability').map(acc => {
    const b = balances[acc.id] || { debit: 0, credit: 0 };
    const net = calculateNetBalance(b.debit, b.credit, acc.normalBalance);
    totalLiabilities += net;
    return { ...acc, balance: net };
  }).filter(a => a.balance !== 0);

  const equities = accounts.filter(a => a.type === 'Equity').map(acc => {
    const b = balances[acc.id] || { debit: 0, credit: 0 };
    const net = calculateNetBalance(b.debit, b.credit, acc.normalBalance);
    // Dividends decrease equity, but its normal balance is Debit.
    // If it's a debit balance account but part of equity, we subtract it.
    const actualImpact = acc.normalBalance === 'Debit' ? -net : net;
    totalEquityBeforeNet += actualImpact;
    return { ...acc, balance: net, impact: actualImpact };
  }).filter(a => a.balance !== 0);

  const totalEquity = totalEquityBeforeNet + netIncome;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Laporan Neraca (Balance Sheet)</h1>
      
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Perusahaan<br/>
            Laporan Neraca<br/>
            <span className="text-sm font-normal text-slate-500">Per Tanggal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Assets */}
            <div>
              <h3 className="font-bold text-lg mb-2 border-b pb-1">Aset (Assets)</h3>
              <div className="space-y-1">
                {assets.map(asset => (
                  <div key={asset.id} className="flex justify-between">
                    <span>{asset.name}</span>
                    <span>{formatRupiah(asset.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold mt-4 pt-2 border-t text-emerald-800">
                <span>Total Aset</span>
                <span>{formatRupiah(totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div>
              <h3 className="font-bold text-lg mb-2 border-b pb-1">Kewajiban (Liabilities)</h3>
              <div className="space-y-1">
                {liabilities.map(liab => (
                  <div key={liab.id} className="flex justify-between">
                    <span>{liab.name}</span>
                    <span>{formatRupiah(liab.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold mt-2 mb-6 pt-2 border-t">
                <span>Total Kewajiban</span>
                <span>{formatRupiah(totalLiabilities)}</span>
              </div>

              <h3 className="font-bold text-lg mb-2 border-b pb-1">Ekuitas (Equity)</h3>
              <div className="space-y-1">
                {equities.map(eq => (
                  <div key={eq.id} className="flex justify-between">
                    <span>{eq.name}</span>
                    <span>{eq.impact < 0 ? `(${formatRupiah(Math.abs(eq.balance))})` : formatRupiah(eq.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-emerald-600">
                  <span>Net Income</span>
                  <span>{formatRupiah(netIncome)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total Ekuitas</span>
                <span>{formatRupiah(totalEquity)}</span>
              </div>

              <div className="flex justify-between font-bold mt-8 pt-2 border-t-2 border-slate-800 text-emerald-800">
                <span>Total Kewajiban & Ekuitas</span>
                <span>{formatRupiah(totalLiabilitiesAndEquity)}</span>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
