import { Star } from 'lucide-react';

const testimonials = [
  {
    text: 'Fick bra hjälp med en stenlagd uppfart. Arbetet utfördes enligt offert och på utsatt tid. Lyhörda på våra önskemål men hade också egna förslag utifrån sin expertis. Alla var måna om att göra ett bra arbete.',
    name: 'Stefan N.',
    location: 'Bromma',
    project: 'Marksten uppfart',
  },
  {
    text: 'Anlitade BKS för uteplats med betongplattor. Från allra första kontakten fick vi väldigt bra bemötande. Ramiro besökte oss och såg till att allt blev som vi förväntade oss. Snyggt och noggrant!',
    name: 'Anna & Johan K.',
    location: 'Nacka',
    project: 'Uteplats betongplattor',
  },
  {
    text: 'Bland det proffsigaste jag upplevt i entreprenörväg. Beställde stenläggning av en ny entré och trädgårdsväg. Arbetet blev jättefint och hög kvalitet från start till slut.',
    name: 'Kristina L.',
    location: 'Sollentuna',
    project: 'Entré och trädgårdsväg',
  },
  {
    text: 'Vi behövde lägga om hela garageuppfarten med gatsten. BKS var lösningsorienterade, noggranna och lätta att ha att göra med. Resultatet blev precis så bra som vi hoppats på — om inte bättre.',
    name: 'Per-Erik M.',
    location: 'Täby',
    project: 'Garageuppfart gatsten',
  },
  {
    text: 'Trevligt bemötande och bra dialog under hela projektets gång. Arbetet flöt på i bra takt och utfördes med engagemang. Vi fick en tydlig offert som höll — inga överraskningar.',
    name: 'Birgitta & Lars H.',
    location: 'Lidingö',
    project: 'Skiffer uteplats',
  },
  {
    text: 'Jämförde flera offerter och BKS var klart bäst — inte bara i pris utan i kommunikation och kunskap. Kalkylatorn på hemsidan gav en bra uppskattning direkt. Rekommenderar varmt!',
    name: 'Marcus W.',
    location: 'Hägersten',
    project: 'Markarbete och stenläggning',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="bg-charcoal py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-10 h-0.5 bg-gold mb-6 mx-auto" />
        <h2 className="font-display text-3xl md:text-4xl text-center text-white mb-16">
          Vad våra kunder säger
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white/5 rounded-lg p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <Stars />
                <span className="text-xs text-gold/60 uppercase tracking-wider">
                  {t.project}
                </span>
              </div>
              <blockquote className="font-display text-base italic text-white/80 leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <div className="text-sm border-t border-white/5 pt-4">
                <span className="text-white/60">{t.name}</span>
                <span className="text-white/30 mx-2">·</span>
                <span className="text-white/40">{t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
