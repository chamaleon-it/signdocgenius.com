import React from 'react';
import Link from 'next/link';
import { Shield, Mail, FileText, User } from 'lucide-react';

export function Footer() {
  const sections = [
    {
      title: "Product",
      links: ["eSignature", "Contract Lifecycle Management", "Document Generation", "Pricing"]
    },
    {
      title: "Solutions",
      links: ["Real Estate", "Financial Services", "Human Resources", "Legal"]
    },
    {
      title: "Support",
      links: ["Help Center", "Community", "Developer Center", "Trust Center"]
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Contact", "Investors"]
    }
  ];

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="w-8 h-8 bg-[#1e00ff] rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.8"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-slate-300 transition-colors duration-300" style={{ letterSpacing: '-0.03em' }}>SignDocGenius</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed mb-6">
              Docusign helps organizations connect and automate how they prepare, sign, act on, and manage agreements.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Mail size={18} />} />
              <SocialIcon icon={<FileText size={18} />} />
              <SocialIcon icon={<User size={18} />} />
            </div>
          </div>
          
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm hover:text-white transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs">© 2026 DocuSign, Inc. All rights reserved.</p>
          <div className="flex gap-8 text-xs font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all">
      {icon}
    </Link>
  );
}

export default Footer;
