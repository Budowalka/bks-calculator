'use client';

import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { trackScrollToCalendar, trackPhoneClick } from '@/lib/analytics';

export function FinalCTA() {
  function handleScroll() {
    trackScrollToCalendar('final_cta');
    document.getElementById('boka')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-16 md:py-20">
      <div className="container mx-auto px-4 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Redo att komma igång?
        </h2>
        <p className="text-blue-100 text-lg max-w-xl mx-auto">
          Boka ditt kostnadsfria hembesök idag. Välj en tid som passar dig
          så tar vi hand om resten.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 text-base px-8"
            onClick={handleScroll}
          >
            Välj tid i kalendern
          </Button>
          <a
            href="tel:+46735757897"
            onClick={() => trackPhoneClick('final_cta')}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 px-6 h-10 text-base font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="h-4 w-4" />
            073-575 78 97
          </a>
        </div>
      </div>
    </section>
  );
}
