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
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 text-center mb-2">
          Så går det till
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-10">
          Från bokning till fast offert
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.step} className="text-center space-y-3 relative">
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gray-200" />
              )}
              <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center relative z-10">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Steg {s.step}
              </div>
              <h3 className="text-base font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
