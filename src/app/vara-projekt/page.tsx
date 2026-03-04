import type { Metadata } from 'next';
import { StickyHeader } from '@/components/landing/StickyHeader';
import { SubpageHero } from '@/components/landing/SubpageHero';
import { PortfolioExpanded } from '@/components/landing/PortfolioExpanded';
import { Testimonials } from '@/components/landing/Testimonials';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { AttributionCapture } from '@/components/analytics/AttributionCapture';

export const metadata: Metadata = {
  title:
    'Våra projekt | Stenläggning & markarbete i Stockholm – BKS Entreprenad',
  description:
    'Se våra senaste projekt inom stenläggning och markarbete. Uppfarter, uteplatser och trädgårdsanläggning i Stockholmsområdet.',
  keywords: [
    'stenläggning projekt',
    'markarbete bilder',
    'uppfart marksten',
    'uteplats betongplattor',
  ],
  alternates: {
    canonical: '/vara-projekt',
  },
  openGraph: {
    title: 'Våra projekt | Stenläggning & markarbete – BKS Entreprenad',
    description:
      'Se våra senaste projekt inom stenläggning och markarbete i Stockholmsområdet.',
    type: 'website',
    locale: 'sv_SE',
    images: [
      {
        url: '/images/Stenlägning-färdig-projekt.jpg',
        width: 1200,
        height: 630,
        alt: 'Stenläggning projekt i Stockholm – BKS Entreprenad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Våra projekt | Stenläggning & markarbete – BKS Entreprenad',
    description:
      'Se våra senaste projekt inom stenläggning och markarbete i Stockholmsområdet.',
    images: ['/images/Stenlägning-färdig-projekt.jpg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'Våra projekt',
      description:
        'Portfolio med stenläggning och markarbete i Stockholmsområdet.',
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
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Hem',
          item: 'https://smova.se',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Våra projekt',
          item: 'https://smova.se/vara-projekt',
        },
      ],
    },
  ],
};

export default function VaraProjektPage() {
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
          title="Våra projekt"
          subtitle="Några av våra senaste uppdrag inom stenläggning och markarbete i Stockholmsområdet."
        />
        <ScrollReveal>
          <PortfolioExpanded />
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
