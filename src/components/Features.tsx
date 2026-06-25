'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Cpu, Smartphone, Globe, Lock } from 'lucide-react';

const features = [
  {
    title: "eSignature",
    desc: "Sign documents in seconds from any device. Legally binding and globally recognized.",
    icon: <Zap className="text-brand-primary" size={24} />,
    color: "bg-brand-primary/10"
  },
  {
    title: "Identity Verification",
    desc: "Robust ID verification options to ensure the right people are signing your agreements.",
    icon: <ShieldCheck className="text-green-500" size={24} />,
    color: "bg-green-500/10"
  },
  {
    title: "AI-Powered Insights",
    desc: "Automatically extract key terms and analyze risks across your entire agreement portfolio.",
    icon: <Cpu className="text-purple-500" size={24} />,
    color: "bg-purple-500/10"
  },
  {
    title: "Mobile First",
    desc: "Our top-rated mobile app lets you sign, send and manage documents on the go.",
    icon: <Smartphone className="text-blue-500" size={24} />,
    color: "bg-blue-500/10"
  },
  {
    title: "Global Compliance",
    desc: "Meets or exceeds the most stringent global security and privacy standards.",
    icon: <Globe className="text-orange-500" size={24} />,
    color: "bg-orange-500/10"
  },
  {
    title: "Enterprise Security",
    desc: "Bank-grade encryption and comprehensive audit trails for every transaction.",
    icon: <Lock className="text-red-500" size={24} />,
    color: "bg-red-500/10"
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
          >
            Go <span className="text-brand-primary">paperless</span> with SignDocGenius
          </motion.h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to sign, send, and manage agreements in one secure, unified platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl border border-slate-100 hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
