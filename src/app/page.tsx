import Header from '../components/Header';
import Hero from '../components/Hero';
import CustomerLogos from '../components/CustomerLogos';
import Features from '../components/Features';
import Security from '../components/Security';
import Integrations from '../components/Integrations';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CustomerLogos />
        <Features />
        <Security />
        <Integrations />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
