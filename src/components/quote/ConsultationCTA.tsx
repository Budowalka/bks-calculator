import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarCheck, MapPin, Calculator } from 'lucide-react';
import { CustomerInfo } from '@/lib/types';
import { generateCalLink } from '@/lib/cal-link-generator';

interface ConsultationCTAProps {
  customerInfo?: CustomerInfo;
}

export function ConsultationCTA({ customerInfo }: ConsultationCTAProps) {
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
  };

  return (
    <Card className="border-gold/20 bg-gold/5">
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="font-display text-lg text-charcoal">
            Nästa steg: Kostnadsfritt hembesök
          </h3>
          <p className="text-sm text-stone-500">
            Få en exakt offert baserad på noggrann mätning och bedömning av din fastighet
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
            <MapPin className="w-4 h-4 text-gold" />
            <span>Hembesök</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
            <Calculator className="w-4 h-4 text-gold" />
            <span>Exakt mätning</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
            <CalendarCheck className="w-4 h-4 text-gold" />
            <span>Ingen kostnad</span>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={handleBookConsultation}
            size="lg"
            className="bg-gold hover:bg-gold-dark text-charcoal px-8 py-3 text-base font-semibold border-0"
          >
            <CalendarCheck className="w-5 h-5 mr-2" />
            Boka din platsbesiktning nu
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-stone-400">
            Vi kontaktar dig inom 24 timmar för att boka en tid som passar dig
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
