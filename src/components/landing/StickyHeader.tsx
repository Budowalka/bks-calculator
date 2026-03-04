'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-sand-50/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo-bks.png"
            alt="BKS Entreprenad"
            width={100}
            height={33}
            className="h-7 w-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          />
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <a
            href="tel:+46735757897"
            className={cn(
              'hidden sm:flex items-center gap-1.5 text-sm transition-colors',
              scrolled
                ? 'text-stone-600 hover:text-charcoal'
                : 'text-white/70 hover:text-white'
            )}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>073-575 78 97</span>
          </a>
          <Button
            asChild
            size="sm"
            className="bg-gold hover:bg-gold-dark text-charcoal font-medium text-sm px-5 border-0"
          >
            <Link href="/kalkyl">Räkna pris</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
