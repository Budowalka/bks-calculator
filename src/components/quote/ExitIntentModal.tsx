import { Button } from '@/components/ui/button';
import { CalendarCheck, MapPin, Calculator, X } from 'lucide-react';
import { CustomerInfo } from '@/lib/types';
import { generateCalLink } from '@/lib/cal-link-generator';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  customerInfo?: CustomerInfo;
}

export function ExitIntentModal({ isOpen, onClose, onConfirmExit, customerInfo }: ExitIntentModalProps) {
  const handleBookConsultation = () => {
    if (customerInfo) {
      const calLink = generateCalLink({
        firstName: customerInfo.first_name,
        lastName: customerInfo.last_name,
        email: customerInfo.email,
        phone: customerInfo.phone
      });
      window.open(calLink, '_blank');
    } else {
      window.open('https://cal.com/bksentreprenad/platsbesok', '_blank');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full rounded-xl border border-sand-200 bg-sand-50 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-sand-200 transition-colors z-10"
        >
          <X className="w-4 h-4 text-stone-500" />
        </button>

        <div className="p-6 md:p-8 space-y-5">
          {/* Header */}
          <div className="text-center space-y-2 pr-6">
            <h3 className="font-display text-2xl text-charcoal">
              Vänta!
            </h3>
            <p className="font-display text-lg text-charcoal">
              Få ditt kostnadsfria hembesök nu
            </p>
            <p className="text-sm text-stone-500">
              Få en exakt offert baserad på noggrann mätning och bedömning av din fastighet
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span>Kostnadsfritt hembesök</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <Calculator className="w-4 h-4 text-gold shrink-0" />
              <span>Exakt mätning och bedömning</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <CalendarCheck className="w-4 h-4 text-gold shrink-0" />
              <span>Ingen kostnad eller förpliktelse</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleBookConsultation}
              size="lg"
              className="w-full bg-gold hover:bg-gold-dark text-charcoal text-base font-semibold border-0"
            >
              <CalendarCheck className="w-5 h-5 mr-2" />
              Ja, boka mitt hembesök nu!
            </Button>

            <Button
              onClick={onConfirmExit}
              variant="outline"
              size="lg"
              className="w-full text-stone-500 border-sand-300 hover:bg-sand-100"
            >
              Nej tack, jag lämnar sidan
            </Button>
          </div>

          <p className="text-center text-xs text-stone-400">
            Vi kontaktar dig inom 24 timmar för att boka en tid som passar dig
          </p>
        </div>
      </div>
    </div>
  );
}
