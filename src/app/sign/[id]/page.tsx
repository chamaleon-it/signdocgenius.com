'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { UserDetailsForm, UserDetails } from '../components/UserDetailsForm';
import { UploadSignature } from '../components/UploadSignature';
import dynamic from 'next/dynamic';
import { Check, Loader2, Lock, ShieldAlert, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { SignatureField } from '@/lib/signature-fields';

const PdfEditor = dynamic(
  () => import('../components/PdfEditor').then(mod => mod.PdfEditor),
  { ssr: false }
);

export default function DynamicSignPage() {
  const params = useParams();
  const documentId = params.id as string;

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInactive, setIsInactive] = useState(false);
  
  const [document, setDocument] = useState<{
    _id: string;
    title: string;
    fileUrl: string;
    isActive?: boolean;
    signatureFields?: SignatureField[];
  } | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | undefined>();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  const steps = [
    { num: 1, title: 'Details' },
    { num: 2, title: 'Signature' },
    { num: 3, title: 'Review & Submit' }
  ];

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 403 || data.isActive === false) {
            setIsInactive(true);
            setError(data.error || 'This signing link is inactive or has already been used.');
            return;
          }
          throw new Error(data.error || 'Document not found');
        }

        if (data.document?.isActive === false) {
          setIsInactive(true);
          setError('This signing link is inactive or has already been used.');
          return;
        }

        setDocument(data.document);

        // Fetch the PDF file
        const fileRes = await fetch(data.document.fileUrl);
        if (!fileRes.ok) {
          throw new Error(`Could not download PDF file (${fileRes.status})`);
        }
        const blob = await fileRes.blob();
        if (blob.size === 0) {
          throw new Error('Downloaded PDF is empty');
        }
        const file = new File([blob], data.document.title + '.pdf', { type: blob.type || 'application/pdf' });
        setPdfFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document. It might have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    if (documentId) fetchDoc();
  }, [documentId]);

  const handleNextStep1 = (data: UserDetails) => {
    setUserDetails(data);
    setStep(2);
  };

  const handleNextStep2 = (file: File, preview: string) => {
    setSignatureFile(file);
    setSignaturePreview(preview);
    setStep(3);
  };

  const goBack = () => setStep(s => Math.max(1, s - 1));

  const handleSave = async (blob: Blob) => {
    if (!userDetails || !documentId) return;
    setSubmitting(true);
    
    try {
      const file = new File([blob], `signed_${document?.title || 'doc'}.pdf`, { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('documentId', documentId);
      formData.append('clientName', userDetails.name);
      formData.append('clientEmail', userDetails.email);
      formData.append('file', file);
      if (document?.signatureFields?.length && signatureFile) {
        formData.append('signature', signatureFile);
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setStep(4); // Success screen
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Failed to submit document. Please try again.';
        if (res.status === 403) {
          setIsInactive(true);
          setError(errorMsg);
        } else {
          alert(errorMsg);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  // Dedicated Inactive / Expired Link Screen
  if (isInactive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80 text-center max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm ring-8 ring-rose-50/50">
            <Lock className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100/80 text-rose-700 mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            Link Inactive
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Signing Link Inactive or Expired
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
            This document link is valid for <strong className="text-slate-800">one-time use only</strong>. It has either already been completed or was deactivated by the document sender.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left text-xs sm:text-sm text-slate-600 mb-8 space-y-1.5">
            <p className="font-semibold text-slate-800">Need access to this document?</p>
            <p>Please contact the person or organization who sent you this link. An administrator can re-enable the link or generate a new one for you.</p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Document Unavailable</h1>
          <p className="text-slate-500 mb-6">{error || 'The requested document could not be loaded.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Submitted Successfully!</h2>
          <p className="text-slate-500 mb-2">Thank you, {userDetails?.name}. Your signed document has been submitted to the admin.</p>
          <p className="text-xs text-slate-400 mb-8">For your security, this signing link has now been deactivated for future use.</p>
          <Link 
            href="/"
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors block text-center"
          >
            Close
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-primary/20 text-slate-900">
      <div className={cn(
        "mx-auto px-4 py-12 transition-all duration-500",
        step === 3 ? "max-w-[98%]" : "max-w-6xl"
      )}>
        {/* Header & Progress */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Sign Document: {document.title}</h1>
          </div>
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
          {submitting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
                <p className="font-medium text-slate-700">Submitting your document...</p>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <UserDetailsForm 
                key="step1" 
                onNext={handleNextStep1} 
                initialData={userDetails} 
              />
            )}
            {step === 2 && (
              <UploadSignature 
                key="step2" 
                onNext={handleNextStep2} 
                onBack={goBack} 
                initialFile={signatureFile}
                initialPreview={signaturePreview}
              />
            )}
            {step === 3 && pdfFile && signatureFile && signaturePreview && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <PdfEditor 
                  pdfFile={pdfFile}
                  signatureFile={signatureFile}
                  signaturePreview={signaturePreview}
                  signatureFields={document.signatureFields || []}
                  onBack={goBack}
                  onSave={handleSave}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
