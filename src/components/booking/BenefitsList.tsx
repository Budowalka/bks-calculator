import { Card, CardContent } from '@/components/ui/card';
import {
  ClipboardCheck,
  Ruler,
  Palette,
  FileText,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react';

const benefits = [
  {
    icon: ClipboardCheck,
    title: 'Professionell bedömning',
    description: 'En expert bedömer ytan och förutsättningarna på plats.',
  },
  {
    icon: Ruler,
    title: 'Exakt mätning',
    description: 'Noggrann uppmätning för en precis och rättvis offert.',
  },
  {
    icon: Palette,
    title: 'Material- & designrådgivning',
    description: 'Vi hjälper dig välja rätt material och design.',
  },
  {
    icon: FileText,
    title: 'Detaljerad offert inom 48h',
    description: 'Alla kostnader tydligt specificerade — inga överraskningar.',
  },
  {
    icon: CalendarClock,
    title: 'Tidsplan för genomförande',
    description: 'Klarhet om start, duration och projektets alla steg.',
  },
  {
    icon: ShieldCheck,
    title: 'Inga dolda kostnader',
    description: 'Transparent prissättning från början till slut.',
  },
];

export function BenefitsList() {
  return (
    <section className="bg-sand-50 py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl md:text-3xl text-center text-charcoal mb-10">
          Vad ingår i hembesöket?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((b) => (
            <Card key={b.title} className="border-0 shadow-sm bg-white">
              <CardContent className="flex gap-4 items-start p-6">
                <div className="rounded-lg bg-gold/10 p-2.5 shrink-0">
                  <b.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-charcoal mb-1">{b.title}</h3>
                  <p className="text-sm text-stone-500">{b.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
