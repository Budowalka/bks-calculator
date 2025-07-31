import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarCheck, MapPin, Calculator } from 'lucide-react';

export function ConsultationCTA() {
  const handleBookConsultation = () => {
    // TODO: Integrate with calendar booking system
    // For now, could redirect to external calendar or show contact info
    window.open('tel:+46123456789', '_self');
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold"
          >
            <CalendarCheck className="w-5 h-5 mr-2" />
            Boka kostnadsfritt hembesök
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