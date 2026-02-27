'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle } from 'lucide-react';
import { trackScrollToCalendar, trackPhoneClick } from '@/lib/analytics';

const benefits = [
  'Personlig genomgång av ditt projekt på plats',
  'Exakt mätning och materialbedömning',
  'Fast prisförslag inom 48 timmar',
  'Svar på alla frågor om material och utförande',
  'Helt kostnadsfritt och utan förpliktelser',
];

function scrollToBooking(source: string) {
  trackScrollToCalendar(source);
  document.getElementById('boka')?.scrollIntoView({ behavior: 'smooth' });
}

export function BookingHero() {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <Image
            src="/images/logo-bks.png"
            alt="BKS Entreprenad"
            width={180}
            height={60}
            className="h-10 w-auto md:h-14"
            priority
          />

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Kostnadsfritt hembesök
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Boka ett kostnadsfritt hembesök
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              Vi kommer hem till dig, tar mått och ger dig en exakt offert på
              plats. Helt utan förpliktelser.
            </p>
          </div>

          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-base px-8"
              onClick={() => scrollToBooking('hero_cta')}
            >
              Välj tid nedan &rarr;
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base"
              onClick={() => trackPhoneClick('hero')}
            >
              <a href="tel:+46735757897">
                <Phone className="h-4 w-4" />
                Ring oss
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
