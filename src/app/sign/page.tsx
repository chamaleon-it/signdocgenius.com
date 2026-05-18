'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserDetailsForm, UserDetails } from './components/UserDetailsForm';
import { UploadPdf } from './components/UploadPdf';
import { UploadSignature } from './components/UploadSignature';
import dynamic from 'next/dynamic';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PdfEditor = dynamic(
  () => import('./components/PdfEditor').then(mod => mod.PdfEditor),
  { ssr: false }
);

export default function SignPage() {
  const [step, setStep] = useState<number>(1);
  
  const [userDetails, setUserDetails] = useState<UserDetails | undefined>();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  const steps = [
    { num: 1, title: 'Details' },
    { num: 2, title: 'Upload PDF' },
    { num: 3, title: 'Signature' },
    { num: 4, title: 'Edit & Download' }
  ];

  const handleNextStep1 = (data: UserDetails) => {
    setUserDetails(data);
    setStep(2);
  };

  const handleNextStep2 = (file: File) => {
    setPdfFile(file);
    setStep(3);
  };

  const handleNextStep3 = (file: File, preview: string) => {
    setSignatureFile(file);
    setSignaturePreview(preview);
    setStep(4);
  };

  const goBack = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-primary/20 text-slate-900">
      <div className={cn(
        "mx-auto px-4 py-12 transition-all duration-500",
        step === 4 ? "max-w-[98%]" : "max-w-6xl"
      )}>
        {/* Header & Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4 w-full max-w-3xl relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-brand-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
              
              {steps.map((s) => {
                const isActive = step === s.num;
                const isPast = step > s.num;
                
                return (
                  <div key={s.num} className="flex flex-col items-center flex-1 relative z-10">
                    <div 
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-500 mb-3 shadow-xl",
                        isActive ? "bg-brand-primary text-white shadow-brand-primary/30 ring-4 ring-white" :
                        isPast ? "bg-brand-primary text-white ring-4 ring-white" :
                        "bg-white text-slate-400 ring-4 ring-white border border-slate-200"
                      )}
                    >
                      {isPast ? <Check size={20} /> : s.num}
                    </div>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-widest transition-colors duration-300",
                      isActive ? "text-brand-primary" : isPast ? "text-slate-600" : "text-slate-400"
                    )}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <UserDetailsForm 
                key="step1" 
                onNext={handleNextStep1} 
                initialData={userDetails} 
              />
            )}
            {step === 2 && (
              <UploadPdf 
                key="step2" 
                onNext={handleNextStep2} 
                onBack={goBack} 
                initialFile={pdfFile} 
              />
            )}
            {step === 3 && (
              <UploadSignature 
                key="step3" 
                onNext={handleNextStep3} 
                onBack={goBack} 
                initialFile={signatureFile}
                initialPreview={signaturePreview}
              />
            )}
            {step === 4 && pdfFile && signatureFile && signaturePreview && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <PdfEditor 
                  pdfFile={pdfFile}
                  signatureFile={signatureFile}
                  signaturePreview={signaturePreview}
                  onBack={goBack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
