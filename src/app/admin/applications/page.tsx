'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, ExternalLink, Mail, User, FileText } from 'lucide-react';

type Document = {
  _id: string;
  title: string;
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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/documents');
      const data = await res.json();
      if (data.applications) setApplications(data.applications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading applications...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submitted Applications</h1>
        <p className="text-slate-500 text-sm mt-1">Review all signed documents submitted by your clients.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Client Details</th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Date Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No applications submitted yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {app.clientName}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {app.clientEmail}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <FileText className="w-4 h-4 text-brand-primary" />
                        {app.documentId?.title || 'Unknown Doc'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Signed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={app.signedFileUrl} 
                        target="_blank" 
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View PDF
                      </a>
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
