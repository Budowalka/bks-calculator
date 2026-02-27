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
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
          Vad våra kunder säger
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Baserat på 450+ genomförda projekt i Stockholmsområdet
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Stars count={t.rating} />
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {t.project}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{t.name}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span className="text-gray-500">{t.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
