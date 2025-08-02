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
      // Generate Cal.com link with pre-filled customer data
      const calLink = generateCalLink({
        firstName: customerInfo.first_name,
        lastName: customerInfo.last_name,
        email: customerInfo.email,
        phone: customerInfo.phone
      });
      window.open(calLink, '_blank');
    } else {
      // Fallback to default Cal.com link
      window.open('https://cal.com/bksentreprenad/platsbesok', '_blank');
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-blue-800">
            Nästa steg: Kostnadsfritt hembesök
          </h3>
          <p className="text-sm text-blue-700">
            Få en exakt offert baserad på noggrann mätning och bedömning av din fastighet
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Hembesök</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>Exakt mätning</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
            <CalendarCheck className="w-4 h-4 text-blue-600" />
            <span>Ingen kostnad</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-2">
          <Button 
            onClick={handleBookConsultation}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-semibold"
          >
            <CalendarCheck className="w-5 h-5 mr-2" />
            Boka din platsbesiktning nu
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-blue-600">
            Vi kontaktar dig inom 24 timmar för att boka en tid som passar dig
          </p>
        </div>
      </CardContent>
    </Card>
  );
}