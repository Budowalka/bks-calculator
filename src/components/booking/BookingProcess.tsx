import { CalendarCheck, Home, FileText } from 'lucide-react';

const steps = [
  {
    icon: CalendarCheck,
    step: '01',
    title: 'Välj en tid som passar',
    description: 'Boka direkt i kalendern nedan. Välj dag och tid som passar dig bäst.',
  },
  {
    icon: Home,
    step: '02',
    title: 'Vi besöker dig hemma',
    description: 'Vi tar mått, bedömer förutsättningarna och diskuterar dina önskemål.',
  },
  {
    icon: FileText,
    step: '03',
    title: 'Fast offert inom 48h',
    description: 'Du får en detaljerad offert med fast pris, utan förpliktelser.',
  },
];

export function BookingProcess() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-10 h-0.5 bg-gold mx-auto mb-6" />
        <h2 className="font-display text-xl md:text-2xl text-center text-charcoal mb-10">
          Från bokning till fast offert
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.step} className="text-center space-y-3 relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-sand-200" />
              )}
              <div className="mx-auto w-14 h-14 rounded-full bg-sand-50 flex items-center justify-center relative z-10">
                <s.icon className="h-6 w-6 text-gold" />
              </div>
              <div className="font-display text-3xl text-gold/30">
                {s.step}
              </div>
              <h3 className="font-display text-base text-charcoal">{s.title}</h3>
              <p className="text-sm text-stone-500 max-w-xs mx-auto">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
