import Image from 'next/image';

const projects = [
  {
    title: 'Marksten uppfart',
    location: 'Bromma',
    image: '/images/2-marksten.webp',
  },
  {
    title: 'Betongplattor uteplats',
    location: 'Nacka',
    image: '/images/3-betongplattor.jpg',
  },
  {
    title: 'Gatsten trädgårdsväg',
    location: 'Sollentuna',
    image: '/images/4-smågasten.webp',
  },
  {
    title: 'Skiffer entré',
    location: 'Täby',
    image: '/images/7-skiffer.webp',
  },
];

export function Portfolio() {
  return (
    <section className="bg-sand-50 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-10 h-0.5 bg-gold mb-6" />
        <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-14">
          Senaste projekt
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {projects.map((project) => (
            <div key={project.title} className="group relative">
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="text-white font-medium text-sm">
                    {project.title}
                  </div>
                  <div className="text-white/60 text-xs">
                    {project.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
