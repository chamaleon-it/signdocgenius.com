'use client';
/* eslint-disable @next/next/no-img-element */

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
import type { PdfTextFieldValues } from '@/lib/pdf-form-fields';

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
  const [signedFileUrl, setSignedFileUrl] = useState<string | null>(null);
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
  const [signatures, setSignatures] = useState<Record<string, { file: File; preview: string }>>({});
  const [signatureIndex, setSignatureIndex] = useState(0);
  const signatureFields = document?.signatureFields || [];
  const activeField = signatureFields[signatureIndex];

  const steps = [
    { num: 1, title: 'Details' },
    { num: 2, title: 'Signature' },
    { num: 3, title: 'Review & submit' }
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
    if (activeField) {
      setSignatures((current) => ({ ...current, [activeField.id]: { file, preview } }));
      if (signatureIndex < signatureFields.length - 1) {
        setSignatureIndex((index) => index + 1);
      } else {
        setStep(3);
      }
      return;
    }
    setSignatureFile(file);
    setSignaturePreview(preview);
    setStep(3);
  };

  const goBack = () => {
    if (step === 2 && signatureIndex > 0) {
      setSignatureIndex((index) => index - 1);
    } else {
      setStep((current) => Math.max(1, current - 1));
    }
  };

  const handleSave = async (blob: Blob, formFieldValues: PdfTextFieldValues) => {
    if (!userDetails || !documentId) return;
    setSubmitting(true);
    
    try {
      const file = new File([blob], `signed_${document?.title || 'doc'}.pdf`, { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('documentId', documentId);
      formData.append('clientName', userDetails.name);
      formData.append('clientEmail', userDetails.email);
      formData.append('file', file);
      formData.append('formFieldValues', JSON.stringify(formFieldValues));
      for (const field of signatureFields) {
        const signature = signatures[field.id];
        if (!signature) throw new Error(`Client ${signatureFields.indexOf(field) + 1} signature is required.`);
        formData.append(`signature:${field.id}`, signature.file);
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.application?.signedFileUrl !== 'string') {
          throw new Error('The signed document was saved, but its link could not be loaded.');
        }
        setSignedFileUrl(data.application.signedFileUrl);
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

  let content: React.ReactNode;
  if (loading) {
    content = <div className="flex justify-center pt-24"><Loader2 className="w-8 h-8 animate-spin text-[#5119ae]" /></div>;
  } else if (isInactive) {
    content = (
      <div className="mx-auto max-w-md bg-white rounded-[24px] p-8 text-center shadow-[0_7px_20px_rgba(26,36,51,0.06)]">
        <Lock className="mx-auto mb-4 text-rose-600" size={40} />
        <h1 className="text-2xl font-semibold text-[#242333]">Signing link inactive</h1>
        <p className="mt-3 text-[#636270]">{error || 'This one-time signing link has already been used or deactivated.'}</p>
        <Link href="/" className="mt-6 h-12 flex items-center justify-center gap-2 rounded-lg bg-[#5119ae] text-white font-semibold"><Home size={17} /> Back to home</Link>
      </div>
    );
  } else if (error || !document) {
    content = (
      <div className="mx-auto max-w-md bg-white rounded-[24px] p-8 text-center shadow-[0_7px_20px_rgba(26,36,51,0.06)]">
        <ShieldAlert className="mx-auto mb-4 text-[#5119ae]" size={40} />
        <h1 className="text-2xl font-semibold text-[#242333]">Document unavailable</h1>
        <p className="mt-3 text-[#636270]">{error || 'The requested document could not be loaded.'}</p>
        <Link href="/" className="mt-6 h-12 flex items-center justify-center gap-2 rounded-lg bg-[#5119ae] text-white font-semibold"><Home size={17} /> Go home</Link>
      </div>
    );
  } else {
    content = (
      <>
        <h1 className="text-center text-[17px] sm:text-lg font-semibold text-[#242333] mb-5 sm:mb-[22px]">Sign Document: {document.title}</h1>
        {step < 4 && (
          <div className="w-full max-w-[552px] mx-auto flex gap-[10px] sm:gap-6 mb-5 sm:mb-[22px]">
            {steps.map(s => (
              <div key={s.num} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2">
                <span className={cn('w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-semibold', step >= s.num ? 'bg-[#5119ae] text-white' : 'bg-white text-[#636270]')}>
                  {step > s.num ? <img src="/figma/check-icon.svg" alt="Completed" /> : s.num}
                </span>
                <span className={cn('text-[10px] sm:text-[9px] sm:uppercase sm:tracking-[0.6px] font-semibold text-center whitespace-nowrap', step === s.num ? 'text-[#5119ae]' : 'text-[#636270]')}>{s.title}</span>
              </div>
            ))}
          </div>
        )}
        {step === 4 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[440px] mx-auto bg-white rounded-[24px] p-5 sm:p-8 text-center shadow-[0_7px_20px_rgba(26,36,51,0.06)]">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#e9f7ef] text-emerald-700 flex items-center justify-center"><Check size={28} /></div>
            <h2 className="text-[24px] font-semibold text-[#242333]">Submitted successfully!</h2>
            <p className="text-sm text-[#636270] mt-2">Thank you, {userDetails?.name}. Your signed document has been submitted.</p>
            <p className="text-sm text-[#636270] mt-5">You’re all done.</p>
            {signedFileUrl && (
              <a
                href={signedFileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 h-12 w-full rounded-lg bg-[#5119ae] text-white font-semibold text-sm flex items-center justify-center"
              >
                View signed document
              </a>
            )}
            <Link href="/" className="mt-5 h-12 w-full rounded-lg bg-[#eef4f5] text-[#5119ae] font-semibold text-sm flex items-center justify-center">Close</Link>
          </motion.div>
        ) : (
          <div className={cn('relative mx-auto', step === 3 ? 'max-w-[1100px]' : 'max-w-[440px]')}>
            {submitting && <div className="absolute inset-0 z-50 rounded-[24px] bg-white/80 flex items-center justify-center gap-2 text-[#5119ae] font-medium"><Loader2 className="animate-spin" /> Submitting your document...</div>}
            <AnimatePresence mode="wait">
              {step === 1 && <UserDetailsForm key="details" onNext={handleNextStep1} initialData={userDetails} />}
              {step === 2 && <UploadSignature key={activeField?.id || 'signature'} onNext={handleNextStep2} onBack={goBack} initialFile={activeField ? signatures[activeField.id]?.file : signatureFile} initialPreview={activeField ? signatures[activeField.id]?.preview : signaturePreview} position={activeField ? signatureIndex + 1 : undefined} totalPositions={activeField ? signatureFields.length : undefined} />}
              {step === 3 && pdfFile && (signatureFields.length ? signatureFields.every((field) => signatures[field.id]) : !!signatureFile && !!signaturePreview) && (
                <motion.div key="review" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <PdfEditor pdfFile={pdfFile} signatureFile={signatureFields.length ? signatures[signatureFields[0].id].file : signatureFile!} signaturePreview={signatureFields.length ? signatures[signatureFields[0].id].preview : signaturePreview!} signatureFields={signatureFields} signaturePreviews={Object.fromEntries(Object.entries(signatures).map(([id, value]) => [id, value.preview]))} onBack={goBack} onSave={handleSave} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5fafb] text-[#242333]">
      <SigningHeader />
      <main className="w-full flex-1 min-h-[688px] sm:min-h-[766px] px-4 pt-4 sm:pt-11 pb-12">{content}</main>
      <SigningFooter />
    </div>
  );
}

function SigningHeader() {
  return (
    <header className="h-16 sm:h-[60px] px-4 sm:px-[max(24px,calc((100vw-898px)/2))] flex items-center justify-between">
      <Link href="/" className="flex items-center gap-[5px] font-semibold tracking-[-0.8px] text-[15px] sm:text-[13px]" aria-label="SignDocGenius home">
        <img src="/figma/sign-brand-icon-mobile.svg" alt="" className="sm:hidden" />
        <img src="/figma/sign-brand-icon.svg" alt="" className="hidden sm:block" />
        <span>signdoc<span className="text-[#5119ae]">genius</span></span>
      </Link>
      <Link href="/sign" className="h-10 sm:h-8 px-4 sm:px-3 rounded-full bg-[#5119ae] hover:bg-[#430f99] text-white text-xs font-semibold flex items-center">Get Started</Link>
    </header>
  );
}

function SigningFooter() {
  const groups = [
    ['Product', 'eSignature', 'Contract Lifecycle Management', 'Document Generation', 'Pricing'],
    ['Solutions', 'Real Estate', 'Financial Services', 'Human Resources', 'Legal'],
    ['Support', 'Help Center', 'Community', 'Developer Center', 'Trust Center'],
  ];
  return (
    <footer className="bg-[#0e1929] text-[#94a1b1] text-[11px]">
      <div className="hidden sm:block max-w-[898px] mx-auto min-h-[453px] pt-12 pb-9">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-8 min-h-[332px]">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 bg-white rounded-md px-1.5 py-1 text-[#242333] font-semibold tracking-[-0.6px]"><img src="/figma/sign-brand-icon-footer.svg" alt="" /><span>signdoc<span className="text-[#5119ae]">genius</span></span></Link>
            <p className="mt-3 max-w-[250px] leading-[15px]">SignDocGenius helps organizations connect and automate how they prepare, sign, act on, and manage agreements.</p>
            <h3 className="uppercase text-white text-[10px] font-semibold mt-7 mb-3">Company</h3>
            <ul className="space-y-3">{['About Us', 'Careers', 'Contact', 'Investors'].map(item => <li key={item}><a href="#" className="hover:text-white">{item}</a></li>)}</ul>
          </div>
          {groups.map(group => <div key={group[0]}><h3 className="uppercase text-white text-[10px] font-semibold mb-4">{group[0]}</h3><ul className="space-y-4">{group.slice(1).map(item => <li key={item}><a href="#" className="hover:text-white">{item}</a></li>)}</ul></div>)}
        </div>
        <div className="border-t border-[#1d2939] pt-5 flex justify-between text-[9px]">
          <span>© 2026 SignDocGenius, Inc. All rights reserved.</span>
          <span>Privacy Policy　 Terms of Use　 Accessibility　 Cookies Settings</span>
        </div>
      </div>
      <div className="sm:hidden h-[92px] px-4 flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-white/80">Privacy Policy　·　Terms of Use</p>
        <p className="text-[10px]">© 2026 SignDocGenius. All rights reserved.</p>
      </div>
    </footer>
  );
}
