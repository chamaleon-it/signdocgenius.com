'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FileText, Upload, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadPdfProps {
  onNext: (file: File) => void;
  onBack: () => void;
  initialFile?: File | null;
}

export function UploadPdf({ onNext, onBack, initialFile }: UploadPdfProps) {
  const [file, setFile] = useState<File | null>(initialFile || null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    } else if (rejectedFiles.length > 0) {
      alert('Please upload a valid PDF or Image file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
  });

  const handleNext = () => {
    if (file) {
      onNext(file);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto bg-white border border-slate-200 rounded-4xl p-10 shadow-xl shadow-slate-200/50"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Upload Document</h2>
        <p className="text-slate-500 font-medium">Select a PDF or an Image to sign</p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "relative group overflow-hidden cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-20 px-8 text-center",
          isDragActive ? "border-brand-primary bg-brand-primary/5" : "border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50",
          isDragReject ? "border-red-500 bg-red-500/5" : "",
          file ? "border-brand-primary bg-brand-primary/2" : ""
        )}
      >
        <input {...getInputProps()} />

        {file ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-6 bg-brand-primary/10 rounded-2xl text-brand-primary">
              <FileText size={56} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 mb-1">{file.name}</p>
              <p className="text-sm font-semibold text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={removeFile}
              className="mt-6 flex items-center text-sm font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-4 py-2 rounded-xl"
            >
              <X size={18} className="mr-2" />
              Remove File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 pointer-events-none">
            <div className="p-6 bg-brand-primary/10 rounded-full text-brand-primary group-hover:scale-110 transition-transform duration-300">
              <Upload size={56} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 mb-2">
                Drag & Drop Here
              </p>
              <p className="text-slate-500 font-medium">
                PDF, PNG or JPG (Max 10MB)
              </p>
            </div>
            {isDragReject && (
              <p className="text-sm text-red-500 mt-4 font-bold">Unsupported file format</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-200 transition-all text-sm"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!file}
          className="flex-2 py-4 px-6 rounded-2xl bg-brand-primary text-white font-black uppercase tracking-widest hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-brand-primary/20 text-sm"
        >
          Next Step
        </button>
      </div>
    </motion.div>
  );
}
