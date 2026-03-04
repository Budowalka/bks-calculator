'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { trackScrollToCalendar, trackPhoneClick } from '@/lib/analytics';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('[data-booking-hero]');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-sand-50 border-t border-sand-200 p-3 shadow-lg">
      <div className="flex gap-2">
        <Button
          className="flex-1 bg-gold hover:bg-gold-dark text-charcoal font-semibold text-sm border-0"
          onClick={() => {
            trackScrollToCalendar('sticky_mobile');
            document.getElementById('boka')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Boka hembesök
        </Button>
        <Button
          asChild
          variant="outline"
          className="shrink-0 border-sand-300"
          onClick={() => trackPhoneClick('sticky_mobile')}
        >
          <a href="tel:+46735757897">
            <Phone className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
