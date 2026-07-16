'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { UserDetailsForm, UserDetails } from '../components/UserDetailsForm';
import { UploadSignature, SignatureItem } from '../components/UploadSignature';
import dynamic from 'next/dynamic';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PdfEditor = dynamic(
  () => import('../components/PdfEditor').then(mod => mod.PdfEditor),
  { ssr: false }
);

export default function DynamicSignPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [document, setDocument] = useState<{ _id: string, title: string, fileUrl: string } | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | undefined>();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
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
        if (!res.ok) throw new Error('Document not found');
        const data = await res.json();
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
        setError('Failed to load document. It might have been deleted.');
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

  const handleNextStep2 = (sigs: SignatureItem[]) => {
    setSignatures(sigs);
    if (sigs.length > 0) {
      setSignatureFile(sigs[0].file);
      setSignaturePreview(sigs[0].previewUrl);
    }
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

      const res = await fetch('/api/applications', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setStep(4); // Success screen
      } else {
        alert('Failed to submit document. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting.');
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

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h1>
          <p className="text-slate-500">{error || 'Document not found'}</p>
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
          <p className="text-slate-500 mb-8">Thank you, {userDetails?.name}. Your signed document has been submitted to the admin.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
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
                initialSignatures={signatures}
                initialFile={signatureFile}
                initialPreview={signaturePreview}
              />
            )}
            {step === 3 && pdfFile && signatures.length > 0 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <PdfEditor 
                  pdfFile={pdfFile}
                  signatures={signatures}
                  signatureFile={signatures[0]?.file || signatureFile || new File([], 'sig.png')}
                  signaturePreview={signatures[0]?.previewUrl || signaturePreview || ''}
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
