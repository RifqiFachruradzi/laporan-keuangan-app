'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  BookMinus, 
  Scale, 
  FileSpreadsheet, 
  Edit3, 
  Scissors, 
  TrendingDown, 
  Wallet, 
  Activity, 
  PieChart, 
  FileText 
} from 'lucide-react';
import { clsx } from 'clsx';

const routes = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Jurnal Entry', path: '/jurnal', icon: BookOpen },
  { name: 'Buku Besar', path: '/buku-besar', icon: Library },
  { name: 'Buku Pembantu', path: '/buku-pembantu', icon: BookMinus },
  { name: 'Neraca Saldo', path: '/neraca-saldo', icon: Scale },
  { name: 'Neraca Lajur', path: '/neraca-lajur', icon: FileSpreadsheet },
  { name: 'Jurnal Penyesuaian', path: '/jurnal-adjustment', icon: Edit3 },
  { name: 'Jurnal Eliminasi', path: '/jurnal-eliminasi', icon: Scissors },
  { name: 'Laba Rugi', path: '/laba-rugi', icon: TrendingDown },
  { name: 'Neraca', path: '/neraca', icon: Wallet },
  { name: 'Arus Kas', path: '/arus-kas', icon: Activity },
  { name: 'Perubahan Ekuitas', path: '/ekuitas', icon: PieChart },
  { name: 'Catatan Laporan', path: '/notes', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-400">FinanceApp</h1>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        <ul className="space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.path;
            const Icon = route.icon;
            return (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                      : 'hover:bg-slate-800 text-slate-300 hover:text-slate-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {route.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
