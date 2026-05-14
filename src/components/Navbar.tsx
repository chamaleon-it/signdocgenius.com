'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, Shield, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
            <Shield className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">DocuSign</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/solutions">Solutions <ChevronDown size={14} className="ml-1" /></NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/resources">Resources</NavLink>
          <NavLink href="/support">Support</NavLink>
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
          >
            Log In
          </Link>
          <Link 
            href="/sign" 
            className="px-6 py-2.5 bg-brand-primary text-white rounded-full text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 shadow-xl"
        >
          <div className="flex flex-col gap-4">
            <Link href="/solutions" className="text-lg font-medium text-slate-900">Solutions</Link>
            <Link href="/pricing" className="text-lg font-medium text-slate-900">Pricing</Link>
            <Link href="/resources" className="text-lg font-medium text-slate-900">Resources</Link>
            <Link href="/support" className="text-lg font-medium text-slate-900">Support</Link>
            <div className="h-px bg-slate-100 my-2" />
            <Link href="/login" className="text-lg font-medium text-slate-600">Log In</Link>
            <Link href="/sign" className="w-full py-3 bg-brand-primary text-white text-center rounded-xl font-bold shadow-lg shadow-brand-primary/20">Get Started</Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="flex items-center text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
