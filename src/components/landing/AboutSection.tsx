import { Users, MapPin, Calendar, TrendingUp } from 'lucide-react';

const stats = [
  { value: '2018', label: 'Sedan', icon: Calendar },
  { value: '11', label: 'Medarbetare', icon: Users },
  { value: '26.5M', label: 'SEK omsättning', icon: TrendingUp },
  { value: 'Stockholm', label: 'Hela området', icon: MapPin },
];

export function AboutSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div>
            <div className="w-10 h-0.5 bg-gold mb-6" />
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-6">
              Om BKS Entreprenad
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed mb-6">
              BKS AB (BKS Äkeri AB) är ett Stockholmsbaserat entreprenadföretag
              som sedan 2018 erbjuder professionell stenläggning, markarbete och
              transport.
            </p>
            <p className="text-stone-500 leading-relaxed mb-8">
              Med 11 medarbetare och en omsättning på 26.5 MSEK betjänar vi hela
              Stockholmsområdet — från privata uppfarter till större
              anläggningsprojekt.
            </p>
            <div className="text-sm text-stone-400">
              Org.nr 559179-6700 · Kungsgatan 29, 111 56 Stockholm
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-sand-50 rounded-lg p-6">
                <stat.icon className="w-5 h-5 text-gold mb-3" />
                <div className="font-display text-3xl text-charcoal">
                  {stat.value}
                </div>
                <div className="text-sm text-stone-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
