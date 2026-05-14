'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, ArrowLeft, ZoomIn, ZoomOut,
  RotateCw, Maximize2, Trash2, SlidersHorizontal, Loader2,
  Type, MousePointer2, Plus, GripVertical, X,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// DOMMatrix Polyfill for environments where it's missing
if (typeof window !== 'undefined' && !window.DOMMatrix) {
  (window as any).DOMMatrix = (window as any).WebKitCSSMatrix || (window as any).MSCSSMatrix || (window as any).DOMMatrix;
}

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;

interface ElementBase {
  id: string;
  x: number;
  y: number;
  page: number;
}

interface SignatureElement extends ElementBase {
  type: 'signature';
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

interface TextElement extends ElementBase {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
}

type EditorElement = SignatureElement | TextElement;

interface PdfEditorProps {
  pdfFile: File;
  signatureFile: File;
  signaturePreview: string;
  onBack: () => void;
}

export function PdfEditor({ pdfFile, signaturePreview, onBack }: PdfEditorProps) {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [isImage, setIsImage] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkFileType = async () => {
      if (pdfFile.type.startsWith('image/')) {
        setIsImage(true);
        setNumPages(1);
        const url = URL.createObjectURL(pdfFile);
        setImageSrc(url);

        const img = new Image();
        img.onload = () => {
          setPdfDimensions({ width: img.width, height: img.height });
        };
        img.src = url;
      } else {
        setIsImage(false);
      }
    };
    checkFileType();
  }, [pdfFile]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    setPdfDimensions({
      width: page.originalWidth,
      height: page.originalHeight,
    });
  };

  const addSignature = () => {
    const newSig: SignatureElement = {
      id: `sig-${Date.now()}`,
      type: 'signature',
      x: 50,
      y: 50,
      width: 150,
      height: 75,
      rotation: 0,
      opacity: 1,
      page: pageNumber
    };
    setElements([...elements, newSig]);
    setSelectedId(newSig.id);
  };

  const addText = () => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 150,
      text: 'Click to edit',
      fontSize: 16,
      color: '#000000',
      page: pageNumber
    };
    setElements([...elements, newText]);
    setSelectedId(newText.id);
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } as EditorElement : el));
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  const handleDownload = async () => {
    try {
      setIsExporting(true);

      let pdfDoc;
      if (isImage) {
        pdfDoc = await PDFDocument.create();
        const imgBytes = await pdfFile.arrayBuffer();
        let bgImage;
        try {
          if (pdfFile.type === 'image/png' || pdfFile.name.toLowerCase().endsWith('.png')) {
            bgImage = await pdfDoc.embedPng(imgBytes);
          } else {
            bgImage = await pdfDoc.embedJpg(imgBytes);
          }
        } catch (e) {
          try {
            bgImage = await pdfDoc.embedPng(imgBytes);
          } catch (e2) {
            bgImage = await pdfDoc.embedJpg(imgBytes);
          }
        }
        const page = pdfDoc.addPage([bgImage.width, bgImage.height]);
        page.drawImage(bgImage, { x: 0, y: 0, width: bgImage.width, height: bgImage.height });
      } else {
        const pdfBytes = await pdfFile.arrayBuffer();
        pdfDoc = await PDFDocument.load(pdfBytes);
      }

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const sigResponse = await fetch(signaturePreview);
      const sigBytes = await sigResponse.arrayBuffer();
      let signatureImage;
      try {
        if (signaturePreview.includes('png') || signaturePreview.startsWith('data:image/png')) {
          signatureImage = await pdfDoc.embedPng(sigBytes);
        } else {
          signatureImage = await pdfDoc.embedJpg(sigBytes);
        }
      } catch (e) {
        signatureImage = await pdfDoc.embedPng(sigBytes);
      }

      const pages = pdfDoc.getPages();

      for (const el of elements) {
        if (el.page > pages.length) continue;

        const activePage = pages[el.page - 1];
        const { width: pdfWidth, height: pdfHeight } = activePage.getSize();

        const ratioX = pdfWidth / pdfDimensions.width;
        const ratioY = pdfHeight / pdfDimensions.height;

        if (el.type === 'signature') {
          const finalWidth = el.width * ratioX;
          const finalHeight = el.height * ratioY;
          const finalX = el.x * ratioX;
          const finalY = pdfHeight - ((el.y + el.height) * ratioY);

          activePage.drawImage(signatureImage, {
            x: finalX,
            y: finalY,
            width: finalWidth,
            height: finalHeight,
            opacity: el.opacity,
          });
        } else if (el.type === 'text') {
          const finalX = el.x * ratioX;
          const finalY = pdfHeight - (el.y * ratioY) - (el.fontSize * ratioY);

          const hex = el.color.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;

          activePage.drawText(el.text, {
            x: finalX,
            y: finalY,
            size: el.fontSize * ratioY,
            font: helveticaFont,
            color: rgb(r, g, b),
          });
        }
      }

      const pdfBytesModified = await pdfDoc.save();
      const blob = new Blob([pdfBytesModified as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const fileName = pdfFile.name.split('.')[0];
      link.download = `signed_${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));

  return (
    <div className="w-full h-[85vh] flex flex-col lg:flex-row gap-4">
      {/* Sidebar Tools */}
      <div className="w-full lg:w-20 flex lg:flex-col gap-3 bg-white border border-slate-200 rounded-4xl p-3 shadow-xl shadow-slate-200/50">
        <button
          onClick={addSignature}
          className="flex-1 lg:flex-none aspect-square flex flex-col items-center justify-center rounded-[1.2rem] bg-brand-primary hover:bg-brand-hover text-white transition-all shadow-lg shadow-brand-primary/20 group"
          title="Add Signature"
        >
          <Plus size={22} className="mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-wider">Sign</span>
        </button>
        <button
          onClick={addText}
          className="flex-1 lg:flex-none aspect-square flex flex-col items-center justify-center rounded-[1.2rem] bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all group"
          title="Add Text"
        >
          <Type size={22} className="mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-wider">Text</span>
        </button>
        <div className="hidden lg:block h-px bg-slate-100 my-1" />
        <button
          onClick={onBack}
          className="flex-1 lg:flex-none aspect-square flex flex-col items-center justify-center rounded-[1.2rem] bg-white border-2 border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200 transition-all group"
        >
          <ArrowLeft size={22} className="mb-1 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-wider">Back</span>
        </button>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 bg-white border border-slate-200 rounded-4xl flex flex-col overflow-hidden relative shadow-2xl shadow-slate-200/50">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <FileText size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-900 truncate max-w-[150px] lg:max-w-[300px] leading-tight text-sm">{pdfFile.name}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Page {pageNumber} of {numPages}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <button onClick={zoomOut} className="p-1.5 text-slate-500 hover:text-brand-primary hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-slate-200"><ZoomOut size={16} /></button>
            <span className="text-[11px] font-black text-slate-700 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-1.5 text-slate-500 hover:text-brand-primary hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-slate-200"><ZoomIn size={16} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-800 p-4 lg:p-12 flex justify-center items-start scrollbar-hide" ref={containerRef}>
          {isImage ? (
            <div
              className={cn(
                "relative shadow-2xl bg-white origin-top-center transition-all duration-300 border border-slate-300",
                pdfDimensions.width === 0 ? "opacity-0" : "opacity-100"
              )}
              ref={pageRef}
              style={{
                width: pdfDimensions.width * scale,
                height: pdfDimensions.height * scale,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Document"
                className="w-full h-full object-contain"
              />

              {/* Elements Overlay */}
              {pdfDimensions.width > 0 && elements.filter(el => el.page === pageNumber).map((el) => (
                <Rnd
                  key={el.id}
                  bounds="parent"
                  position={{ x: el.x * scale, y: el.y * scale }}
                  size={el.type === 'signature' ? { width: el.width * scale, height: el.height * scale } : undefined}
                  enableResizing={el.type === 'signature'}
                  onDragStop={(e, d) => updateElement(el.id, { x: d.x / scale, y: d.y / scale })}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    updateElement(el.id, {
                      width: parseInt(ref.style.width) / scale,
                      height: parseInt(ref.style.height) / scale,
                      x: position.x / scale,
                      y: position.y / scale
                    });
                  }}
                  lockAspectRatio={el.type === 'signature'}
                  onClick={() => setSelectedId(el.id)}
                  className={cn(
                    "group border-2 transition-all cursor-move",
                    selectedId === el.id ? "border-brand-primary shadow-xl ring-4 ring-brand-primary/10" : "border-transparent hover:border-brand-primary/30"
                  )}
                >
                  {el.type === 'signature' ? (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={signaturePreview}
                        alt="Signature"
                        className="w-full h-full object-contain pointer-events-none"
                        style={{ opacity: el.opacity }}
                      />
                    </div>
                  ) : (
                    <div className="relative p-1 min-w-[50px]">
                      <input
                        type="text"
                        value={el.text}
                        onChange={(e) => updateElement(el.id, { text: e.target.value })}
                        className="bg-transparent border-none focus:outline-none focus:ring-0 w-full font-bold"
                        style={{
                          fontSize: `${el.fontSize * scale}px`,
                          color: el.color,
                          fontFamily: 'Helvetica'
                        }}
                        autoFocus={selectedId === el.id}
                      />
                    </div>
                  )}

                  {selectedId === el.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                      className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-50 border-2 border-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </Rnd>
              ))}
            </div>
          ) : (
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center p-20 text-white/50 bg-slate-900/50 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
                  <Loader2 className="animate-spin mb-4" size={48} />
                  <p className="text-sm font-black uppercase tracking-widest">Initializing Editor...</p>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-2xl border border-red-100 max-w-md my-20">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                    <X size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">Failed to load PDF</h3>
                  <p className="text-sm text-slate-500 text-center leading-relaxed mb-8">
                    We couldn't open this file. Please ensure it's a valid PDF document and not an image file.
                  </p>
                  <button
                    onClick={onBack}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Go Back & Re-upload
                  </button>
                </div>
              }
            >
              <div
                className={cn(
                  "relative shadow-2xl bg-white origin-top-center transition-all duration-300 border border-slate-300",
                  pdfDimensions.width === 0 ? "opacity-0" : "opacity-100"
                )}
                ref={pageRef}
                style={{
                  width: pdfDimensions.width * scale,
                  height: pdfDimensions.height * scale,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />

                {/* Elements Overlay */}
                {pdfDimensions.width > 0 && elements.filter(el => el.page === pageNumber).map((el) => (
                  <Rnd
                    key={el.id}
                    bounds="parent"
                    position={{ x: el.x * scale, y: el.y * scale }}
                    size={el.type === 'signature' ? { width: el.width * scale, height: el.height * scale } : undefined}
                    enableResizing={el.type === 'signature'}
                    onDragStop={(e, d) => updateElement(el.id, { x: d.x / scale, y: d.y / scale })}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      updateElement(el.id, {
                        width: parseInt(ref.style.width) / scale,
                        height: parseInt(ref.style.height) / scale,
                        x: position.x / scale,
                        y: position.y / scale
                      });
                    }}
                    lockAspectRatio={el.type === 'signature'}
                    onClick={() => setSelectedId(el.id)}
                    className={cn(
                      "group border-2 transition-all cursor-move",
                      selectedId === el.id ? "border-brand-primary shadow-xl ring-4 ring-brand-primary/10" : "border-transparent hover:border-brand-primary/30"
                    )}
                  >
                    {el.type === 'signature' ? (
                      <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={signaturePreview}
                          alt="Signature"
                          className="w-full h-full object-contain pointer-events-none"
                          style={{ opacity: el.opacity }}
                        />
                      </div>
                    ) : (
                      <div className="relative p-1 min-w-[50px]">
                        <input
                          type="text"
                          value={el.text}
                          onChange={(e) => updateElement(el.id, { text: e.target.value })}
                          className="bg-transparent border-none focus:outline-none focus:ring-0 w-full font-bold"
                          style={{
                            fontSize: `${el.fontSize * scale}px`,
                            color: el.color,
                            fontFamily: 'Helvetica'
                          }}
                          autoFocus={selectedId === el.id}
                        />
                      </div>
                    )}

                    {selectedId === el.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                        className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-50 border-2 border-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </Rnd>
                ))}
              </div>
            </Document>
          )}
        </div>

        {/* Page navigation */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <div className="flex gap-1.5">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(p => p - 1)}
              className="p-2 text-slate-500 hover:text-brand-primary hover:bg-slate-100 rounded-xl disabled:opacity-30 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(p => p + 1)}
              className="p-2 text-slate-500 hover:text-brand-primary hover:bg-slate-100 rounded-xl disabled:opacity-30 transition-all"
            >
              <ArrowLeft size={18} className="rotate-180" />
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="bg-slate-100 px-5 py-1.5 rounded-full border border-slate-200">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Page {pageNumber} / {numPages}</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting || elements.length === 0}
            className="flex items-center justify-center py-3 px-6 rounded-xl shadow-lg shadow-brand-primary/20 text-xs font-black text-white bg-brand-primary hover:bg-brand-hover disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all"
          >
            {isExporting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Download className="mr-2" size={16} />}
            {isExporting ? 'Exporting...' : 'Finish & Download'}
          </button>
        </div>
      </div>

      {/* Element Properties Sidebar */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-72 bg-white border border-slate-200 rounded-4xl p-6 shadow-xl shadow-slate-200/50"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <SlidersHorizontal size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest">Properties</h3>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {selectedElement.type === 'signature' ? (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Opacity</label>
                    <input
                      type="range"
                      min="0.1" max="1" step="0.1"
                      value={selectedElement.opacity}
                      onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                      className="w-full accent-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Dimensions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Width</span>
                        <span className="text-xs text-slate-900 font-black">{Math.round(selectedElement.width)}px</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Height</span>
                        <span className="text-xs text-slate-900 font-black">{Math.round(selectedElement.height)}px</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Font Size</label>
                    <input
                      type="range"
                      min="8" max="72"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full accent-brand-primary"
                    />
                    <div className="flex justify-between mt-2 text-[9px] font-black text-slate-400">
                      <span>8pt</span>
                      <span className="text-brand-primary">{selectedElement.fontSize}pt</span>
                      <span>72pt</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Text Color</label>
                    <div className="flex gap-2">
                      {['#000000', '#0000ff', '#ff0000', '#008000'].map((c) => (
                        <button
                          key={c}
                          onClick={() => updateElement(selectedElement.id, { color: c })}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all",
                            selectedElement.color === c ? "border-slate-100 scale-110 shadow-lg ring-2 ring-brand-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-6 mt-2 border-t border-slate-100">
                <button
                  onClick={() => removeElement(selectedElement.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  <Trash2 size={16} />
                  Delete Element
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

