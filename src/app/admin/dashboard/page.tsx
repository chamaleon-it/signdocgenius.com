'use client';

import { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, FileText, CheckCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

type Document = {
  _id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
};

type Application = {
  _id: string;
  documentId: Document;
  clientName: string;
  clientEmail: string;
  signedFileUrl: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload state
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/documents');
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
      if (data.applications) setApplications(data.applications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setTitle('');
        setFile(null);
        fetchData(); // Refresh lists
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/sign/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Manage your documents and client applications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand-primary" />
              Upload Document
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  placeholder="e.g. NDA Agreement"
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
                disabled={uploading || !file || !title}
                className="w-full bg-brand-primary text-white py-2 rounded-lg font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </form>
          </div>
        </div>

        {/* Lists Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Documents List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-primary" />
              Your Documents
            </h2>
            {documents.length === 0 ? (
              <p className="text-slate-500 text-sm">No documents uploaded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <div key={doc._id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-slate-900">{doc.title}</h3>
                      <p className="text-xs text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        className="p-2 text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                        title="View Original PDF"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => copyLink(doc._id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        {copiedId === doc._id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        {copiedId === doc._id ? 'Copied' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Completed Applications
            </h2>
            {applications.length === 0 ? (
              <p className="text-slate-500 text-sm">No completed applications yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <div key={app._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-slate-900">{app.clientName}</h3>
                      <p className="text-sm text-slate-500">{app.clientEmail}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Signed: {app.documentId?.title || 'Unknown Doc'} • {new Date(app.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <a 
                      href={app.signedFileUrl} 
                      target="_blank" 
                      className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors whitespace-nowrap text-center"
                    >
                      View Signed PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
