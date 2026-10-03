'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const fullScreenPaths = ['/login'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (fullScreenPaths.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
