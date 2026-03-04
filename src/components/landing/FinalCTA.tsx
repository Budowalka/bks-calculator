import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calculator, Phone } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="relative bg-charcoal overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/images/Stenlägning-färdig-projekt.jpg"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        <div className="w-10 h-0.5 bg-gold mb-8 mx-auto" />
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6">
          Redo att börja?
        </h2>
        <p className="text-lg text-white/50 max-w-lg mx-auto mb-10">
          Få din kostnadsfria offert på under 3 minuter. Inga förpliktelser.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="text-base px-10 py-6 bg-gold hover:bg-gold-dark text-charcoal font-semibold shadow-lg border-0"
          >
            <Link href="/kalkyl" className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Räkna pris
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-base px-10 py-6 border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <a href="tel:+46735757897" className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              073-575 78 97
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
