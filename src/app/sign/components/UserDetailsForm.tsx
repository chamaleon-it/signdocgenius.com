'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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
      className="w-full max-w-[440px] mx-auto bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_7px_20px_rgba(26,36,51,0.06)]"
    >
      <div className="text-center mb-5">
        <h2 className="text-[24px] font-semibold text-[#242333] leading-[34px]">Sign Document</h2>
        <p className="text-sm text-[#636270]">Enter your details to begin.</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-[#242333] mb-2">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            className="block w-full h-14 px-4 border border-[#dddbe5] rounded-xl text-[#242333] placeholder:text-[#8b8a98] focus:outline-none focus:ring-2 focus:ring-[#5119ae]/20 focus:border-[#5119ae]"
            placeholder="John Doe"
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#242333] mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="block w-full h-14 px-4 border border-[#dddbe5] rounded-xl text-[#242333] placeholder:text-[#8b8a98] focus:outline-none focus:ring-2 focus:ring-[#5119ae]/20 focus:border-[#5119ae]"
            placeholder="john@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full h-12 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white bg-[#5119ae] hover:bg-[#430f99] focus:outline-none focus:ring-4 focus:ring-[#5119ae]/20 transition-colors"
        >
          Next step
          <ArrowRight size={17} />
        </button>
      </form>
    </motion.div>
  );
}
