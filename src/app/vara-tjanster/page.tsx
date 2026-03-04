import type { Metadata } from 'next';
import { StickyHeader } from '@/components/landing/StickyHeader';
import { SubpageHero } from '@/components/landing/SubpageHero';
import { ServicesDetailed } from '@/components/landing/ServicesDetailed';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Testimonials } from '@/components/landing/Testimonials';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { AttributionCapture } from '@/components/analytics/AttributionCapture';

export const metadata: Metadata = {
  title:
    'Våra tjänster | Stenläggning, plattsättning & markarbete – BKS Entreprenad',
  description:
    'BKS Entreprenad erbjuder stenläggning, plattsättning, markarbete och asfaltering i hela Stockholmsområdet. Räkna pris direkt med vår kalkylator.',
  keywords: [
    'stenläggning stockholm',
    'plattsättare',
    'markarbete',
    'asfaltering uppfart',
    'kantstöd',
    'trädgårdsanläggning',
  ],
  alternates: {
    canonical: '/vara-tjanster',
  },
  openGraph: {
    title: 'Våra tjänster | Stenläggning & markarbete – BKS Entreprenad',
    description:
      'Stenläggning, plattsättning, markarbete och asfaltering i hela Stockholmsområdet.',
    type: 'website',
    locale: 'sv_SE',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Stenläggning och markarbete',
      description:
        'Professionell stenläggning, plattsättning, markarbete och asfaltering i Stockholmsområdet.',
      provider: {
        '@type': 'LocalBusiness',
        name: 'BKS Äkeri AB',
        telephone: '+46735757897',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Kungsgatan 29',
          addressLocality: 'Stockholm',
          postalCode: '111 56',
          addressRegion: 'Stockholms län',
          addressCountry: 'SE',
        },
        areaServed: {
          '@type': 'City',
          name: 'Stockholm',
        },
      },
      serviceType: [
        'Stenläggning',
        'Plattsättning',
        'Markarbete',
        'Asfaltering',
        'Kantstöd',
        'Trädgårdsanläggning',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Hem',
          item: 'https://bksentreprenad.se',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Våra tjänster',
          item: 'https://bksentreprenad.se/vara-tjanster',
        },
      ],
    },
  ],
};

export default function VaraTjansterPage() {
  return (
    <div className="font-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AttributionCapture />
      <StickyHeader />
      <main>
        <SubpageHero
          title="Våra tjänster"
          subtitle="Stenläggning, plattsättning och markarbete i hela Stockholmsområdet. Från uppfarter till uteplatser — vi levererar kvalitet i varje projekt."
        />
        <ScrollReveal>
          <ServicesDetailed />
        </ScrollReveal>
        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>
        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>
        <ScrollReveal>
          <FinalCTA />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}
