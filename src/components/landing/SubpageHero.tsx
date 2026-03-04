import Image from 'next/image';

interface SubpageHeroProps {
  title: string;
  subtitle: string;
}

export function SubpageHero({ title, subtitle }: SubpageHeroProps) {
  return (
    <section className="relative bg-charcoal overflow-hidden">
      <Image
        src="/images/Stenläggning-i-Stockholm.jpg"
        alt=""
        fill
        className="object-cover opacity-15"
        priority
      />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="w-10 h-0.5 bg-gold mb-6" />
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
