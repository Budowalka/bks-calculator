import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  project: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Anna L.',
    location: 'Bromma',
    text: 'Mycket professionellt från start till slut. Hembesöket var grundligt och offerten kom redan nästa dag. Rekommenderar varmt!',
    rating: 5,
    project: 'Stenläggning',
  },
  {
    name: 'Erik S.',
    location: 'Nacka',
    text: 'Bra kommunikation och tydlig offert utan dolda kostnader. Resultatet blev fantastiskt — precis som vi önskade.',
    rating: 5,
    project: 'Markarbete',
  },
  {
    name: 'Maria & Johan K.',
    location: 'Sollentuna',
    text: 'Vi jämförde tre företag och BKS hade bäst pris-prestanda. Dessutom var de enda som erbjöd kostnadsfritt hembesök.',
    rating: 5,
    project: 'Plattsättning',
  },
  {
    name: 'Peter W.',
    location: 'Täby',
    text: 'Proffsigt bemötande vid hembesöket. De såg saker vi inte hade tänkt på och sparade oss pengar med smarta lösningar.',
    rating: 5,
    project: 'Trädgårdsanläggning',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-charcoal py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-10 h-0.5 bg-gold mx-auto mb-6" />
        <h2 className="font-display text-2xl md:text-3xl text-center text-white mb-4">
          Vad våra kunder säger
        </h2>
        <p className="text-center text-white/40 mb-10">
          Baserat på 450+ genomförda projekt i Stockholmsområdet
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-0 shadow-sm bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Stars count={t.rating} />
                  <span className="text-xs font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                    {t.project}
                  </span>
                </div>
                <p className="font-display italic text-white/70 text-sm leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="text-sm">
                  <span className="font-medium text-white/60">{t.name}</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span className="text-white/40">{t.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
