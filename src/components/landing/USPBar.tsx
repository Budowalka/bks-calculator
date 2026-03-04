import { Calculator, Home, FileText } from 'lucide-react';

const usps = [
  {
    icon: Calculator,
    title: 'Kalkylator online',
    description: 'Räkna priset direkt — enda kalkylatorn i Stockholm',
  },
  {
    icon: Home,
    title: 'Kostnadsfritt hembesök',
    description: 'Vi kommer till dig för exakt mätning',
  },
  {
    icon: FileText,
    title: 'Fast pris inom 48h',
    description: 'Detaljerad offert utan överraskningar',
  },
];

export function USPBar() {
  return (
    <section className="bg-charcoal py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {usps.map((usp) => (
            <div
              key={usp.title}
              className="flex flex-col items-center text-center py-6 md:py-0 md:px-8"
            >
              <usp.icon className="w-5 h-5 text-gold mb-3" />
              <h3 className="font-display text-lg text-white mb-1">
                {usp.title}
              </h3>
              <p className="text-sm text-white/50">{usp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
