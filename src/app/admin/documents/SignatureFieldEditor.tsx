'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Plus, Save, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import type { SignatureField } from '@/lib/signature-fields';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SignatureFieldEditorProps {
  pdfFile: File;
  initialFields?: SignatureField[];
  onCancel: () => void;
  onSave: (fields: SignatureField[]) => Promise<void>;
  saveLabel: string;
}

export default function SignatureFieldEditor({
  pdfFile,
  initialFields = [],
  onCancel,
  onSave,
  saveLabel,
}: SignatureFieldEditorProps) {
  const [fields, setFields] = useState(initialFields);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(0.85);
  const [saving, setSaving] = useState(false);

  const addField = () => {
    const field: SignatureField = {
      id: crypto.randomUUID(),
      page: pageNumber,
      x: 0.1,
      y: 0.8,
      width: 0.3,
      height: 0.08,
    };
    setFields((current) => [...current, field]);
  };

  const updateField = (id: string, updates: Partial<SignatureField>) => {
    setFields((current) => current.map((field) =>
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(fields);
    } catch (error) {
      console.error('Error saving signature placements:', error);
      alert(error instanceof Error ? error.message : 'Could not save signature placements.');
    } finally {
      setSaving(false);
    }
  };

  const pageWidth = pageSize.width * scale;
  const pageHeight = pageSize.height * scale;

  return (
    <section className="flex h-[85vh] min-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <h2 className="font-bold text-slate-900">Set Signature Positions</h2>
          <p className="text-sm text-slate-500">Add and position every place the client must sign.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((current) => Math.max(0.5, current - 0.15))}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="w-12 text-center text-xs font-bold text-slate-600">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((current) => Math.min(1.5, current + 0.15))}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            onClick={addField}
            className="ml-2 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
          >
            <Plus size={16} />
            Add signature
          </button>
        </div>
      </header>

      <div className="flex flex-1 justify-center overflow-auto bg-slate-800 p-6">
        <Document
          file={pdfFile}
          onLoadSuccess={({ numPages: totalPages }) => setNumPages(totalPages)}
          loading={<Loader2 className="m-12 animate-spin text-white" />}
          error={<p className="m-12 text-white">Could not load this PDF.</p>}
        >
          <div
            className="relative shadow-2xl"
            style={{ width: pageWidth, height: pageHeight }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              onLoadSuccess={(page) => setPageSize({
                width: page.originalWidth,
                height: page.originalHeight,
              })}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
            {pageSize.width > 0 && fields.filter((field) => field.page === pageNumber).map((field) => (
              <Rnd
                key={field.id}
                bounds="parent"
                position={{ x: field.x * pageWidth, y: field.y * pageHeight }}
                size={{ width: field.width * pageWidth, height: field.height * pageHeight }}
                minWidth={60}
                minHeight={30}
                cancel=".remove-signature-position"
                onDragStop={(_event, position) => updateField(field.id, {
                  x: position.x / pageWidth,
                  y: position.y / pageHeight,
                })}
                onResizeStop={(_event, _direction, element, _delta, position) => updateField(field.id, {
                  x: position.x / pageWidth,
                  y: position.y / pageHeight,
                  width: element.offsetWidth / pageWidth,
                  height: element.offsetHeight / pageHeight,
                })}
                className="group border-2 border-dashed border-brand-primary bg-brand-primary/10"
              >
                <div className="flex h-full items-center justify-center text-center text-xs font-bold text-brand-primary">
                  Client {fields.findIndex((item) => item.id === field.id) + 1} signature
                </div>
                <button
                  type="button"
                  aria-label={`Remove Client ${fields.findIndex((item) => item.id === field.id) + 1} signature position`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setFields((current) => current.filter((item) => item.id !== field.id))}
                  className="remove-signature-position absolute -right-3 -top-3 z-10 rounded-full bg-rose-600 p-1 text-white shadow"
                >
                  <Trash2 size={14} />
                </button>
              </Rnd>
            ))}
          </div>
        </Document>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((page) => page - 1)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-bold text-slate-600">Page {pageNumber} of {numPages}</span>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((page) => page + 1)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            disabled={saving || fields.length === 0}
            onClick={handleSave}
            className="ml-2 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : saveLabel}
          </button>
        </div>
      </footer>
    </section>
  );
}
