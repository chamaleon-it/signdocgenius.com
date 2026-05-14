'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, X, ArrowRight, ArrowLeft, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignaturePad } from './SignaturePad';

interface UploadSignatureProps {
  onNext: (file: File, previewUrl: string) => void;
  onBack: () => void;
  initialFile?: File | null;
  initialPreview?: string | null;
}

export function UploadSignature({ onNext, onBack, initialFile, initialPreview }: UploadSignatureProps) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [mode, setMode] = useState<'upload' | 'draw'>(initialFile ? 'upload' : 'draw');

  useEffect(() => {
    if (file && !preview) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file, preview]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      setFile(newFile);
      const objectUrl = URL.createObjectURL(newFile);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  });

  const handleNext = () => {
    if (file && preview) {
      onNext(file, preview);
    }
  };

  const removeFile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFile(null);
    if (preview && !initialPreview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  };

  const handlePadSave = (dataUrl: string, newFile: File) => {
    setFile(newFile);
    setPreview(dataUrl);
    setMode('upload'); // Switch to preview mode
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto bg-white border border-slate-200 rounded-4xl p-10 shadow-xl shadow-slate-200/50"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Your Signature</h2>
        <p className="text-slate-500 font-medium">Choose how you want to provide your signature</p>
      </div>

      {!preview && (
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10 border border-slate-200">
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
      )}

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full"
          >
            <div className="relative w-full max-w-[440px] h-56 bg-slate-50 rounded-3xl border-2 border-brand-primary/20 flex items-center justify-center p-8 mb-8 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Signature preview"
                className="max-w-full max-h-full object-contain drop-shadow-md"
              />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-8 uppercase tracking-widest">Signature ready to be placed</p>
            <button
              onClick={() => removeFile()}
              className="flex items-center text-sm font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-6 py-3 rounded-xl border border-red-100"
            >
              <X size={18} className="mr-2" />
              Try Another One
            </button>
          </motion.div>
        ) : mode === 'draw' ? (
          <motion.div
            key="draw"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <SignaturePad
              onSave={handlePadSave}
              onCancel={() => setMode('upload')}
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
                "relative group overflow-hidden cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-16 px-8 text-center min-h-[300px]",
                isDragActive ? "border-brand-primary bg-brand-primary/5" : "border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50",
                isDragReject ? "border-red-500 bg-red-500/5" : ""
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-6 pointer-events-none">
                <div className="p-6 bg-brand-primary/10 rounded-full text-brand-primary group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon size={56} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 mb-2">
                    Drag & Drop Image Here
                  </p>
                  <p className="text-slate-500 font-medium">
                    Supports PNG, JPG (Transparent PNG best)
                  </p>
                </div>
              </div>
            </div>
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
          disabled={!preview}
          className="flex-1 py-4 px-6 rounded-2xl font-black text-white bg-brand-primary hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-brand-primary/20 shadow-lg shadow-brand-primary/20"
        >
          Proceed to Editor
          <ArrowRight className="ml-2" size={20} />
        </button>
      </div>
    </motion.div>
  );
}
