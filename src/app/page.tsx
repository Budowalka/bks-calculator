import { StickyHeader } from '@/components/landing/StickyHeader';
import { Hero } from '@/components/landing/Hero';
import { USPBar } from '@/components/landing/USPBar';
import { ServicesGrid } from '@/components/landing/ServicesGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Portfolio } from '@/components/landing/Portfolio';
import { AboutSection } from '@/components/landing/AboutSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { AttributionCapture } from '@/components/analytics/AttributionCapture';

export default function Home() {
  return (
    <div className="font-body">
      <AttributionCapture />
      <StickyHeader />
      <main>
        <Hero />
        <USPBar />
        <ScrollReveal>
          <ServicesGrid />
        </ScrollReveal>
        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>
        <ScrollReveal>
          <Portfolio />
        </ScrollReveal>
        <ScrollReveal>
          <div id="om-oss">
            <AboutSection />
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>
        <div id="faq">
          <FAQ />
        </div>
        <ScrollReveal>
          <FinalCTA />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}
