'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SignaturePad } from './SignaturePad';

interface UploadSignatureProps {
  onNext: (file: File, previewUrl: string) => void;
  onBack: () => void;
  initialFile?: File | null;
  initialPreview?: string | null;
  position?: number;
  totalPositions?: number;
}

export function UploadSignature({ onNext, onBack, initialFile, initialPreview, position, totalPositions }: UploadSignatureProps) {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [mode, setMode] = useState<'upload' | 'draw'>('draw');

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(files[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
    maxFiles: 1,
  });

  const reset = () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-[440px] mx-auto bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_7px_20px_rgba(26,36,51,0.06)]"
    >
      <div className="text-center mb-[18px]">
        <h2 className="text-[24px] font-semibold text-[#242333] leading-[34px]">{position ? `Client ${position} Signature` : 'Your Signature'}</h2>
        <p className="text-sm text-[#636270]">{position && totalPositions ? `Signature ${position} of ${totalPositions}. ` : ''}{preview ? 'Check your signature below.' : position ? 'Draw or upload a signature for this position.' : 'Draw your signature or upload an image.'}</p>
      </div>

      {preview ? (
        <>
          <div className="h-[186px] rounded-xl border border-[#dddbe5] bg-[#fbfaff] flex flex-col items-center justify-center gap-2 px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Your signature" className="max-w-full max-h-[112px] object-contain" />
            <span className="text-xs font-semibold text-emerald-700">Signature ready</span>
          </div>
          <button onClick={reset} className="w-full h-12 mt-[18px] rounded-lg bg-[#eef4f5] text-[#5119ae] font-semibold text-sm hover:bg-[#e4eced]">
            Draw or upload again
          </button>
        </>
      ) : (
        <>
          <div className="flex p-1 rounded-lg bg-[#eef4f5] mb-[18px]" role="tablist" aria-label="Signature method">
            {(['draw', 'upload'] as const).map(option => (
              <button
                key={option}
                role="tab"
                aria-selected={mode === option}
                onClick={() => setMode(option)}
                className={`flex-1 h-10 rounded-md text-sm font-medium ${mode === option ? 'bg-white text-[#5119ae] shadow-sm border border-[#dddbe5]' : 'text-[#636270]'}`}
              >
                {option === 'draw' ? 'Draw signature' : 'Upload signature'}
              </button>
            ))}
          </div>
          {mode === 'draw' ? (
            <SignaturePad
              onSave={(dataUrl, newFile) => { setFile(newFile); setPreview(dataUrl); }}
              onCancel={() => setMode('upload')}
            />
          ) : (
            <div {...getRootProps()} className={`h-60 border border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer bg-[#fbfcfd] ${isDragActive ? 'border-[#5119ae]' : 'border-[#dddbe5]'}`}>
              <input {...getInputProps()} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma/upload-icon.svg" alt="" className="mb-2" />
              <p className="text-lg font-semibold text-[#242333]">Upload your signature</p>
              <p className="text-sm text-[#636270] mt-1">Choose an image of your signature.</p>
              <span className="mt-3 px-5 h-11 inline-flex items-center rounded-lg bg-[#5119ae] text-white text-sm font-semibold">Choose signature image</span>
              <p className="text-xs text-[#636270] mt-2">JPG or PNG</p>
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 mt-[18px]">
        <button onClick={onBack} className="flex-1 h-12 rounded-lg bg-[#eef4f5] text-[#5119ae] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#e4eced]">
          <ArrowLeft size={17} /> Back
        </button>
        <button onClick={() => file && preview && onNext(file, preview)} disabled={!file || !preview} className="flex-1 h-12 rounded-lg bg-[#5119ae] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#430f99] disabled:bg-[#715da3] disabled:text-white disabled:cursor-not-allowed">
          Continue <ArrowRight size={17} />
        </button>
      </div>
    </motion.div>
  );
}
