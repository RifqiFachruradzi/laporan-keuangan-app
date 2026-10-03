'use client';

import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateAccountBalances, calculateNetBalance, formatRupiah } from '@/lib/accounting-utils';

export default function ArusKasPage() {
  const { accounts, journals } = useAppContext();
  const balances = calculateAccountBalances(journals);

  // Heuristics for cash flow:
  // Operating: Net Income + Depreciation + changes in current assets/liabilities
  // Investing: changes in long-term assets
  // Financing: changes in long term debt and equity (dividends)

  // Net Income
  let totalRevenue = 0;
  let totalExpense = 0;
  let depreciation = 0;

  accounts.forEach(acc => {
    const b = balances[acc.id] || { debit: 0, credit: 0 };
    const net = calculateNetBalance(b.debit, b.credit, acc.normalBalance);
    if (acc.type === 'Revenue') totalRevenue += net;
    if (acc.type === 'Expense') {
      totalExpense += net;
      if (acc.name.toLowerCase().includes('depreciation')) {
        depreciation += net;
      }
    }
  });
  const netIncome = totalRevenue - totalExpense;

  // Let's assume some simplified heuristics
  // Cash balance
  const cashAccount = accounts.find(a => a.name.toLowerCase().includes('cash'));
  const cashNet = cashAccount ? calculateNetBalance(balances[cashAccount.id]?.debit || 0, balances[cashAccount.id]?.credit || 0, 'Debit') : 0;

  // This is a highly simplified presentation for UI requirements.
  const operatingCashFlow = netIncome + depreciation; // Assuming other changes are 0 for simplicity
  const investingCashFlow = 0; // equipment purchases would go here
  const financingCashFlow = cashNet - (operatingCashFlow + investingCashFlow);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Laporan Arus Kas (Cash Flow)</h1>
      <p className="text-slate-500">Note: This is a simplified direct/indirect method cashflow statement.</p>
      
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Perusahaan<br/>
            Laporan Arus Kas<br/>
            <span className="text-sm font-normal text-slate-500">Periode yang Berakhir</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            <div>
              <h3 className="font-bold text-lg mb-2">Aktivitas Operasi (Operating Activities)</h3>
              <div className="space-y-1 ml-4">
                <div className="flex justify-between">
                  <span>Laba Bersih (Net Income)</span>
                  <span>{formatRupiah(netIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penyusutan (Depreciation)</span>
                  <span>{formatRupiah(depreciation)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t ml-4">
                <span>Arus Kas Bersih dari Operasi</span>
                <span>{formatRupiah(operatingCashFlow)}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Aktivitas Investasi (Investing Activities)</h3>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t ml-4">
                <span>Arus Kas Bersih dari Investasi</span>
                <span>{formatRupiah(investingCashFlow)}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Aktivitas Pendanaan (Financing Activities)</h3>
              <div className="space-y-1 ml-4">
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>(Computed to balance Cash)</span>
                  <span>{formatRupiah(financingCashFlow)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t ml-4">
                <span>Arus Kas Bersih dari Pendanaan</span>
                <span>{formatRupiah(financingCashFlow)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold p-4 bg-slate-100 rounded-md">
              <span>Kenaikan (Penurunan) Kas Bersih</span>
              <span>{formatRupiah(cashNet)}</span>
            </div>
            
            <div className="flex justify-between font-bold p-4 bg-emerald-50 text-emerald-800 rounded-md mt-2">
              <span>Saldo Kas Akhir (Ending Cash)</span>
              <span>{formatRupiah(cashNet)}</span>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
