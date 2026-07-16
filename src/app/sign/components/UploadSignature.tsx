'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, X, ArrowRight, ArrowLeft, PenTool, Plus, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignaturePad } from './SignaturePad';

export interface SignatureItem {
  id: string;
  file: File;
  previewUrl: string;
  label?: string;
}

interface UploadSignatureProps {
  onNext: (signatures: SignatureItem[]) => void;
  onBack: () => void;
  initialSignatures?: SignatureItem[];
  // For backwards compatibility:
  initialFile?: File | null;
  initialPreview?: string | null;
}

export function UploadSignature({ onNext, onBack, initialSignatures, initialFile, initialPreview }: UploadSignatureProps) {
  const [signatures, setSignatures] = useState<SignatureItem[]>(() => {
    if (initialSignatures && initialSignatures.length > 0) return initialSignatures;
    if (initialFile && initialPreview) {
      return [{
        id: 'sig-initial',
        file: initialFile,
        previewUrl: initialPreview,
        label: 'Signature 1'
      }];
    }
    return [];
  });

  const [mode, setMode] = useState<'upload' | 'draw'>('draw');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(signatures.length === 0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      const objectUrl = URL.createObjectURL(newFile);
      const newSig: SignatureItem = {
        id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file: newFile,
        previewUrl: objectUrl,
        label: `Signature ${signatures.length + 1}`
      };
      setSignatures(prev => [...prev, newSig]);
      setIsAddingNew(false);
    }
  }, [signatures.length]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  });

  const handleNext = () => {
    if (signatures.length > 0) {
      onNext(signatures);
    }
  };

  const removeSignature = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSignatures(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        setIsAddingNew(true);
      }
      return filtered;
    });
  };

  const updateSignatureLabel = (id: string, newLabel: string) => {
    setSignatures(prev => prev.map(s => s.id === id ? { ...s, label: newLabel } : s));
  };

  const handlePadSave = (dataUrl: string, newFile: File) => {
    const newSig: SignatureItem = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      file: newFile,
      previewUrl: dataUrl,
      label: `Signature ${signatures.length + 1}`
    };
    setSignatures(prev => [...prev, newSig]);
    setIsAddingNew(false);
  };

  const showCreationArea = signatures.length === 0 || isAddingNew;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-4xl p-8 sm:p-10 shadow-xl shadow-slate-200/50"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Your Signatures</h2>
        <p className="text-slate-500 font-medium">
          {signatures.length > 0
            ? "Manage signatures for all signers or add more below"
            : "Choose how you want to provide your signature"}
        </p>
      </div>

      {/* Signatures List Grid */}
      {signatures.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              Ready Signatures ({signatures.length})
            </span>
            {signatures.length > 1 && (
              <span className="text-[11px] text-brand-primary font-bold">
                Tip: You can rename labels for multiple signers
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {signatures.map((sig, index) => (
              <motion.div
                key={sig.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col items-center relative group shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all"
              >
                <div className="w-full h-32 bg-white rounded-2xl border border-slate-200 flex items-center justify-center p-3 mb-3 overflow-hidden relative shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sig.previewUrl}
                    alt={sig.label || `Signature ${index + 1}`}
                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                  />
                </div>

                <div className="w-full flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0 bg-white px-3 py-1.5 rounded-xl border border-slate-200 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={sig.label || ''}
                      onChange={(e) => updateSignatureLabel(sig.id, e.target.value)}
                      placeholder={`Signer #${index + 1}`}
                      className="font-bold text-slate-800 bg-transparent border-none focus:outline-none text-xs w-full truncate"
                    />
                  </div>
                  <button
                    onClick={(e) => removeSignature(sig.id, e)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 border border-transparent hover:border-red-100"
                    title="Remove signature"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-6 w-full py-4 px-6 rounded-2xl border-2 border-dashed border-brand-primary/40 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus size={18} />
              Add Another Signature (2nd or 3rd person)
            </button>
          )}
        </div>
      )}

      {/* Creation Area */}
      <AnimatePresence mode="wait">
        {showCreationArea && (
          <motion.div
            key="creation-area"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(signatures.length > 0 ? "pt-6 border-t border-slate-200" : "")}
          >
            {signatures.length > 0 && (
              <div className="flex items-center justify-between mb-6 bg-brand-primary/5 px-4 py-3 rounded-2xl border border-brand-primary/20">
                <span className="font-black text-brand-primary text-xs uppercase tracking-wider">
                  Adding Signature #{signatures.length + 1}
                </span>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200">
              <button
                onClick={() => setMode('draw')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                  mode === 'draw' ? "bg-white text-brand-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <PenTool size={18} />
                Draw Signature
              </button>
              <button
                onClick={() => setMode('upload')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                  mode === 'upload' ? "bg-white text-brand-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Upload size={18} />
                Upload Image
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'draw' ? (
                <motion.div
                  key="draw"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <SignaturePad
                    onSave={handlePadSave}
                    onCancel={() => {
                      if (signatures.length > 0) {
                        setIsAddingNew(false);
                      } else {
                        setMode('upload');
                      }
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full h-full"
                >
                  <div
                    {...getRootProps()}
                    className={cn(
                      "relative group overflow-hidden cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-16 px-8 text-center min-h-[260px]",
                      isDragActive ? "border-brand-primary bg-brand-primary/5" : "border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50",
                      isDragReject ? "border-red-500 bg-red-500/5" : ""
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center space-y-4 pointer-events-none">
                      <div className="p-5 bg-brand-primary/10 rounded-full text-brand-primary group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon size={48} />
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900 mb-1">
                          Drag & Drop Image Here
                        </p>
                        <p className="text-slate-500 text-sm font-medium">
                          Supports PNG, JPG (Transparent PNG best)
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-10 gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-slate-100"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={signatures.length === 0}
          className="flex-1 py-4 px-6 rounded-2xl font-black text-white bg-brand-primary hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-brand-primary/20 shadow-lg shadow-brand-primary/20"
        >
          Proceed to Editor ({signatures.length} {signatures.length === 1 ? 'Signature' : 'Signatures'})
          <ArrowRight className="ml-2" size={20} />
        </button>
      </div>
    </motion.div>
  );
}

