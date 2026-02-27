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
          urlTemplate: 'https://bks-calculator.vercel.app/boka-hembesok#boka',
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AttributionCapture />
      <BookingPageView />

      <main className="min-h-screen">
        {/* 1. Hero — value prop + bullet points (builds value fast) */}
        <div data-booking-hero>
          <BookingHero />
        </div>

        {/* 2. Process — 3 steps (quick trust builder) */}
        <BookingProcess />

        {/* 3. Calendar — THE main action, high on page */}
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 text-center mb-2">
              Välj tid
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
              Boka ditt kostnadsfria hembesök
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-md mx-auto">
              Boka en tid i vår digitala kalender nedan. Du får en bekräftelse
              via e-post direkt.
            </p>
            <CalComEmbed />
          </div>
        </section>

        {/* 4. Social proof — for those who scroll past calendar */}
        <TestimonialsSection />

        {/* 5. Benefits — detailed value for undecided visitors */}
        <BenefitsList />

        {/* 6. FAQ — handles objections */}
        <BookingFAQ />

        {/* 7. Phone CTA — alternative contact */}
        <PhoneCTA />

        {/* 8. Final CTA — last push back to calendar */}
        <FinalCTA />
      </main>

      <StickyMobileCTA />
    </>
  );
}

function PhoneCTA() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Föredrar du att ringa?
        </h2>
        <p className="text-gray-600">
          Vi hjälper dig gärna att hitta en tid som passar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="tel:+46735757897"
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            073-575 78 97
          </a>
          <a
            href="mailto:ramiro@bksakeri.se"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            ramiro@bksakeri.se
          </a>
        </div>
      </div>
    </section>
  );
}
