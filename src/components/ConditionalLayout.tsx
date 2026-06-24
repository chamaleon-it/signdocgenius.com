'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <Navbar />;
}

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <Footer />;
}

export function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  
  return (
    <main className={isAdmin ? 'flex-1' : 'flex-1 pt-24 pb-12'}>
      {children}
    </main>
  );
}
