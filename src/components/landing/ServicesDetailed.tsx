import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const services = [
  {
    title: 'Stenläggning',
    description:
      'Vi lägger marksten, betongplattor och gatsten för uppfarter, uteplatser och gångvägar. Med rätt material och fackmannamässigt utförande skapar vi hållbara ytor som höjer värdet på din fastighet.',
    image: '/images/2-marksten.webp',
    materials: ['Marksten', 'Betongplattor', 'Gatsten'],
  },
  {
    title: 'Plattsättning',
    description:
      'Skiffer, granithällar och natursten för eleganta ytor med hög hållbarhet. Vi hjälper dig välja rätt material för ditt projekt och säkerställer ett perfekt resultat som håller i generationer.',
    image: '/images/7-skiffer.webp',
    materials: ['Skiffer', 'Granithällar', 'Natursten'],
  },
  {
    title: 'Markarbete',
    description:
      'Professionell schaktning, markförberedelse och underarbete — grunden för varje lyckat projekt. Vi utför allt från dränering till kompaktering för att säkerställa en stabil och hållbar yta.',
    image: '/images/stenlaggning4.webp',
    materials: ['Makadam', 'Stenmjöl', 'Dräneringsmaterial'],
  },
  {
    title: 'Asfaltering',
    description:
      'Professionell asfaltering av uppfarter, parkeringsytor och vägar. Vi levererar slitstarkt resultat med rätt tjocklek och fall för optimal vattenavrinning och lång livslängd.',
    image: '/images/1-asfal1.jpg',
    materials: ['Asfalt', 'Kallbeläggning'],
  },
  {
    title: 'Kantstöd & murar',
    description:
      'Betong- och granitkantsten för tydlig avgränsning av ytor. Kantstöd ger en professionell finish och håller materialet på plats — ett måste för varje stenläggningsprojekt.',
    image: '/images/6-Granitkällar.webp',
    materials: ['Betongkantsten', 'Granitkantsten', 'Natursten'],
  },
  {
    title: 'Trädgårdsanläggning',
    description:
      'Helhetslösningar för din trädgård — gångvägar, uteplatser, planteringar och belysning. Vi skapar funktionella och vackra utemiljöer som passar din livsstil och tomtens förutsättningar.',
    image: '/images/4-smågasten.webp',
    materials: ['Smågatsten', 'Betongplattor', 'Trädgårdssten'],
  },
];

export function ServicesDetailed() {
  return (
    <section className="bg-sand-50 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          {services.map((service) => (
            <div key={service.title} className="group">
              <div className="relative h-64 md:h-72 rounded-lg overflow-hidden mb-5">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="font-display text-2xl text-charcoal mb-2">
                {service.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {service.materials.map((material) => (
                  <span
                    key={material}
                    className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-gold/10 text-gold-dark border border-gold/20"
                  >
                    {material}
                  </span>
                ))}
              </div>
              <Button
                asChild
                size="sm"
                className="bg-gold hover:bg-gold-dark text-charcoal font-semibold border-0"
              >
                <Link href="/kalkyl">
                  Räkna pris
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
