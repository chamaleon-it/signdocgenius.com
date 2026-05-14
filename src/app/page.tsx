'use client';

import Hero from '../components/Hero';
import CustomerLogos from '../components/CustomerLogos';
import Features from '../components/Features';
import Security from '../components/Security';
import Integrations from '../components/Integrations';
import CTA from '../components/CTA';

export default function Home() {
  return (
    <div className="flex flex-col gap-20">
      <Hero />
      <CustomerLogos />
      <Features />
      <Security />
      <Integrations />
      <CTA />
    </div>
  );
}
