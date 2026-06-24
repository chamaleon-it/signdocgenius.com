'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Activity, CheckCircle, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type AnalyticsData = {
  totalDocuments: number;
  totalApplications: number;
  signedApplications: number;
  recentApplications: any[];
};

export default function DashboardOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Documents',
      value: data?.totalDocuments || 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Total Submissions',
      value: data?.totalApplications || 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      title: 'Signed Documents',
      value: data?.signedApplications || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
    {
      title: 'Pending Signatures',
      value: Math.max(0, (data?.totalApplications || 0) - (data?.signedApplications || 0)),
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-slate-900 tracking-tight"
        >
          Welcome back, Admin
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 mt-2 text-lg"
        >
          Here's what's happening with your documents today.
        </motion.p>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-3xl bg-white border ${stat.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
          >
            {/* Background decoration */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
            <p className="text-sm text-slate-500 mt-1">The latest documents signed by your clients.</p>
          </div>
          <Link 
            href="/admin/applications"
            className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-hover bg-brand-primary/10 hover:bg-brand-primary/20 px-4 py-2 rounded-xl transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {!data?.recentApplications || data.recentApplications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              No recent applications found.
            </div>
          ) : (
            data.recentApplications.map((app) => (
              <div key={app._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{app.clientName}</h3>
                    <p className="text-sm text-slate-500 mb-1">{app.clientEmail}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <FileText className="w-3.5 h-3.5" />
                      {app.documentId?.title || 'Unknown Document'}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Signed
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
