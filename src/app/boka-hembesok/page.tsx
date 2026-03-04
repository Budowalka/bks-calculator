import type { Metadata } from 'next';
import { AttributionCapture } from '@/components/analytics/AttributionCapture';
import { BookingHero } from '@/components/booking/BookingHero';
import { BenefitsList } from '@/components/booking/BenefitsList';
import { BookingProcess } from '@/components/booking/BookingProcess';
import { CalComEmbed } from '@/components/booking/CalComEmbed';
import { TestimonialsSection } from '@/components/booking/TestimonialsSection';
import { BookingFAQ } from '@/components/booking/BookingFAQ';
import { FinalCTA } from '@/components/booking/FinalCTA';
import { StickyMobileCTA } from '@/components/booking/StickyMobileCTA';
import { BookingPageView } from './BookingPageView';
import { Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Boka kostnadsfritt hembesök | BKS Entreprenad Stockholm',
  description:
    'Boka ett kostnadsfritt hembesök med BKS Entreprenad. Vi besöker dig, mäter upp och lämnar en detaljerad offert inom 48 timmar. Hela Stockholmsområdet.',
  keywords: [
    'hembesök',
    'kostnadsfri offert',
    'stenläggning stockholm',
    'markarbete offert',
    'BKS Entreprenad',
    'boka hembesök',
  ],
  alternates: {
    canonical: '/boka-hembesok',
  },
  openGraph: {
    title: 'Boka kostnadsfritt hembesök | BKS Entreprenad',
    description:
      'Kostnadsfritt hembesök med professionell bedömning. Offert inom 48 timmar.',
    type: 'website',
    locale: 'sv_SE',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Kostnadsfritt hembesök',
      description:
        'Professionell bedömning av ytan, exakt uppmätning och detaljerad offert inom 48 timmar.',
      provider: {
        '@type': 'LocalBusiness',
        name: 'BKS Äkeri AB',
        telephone: '+46735757897',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Stockholm',
          addressRegion: 'Stockholms län',
          addressCountry: 'SE',
        },
        areaServed: {
          '@type': 'City',
          name: 'Stockholm',
        },
      },
      areaServed: {
        '@type': 'City',
        name: 'Stockholm',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'SEK',
        description: 'Kostnadsfritt hembesök utan förpliktelser',
      },
      potentialAction: {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://smova.se/boka-hembesok#boka',
        },
        result: {
          '@type': 'Reservation',
          name: 'Hembesök bokning',
        },
      },
    },
  ],
};

export default function BokaHembesokPage() {
  return (
    <div className="font-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AttributionCapture />
      <BookingPageView />

      <main className="min-h-screen">
        <div data-booking-hero>
          <BookingHero />
        </div>

        <BookingProcess />

        <section className="bg-white py-12 md:py-16" id="boka">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-10 h-0.5 bg-gold mx-auto mb-6" />
            <h2 className="font-display text-2xl md:text-3xl text-center text-charcoal mb-2">
              Boka ditt kostnadsfria hembesök
            </h2>
            <p className="text-center text-stone-500 mb-8 max-w-md mx-auto">
              Boka en tid i vår digitala kalender nedan. Du får en bekräftelse
              via e-post direkt.
            </p>
            <CalComEmbed />
          </div>
        </section>

        <TestimonialsSection />
        <BenefitsList />
        <BookingFAQ />
        <PhoneCTA />
        <FinalCTA />
      </main>

      <StickyMobileCTA />
    </div>
  );
}

function PhoneCTA() {
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h2 className="font-display text-xl md:text-2xl text-charcoal">
          Föredrar du att ringa?
        </h2>
        <p className="text-stone-500">
          Vi hjälper dig gärna att hitta en tid som passar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="tel:+46735757897"
            className="inline-flex items-center gap-2 rounded-md bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal-600 transition-colors"
          >
            <Phone className="h-4 w-4" />
            073-575 78 97
          </a>
          <a
            href="mailto:ramiro@bksakeri.se"
            className="inline-flex items-center gap-2 rounded-md border border-sand-300 bg-white px-6 py-2.5 text-sm font-medium text-stone-600 hover:bg-sand-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            ramiro@bksakeri.se
          </a>
        </div>
      </div>
    </section>
  );
}
