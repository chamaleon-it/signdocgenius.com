'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-3xl -z-10 animate-float" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-brand-light/10 rounded-full blur-3xl -z-10" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
            </span>
            New: DocuSign AI Labs
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
            The way the world <span className="text-brand-primary">agrees</span>.
          </h1>

          <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
            Streamline your business with the world's #1 way to sign and manage agreements. Secure, legally binding, and stunningly simple.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="/sign"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg shadow-2xl shadow-brand-primary/30 hover:bg-brand-hover hover:-translate-y-1 active:translate-y-0 transition-all"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>

          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> Free 30-day trial</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> No credit card required</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative z-10 glass p-4 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(67,0,152,0.15)]">
            <div className="bg-slate-900 rounded-4xl overflow-hidden aspect-4/3 relative">
              {/* Mockup Content */}
              <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-slate-900 p-8">
                <div className="h-full border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ArrowRight className="text-brand-primary rotate-45" size={32} />
                    </div>
                    <p className="text-slate-400 font-medium">Drag & Drop Documents Here</p>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-10 right-10 glass-dark p-4 rounded-2xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                    <p className="text-sm text-white font-bold tracking-tight">Signed Successfully</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-light rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '3s' }} />
        </motion.div>
      </div>
    </section>
  );
}
