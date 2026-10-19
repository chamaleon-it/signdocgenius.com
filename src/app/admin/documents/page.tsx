'use client';

import { useCallback, useState, useEffect } from 'react';
import { Upload, FileText, ExternalLink, Copy, Check, Power, PowerOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { SignatureField } from '@/lib/signature-fields';

const SignatureFieldEditor = dynamic(
  () => import('./SignatureFieldEditor'),
  { ssr: false }
);

type Document = {
  _id: string;
  title: string;
  fileUrl: string;
  isActive: boolean;
  signatureFields: SignatureField[];
  createdAt: string;
};

interface EditorSession {
  pdfFile: File;
  title: string;
  documentId?: string;
  fields: SignatureField[];
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload state
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editorSession, setEditorSession] = useState<EditorSession | null>(null);

  const loadDocuments = useCallback(async (): Promise<Document[]> => {
    const response = await fetch('/api/admin/documents');
    if (!response.ok) {
      throw new Error('Could not load documents.');
    }
    const data = await response.json();
    return data.documents || [];
  }, []);

  useEffect(() => {
    let active = true;
    void loadDocuments()
      .then((items) => {
        if (active) setDocuments(items);
      })
      .catch((error) => console.error('Error loading documents:', error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadDocuments]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setEditorSession({ pdfFile: file, title, fields: [] });
    setShowUpload(false);
  };

  const handleConfigureFields = async (document: Document) => {
    try {
      const response = await fetch(document.fileUrl);
      if (!response.ok) {
        throw new Error(`Could not load the PDF (${response.status}).`);
      }
      const blob = await response.blob();
      const fileName = document.fileUrl.split('/').pop() || `${document.title}.pdf`;
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
      setEditorSession({
        pdfFile,
        title: document.title,
        documentId: document._id,
        fields: document.signatureFields || [],
      });
    } catch (error) {
      console.error('Error loading document for signature placement:', error);
      alert(error instanceof Error ? error.message : 'Could not load this document.');
    }
  };

  const saveSignatureFields = async (fields: SignatureField[]) => {
    if (!editorSession) return;

    if (editorSession.documentId) {
      const response = await fetch(`/api/admin/documents/${editorSession.documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureFields: fields }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Could not update signature positions.');
      }
    } else {
      const formData = new FormData();
      formData.append('title', editorSession.title);
      formData.append('file', editorSession.pdfFile);
      formData.append('signatureFields', JSON.stringify(fields));
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Could not upload the document.');
      }
      setTitle('');
      setFile(null);
    }

    setEditorSession(null);
    try {
      setDocuments(await loadDocuments());
    } catch (error) {
      console.error('Error refreshing documents:', error);
      alert('The changes were saved, but the document list could not be refreshed.');
    }
  };

  const handleToggleActive = async (id: string, newStatus: boolean) => {
    setTogglingId(id);
    // Optimistically update
    setDocuments((prev) =>
      prev.map((d) => (d._id === id ? { ...d, isActive: newStatus } : d))
    );

    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update link status');
      }
    } catch (err) {
      console.error(err);
      alert(`Could not update link status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      // Revert optimistic update
      setDocuments((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isActive: !newStatus } : d))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/sign/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="p-8">Loading documents...</div>;

  if (editorSession) {
    return (
      <SignatureFieldEditor
        pdfFile={editorSession.pdfFile}
        initialFields={editorSession.fields}
        onCancel={() => {
          const isNewDocument = !editorSession.documentId;
          setEditorSession(null);
          if (isNewDocument) setShowUpload(true);
        }}
        onSave={saveSignatureFields}
        saveLabel={editorSession.documentId ? 'Save positions' : 'Upload and create link'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents &amp; Links</h1>
          <p className="text-slate-500 text-sm mt-1">Manage PDF templates, shareable links, and activation statuses.</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {showUpload ? 'Cancel Upload' : 'Upload Document'}
        </button>
      </div>

      {showUpload && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-xl"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-primary" />
            Upload New Document
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
                placeholder="e.g. Non-Disclosure Agreement"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PDF File</label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={!file || !title}
              className="w-full bg-brand-primary text-white py-2 rounded-lg font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
            >
              Continue to signature positions
            </button>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Link Status</th>
                <th className="px-6 py-4">Uploaded At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div>{doc.title}</div>
                        <div className="text-xs text-slate-400 font-normal mt-0.5">ID: {doc._id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {doc.isActive ? (
                          <button
                            onClick={() => handleToggleActive(doc._id, false)}
                            disabled={togglingId === doc._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            title="Deactivate this signing link"
                          >
                            {togglingId === doc._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <PowerOff className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(doc._id, true)}
                            disabled={togglingId === doc._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            title="Re-enable this signing link"
                          >
                            {togglingId === doc._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Power className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            Enable
                          </button>
                        )}
                        <button
                          onClick={() => handleConfigureFields(doc)}
                          className="flex items-center gap-2 rounded-lg border border-brand-primary/20 bg-brand-primary/5 px-3 py-1.5 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-primary/10"
                          title={doc.signatureFields?.length ? 'Edit signature positions' : 'Configure signature positions'}
                        >
                          {doc.signatureFields?.length ? 'Edit positions' : 'Set positions'}
                        </button>
                        <button 
                          onClick={() => copyLink(doc._id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
                          title="Copy shareable signing link"
                        >
                          {copiedId === doc._id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                          {copiedId === doc._id ? 'Copied' : 'Copy Link'}
                        </button>
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
                          title="View Original PDF"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
