import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const services = [
  {
    title: 'Stenläggning',
    description:
      'Marksten, betongplattor och gatsten för uppfarter och uteplatser.',
    image: '/images/2-marksten.webp',
  },
  {
    title: 'Plattsättning',
    description:
      'Skiffer och granithällar för eleganta ytor med hög hållbarhet.',
    image: '/images/7-skiffer.webp',
  },
  {
    title: 'Markarbete',
    description: 'Schaktning, underarbete och markförberedelse.',
    image: '/images/stenlaggning4.webp',
  },
  {
    title: 'Asfaltering',
    description:
      'Professionell asfaltering av uppfarter och parkeringsytor.',
    image: '/images/1-asfal1.jpg',
  },
  {
    title: 'Kantstöd & murar',
    description: 'Betong- och granitkantsten för tydlig avgränsning.',
    image: '/images/6-Granitkällar.webp',
  },
  {
    title: 'Trädgårdsanläggning',
    description: 'Helhetslösningar — gångvägar, uteplatser, planteringar.',
    image: '/images/4-smågasten.webp',
  },
];

export function ServicesGrid() {
  return (
    <section className="bg-sand-50 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <div className="w-10 h-0.5 bg-gold mb-6" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal mb-4">
            Våra tjänster
          </h2>
          <p className="text-stone-500 text-lg max-w-xl">
            Kompletta lösningar inom stenläggning och markarbete i hela
            Stockholmsområdet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <Link
              key={service.title}
              href="/kalkyl"
              className="group block"
            >
              <div className="relative h-56 rounded-lg overflow-hidden mb-4">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="font-display text-xl text-charcoal mb-1 flex items-center gap-2">
                {service.title}
                <ArrowUpRight className="w-4 h-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-stone-500">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
