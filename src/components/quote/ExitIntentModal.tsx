import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    onClose(); // Close modal after booking
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 z-10"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-blue-800">
                Vänta! 🏡
              </h3>
              <h4 className="text-lg font-semibold text-blue-800">
                Få ditt kostnadsfria hembesök nu
              </h4>
              <p className="text-sm text-blue-700">
                Få en exakt offert baserad på noggrann mätning och bedömning av din fastighet
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 gap-3 py-4">
              <div className="flex items-center gap-3 text-sm text-blue-700">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Kostnadsfritt hembesök</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-700">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Exakt mätning och bedömning</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-700">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Ingen kostnad eller förpliktelse</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                onClick={handleBookConsultation}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white text-base font-semibold"
              >
                <CalendarCheck className="w-5 h-5 mr-2" />
                Ja, boka mitt hembesök nu!
              </Button>
              
              <Button 
                onClick={onConfirmExit}
                variant="outline"
                size="lg"
                className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Nej tack, jag lämnar sidan
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
      </div>
    </div>
  );
}