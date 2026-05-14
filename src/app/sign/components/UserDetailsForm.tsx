'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export type UserDetails = z.infer<typeof schema>;

interface UserDetailsFormProps {
  onNext: (data: UserDetails) => void;
  initialData?: UserDetails;
}

export function UserDetailsForm({ onNext, initialData }: UserDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserDetails>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto bg-white border border-slate-200 rounded-4xl p-10 shadow-xl shadow-slate-200/50"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Sign Document</h2>
        <p className="text-slate-500 font-medium">Please provide your details to begin</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2 ml-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User size={18} />
            </div>
            <input
              id="name"
              type="text"
              className={cn(
                "block w-full pl-12 pr-4 py-4 border-2 rounded-2xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-medium",
                errors.name ? "border-red-200 focus:ring-red-500/10 focus:border-red-500" : "border-slate-100 hover:border-slate-200"
              )}
              placeholder="John Doe"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2 ml-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              className={cn(
                "block w-full pl-12 pr-4 py-4 border-2 rounded-2xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-medium",
                errors.email ? "border-red-200 focus:ring-red-500/10 focus:border-red-500" : "border-slate-100 hover:border-slate-200"
              )}
              placeholder="john@example.com"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center py-4 px-6 rounded-2xl shadow-lg shadow-brand-primary/20 text-base font-black text-white bg-brand-primary hover:bg-brand-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-8"
        >
          Next Step
          <ArrowRight className="ml-2" size={20} />
        </button>
      </form>
    </motion.div>
  );
}
