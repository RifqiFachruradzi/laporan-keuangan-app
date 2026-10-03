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
  FileText,
  ListTree,
  CalendarClock,
  Hourglass,
  LogOut
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { clsx } from 'clsx';

const sections = [
  {
    title: 'Utama',
    routes: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Chart of Accounts', path: '/coa', icon: ListTree },
    ],
  },
  {
    title: 'Transaksi',
    routes: [
      { name: 'Jurnal Entry', path: '/jurnal', icon: BookOpen },
      { name: 'Jurnal Penyesuaian', path: '/jurnal-adjustment', icon: Edit3 },
      { name: 'Jurnal Eliminasi', path: '/jurnal-eliminasi', icon: Scissors },
    ],
  },
  {
    title: 'Buku & Saldo',
    routes: [
      { name: 'Buku Besar', path: '/buku-besar', icon: Library },
      { name: 'Buku Pembantu', path: '/buku-pembantu', icon: BookMinus },
      { name: 'Aging Piutang', path: '/aging-piutang', icon: CalendarClock },
      { name: 'Aging Hutang', path: '/aging-hutang', icon: Hourglass },
      { name: 'Neraca Saldo', path: '/neraca-saldo', icon: Scale },
      { name: 'Neraca Lajur', path: '/neraca-lajur', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Laporan',
    routes: [
      { name: 'Laba Rugi', path: '/laba-rugi', icon: TrendingDown },
      { name: 'Neraca', path: '/neraca', icon: Wallet },
      { name: 'Arus Kas', path: '/arus-kas', icon: Activity },
      { name: 'Perubahan Ekuitas', path: '/ekuitas', icon: PieChart },
      { name: 'Catatan Laporan', path: '/notes', icon: FileText },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAppContext();

  return (
    <aside className="w-60 shrink-0 bg-slate-950 text-slate-100 h-full flex flex-col">
      <div className="px-5 pt-6 pb-5">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400">AMS</p>
        <h1 className="mt-1 text-lg font-semibold leading-tight text-white">Accounting Management System</h1>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {sections.map(section => (
          <div key={section.title}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-500">{section.title}</p>
            <ul className="space-y-0.5">
              {section.routes.map((route) => {
                const isActive = pathname === route.path;
                const Icon = route.icon;
                return (
                  <li key={route.path}>
                    <Link
                      href={route.path}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors',
                        isActive
                          ? 'bg-white/[0.06] text-white font-medium'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                      )}
                    >
                      <Icon className={clsx('w-4 h-4', isActive && 'text-emerald-400')} />
                      {route.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {user && (
        <div className="border-t border-white/5 p-3">
          <p className="truncate px-3 text-xs text-slate-500" title={user.email}>{user.email}</p>
          <button
            type="button"
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-100"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      )}
    </aside>
  );
}
