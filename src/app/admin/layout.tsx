'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, LogOut, Activity, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Documents', href: '/admin/documents', icon: FileText },
    { name: 'Applications', href: '/admin/applications', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-brand-primary/20">
      {/* Premium Light Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex-col hidden md:flex relative overflow-hidden shadow-sm">
        <div className="p-8 pb-6 relative z-10 border-b border-slate-100">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">SignGenius</span>
          </Link>
        </div>

        <div className="flex-1 py-8 px-6 space-y-2 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-4">Menu</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname.includes(item.href);
              return (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative group ${
                    isActive 
                      ? 'text-brand-primary bg-brand-primary/10' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-brand-primary' : 'group-hover:text-slate-700'}`} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 relative z-10 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">Admin User</p>
                <p className="text-xs text-slate-500 truncate">info@signdocgenius.com</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-3.5 w-full rounded-2xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 border border-transparent transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top decorative gradient for main content */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

        {/* Mobile Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between md:hidden sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-purple-600 rounded-lg flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">SignGenius</h2>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-10 relative z-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
