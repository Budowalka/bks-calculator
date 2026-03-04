import Image from 'next/image';

const projects = [
  {
    title: 'Marksten uppfart',
    location: 'Bromma, Stockholm',
    description:
      'Komplett uppfart i marksten med ny kantstöd och dränering. Projektet inkluderade schaktning, underarbete och fogning för ett hållbart resultat.',
    image: '/images/2-marksten.webp',
    material: 'Marksten',
  },
  {
    title: 'Betongplattor uteplats',
    location: 'Nacka, Stockholm',
    description:
      'Stor uteplats i betongplattor med integrerad belysning och trappsteg. Designad för att maximera utrymmet i en sluttande trädgård.',
    image: '/images/3-betongplattor.jpg',
    material: 'Betongplattor',
  },
  {
    title: 'Gatsten trädgårdsväg',
    location: 'Sollentuna, Stockholm',
    description:
      'Slingrande trädgårdsväg i smågatsten med planteringsytor. Ett klassiskt utförande som ger karaktär åt hela trädgården.',
    image: '/images/4-smågasten.webp',
    material: 'Smågatsten',
  },
  {
    title: 'Skiffer entré & gångväg',
    location: 'Täby, Stockholm',
    description:
      'Elegant entré i skiffer med matchande gångväg till altanen. Skiffern ger en modern och tidlös känsla som passar villan perfekt.',
    image: '/images/7-skiffer.webp',
    material: 'Skiffer',
  },
  {
    title: 'Asfaltering parkering',
    location: 'Danderyd, Stockholm',
    description:
      'Ny asfaltyta för parkering med korrekt fall och vattenavrinning. Professionellt underarbete säkerställer lång livslängd utan sprickbildning.',
    image: '/images/1-asfal1.jpg',
    material: 'Asfalt',
  },
  {
    title: 'Kantstöd & mur i granit',
    location: 'Lidingö, Stockholm',
    description:
      'Stödmur i granit med integrerade kantstöd längs uppfarten. Kombinerar funktion och estetik för en praktfull inramning.',
    image: '/images/6-Granitkällar.webp',
    material: 'Granit',
  },
];

export function PortfolioExpanded() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={`group flex flex-col ${
                index % 2 === 1 ? 'md:mt-12' : ''
              }`}
            >
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-5">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-gold text-charcoal">
                    {project.material}
                  </span>
                </div>
              </div>
              <h3 className="font-display text-xl text-charcoal mb-1">
                {project.title}
              </h3>
              <p className="text-sm text-gold-dark font-medium mb-2">
                {project.location}
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
