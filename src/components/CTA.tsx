'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-brand-primary rounded-[3rem] p-12 md:p-20 text-center"
        >
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-light/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold mb-8">
              <Sparkles size={16} className="text-yellow-400" />
              Trusted by 1M+ companies worldwide
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-[1.1]">
              Ready to transform how you <span className="text-yellow-400">agree</span>?
            </h2>
            
            <p className="text-xl text-white/80 mb-12 font-medium leading-relaxed">
              Join millions of users who are saving time, reducing costs, and delighting their customers with DocuSign.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/sign" 
                className="px-10 py-5 bg-white text-brand-primary rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Get Started Now <ArrowRight size={24} />
              </Link>
              <button className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-2xl font-bold text-xl hover:bg-white/10 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
