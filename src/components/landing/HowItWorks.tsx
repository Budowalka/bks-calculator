import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Räkna pris online',
    description:
      'Använd vår kalkylator och få en prisuppskattning på bara 3 minuter. Helt kostnadsfritt.',
  },
  {
    number: '02',
    title: 'Hembesök på plats',
    description:
      'Vi besöker dig för exakt mätning och materialbedömning. Utan förpliktelser.',
  },
  {
    number: '03',
    title: 'Offert inom 48h',
    description:
      'Du får en detaljerad offert med fast pris. Inga dolda kostnader.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-10 h-0.5 bg-gold mb-6 mx-auto" />
        <h2 className="font-display text-3xl md:text-4xl text-center text-charcoal mb-16">
          Hur det fungerar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-4xl mx-auto mb-14">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="font-display text-5xl text-gold/30 mb-4">
                {step.number}
              </div>
              <h3 className="font-display text-xl text-charcoal mb-3">
                {step.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="text-base px-10 py-6 bg-gold hover:bg-gold-dark text-charcoal font-semibold border-0"
          >
            <Link href="/kalkyl" className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Starta kalkylatorn
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
