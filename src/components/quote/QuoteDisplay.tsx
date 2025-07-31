import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuoteResponse } from '@/lib/types';
import { QuoteSummary } from './QuoteSummary';
import { QuoteItemsTable } from './QuoteItemsTable';
import { ConsultationCTA } from './ConsultationCTA';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface QuoteDisplayProps {
  quoteData: QuoteResponse;
}

export function QuoteDisplay({ quoteData }: QuoteDisplayProps) {
  if (!quoteData.quote) {
    return null;
  }

  const { quote, disclaimer } = quoteData;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <AlertDescription>
          <div className="font-medium mb-1 text-green-800">Tack för din förfrågan!</div>
          <p className="text-sm text-green-700">
            Din preliminära offert har genererats. Nedan ser du en detaljerad uppdelning av kostnaderna.
          </p>
        </AlertDescription>
      </Alert>

      {/* Quote Summary */}
      <QuoteSummary quote={quote} />

      {/* Itemized Breakdown */}
      <QuoteItemsTable items={quote.items} />

      {/* What's Included/Not Included */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What's Included */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Vad som ingår i priset:</div>
            <ul className="text-sm space-y-1">
              <li>• Alla förberedande material (makadam, stenflis, geotextil)</li>
              <li>• Schakt och jordarbeten</li>
              <li>• Asfalt (om vald som slutbeläggning)</li>
              <li>• Alla arbeten och maskintransport</li>
              <li>• Bortforsling av byggavfall</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* What's Not Included */}
        <Alert variant="secondary">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Slutbeläggning - väljs vid hembesök:</div>
            <ul className="text-sm space-y-1">
              <li>• Betongplattor och marksten</li>
              <li>• Kostka brukowa (små- och storgatsten)</li>
              <li>• Granithällar och skifferplattor</li>
              <li>• Pris beror på typ, färg och tillverkare</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Vi hjälper dig välja rätt material under vårt kostnadsfria hembesök
            </p>
          </AlertDescription>
        </Alert>
      </div>

      {/* Disclaimer */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription>
          <div className="font-medium mb-1 text-amber-800">{disclaimer.title}</div>
          <p className="text-sm text-amber-700">{disclaimer.content}</p>
        </AlertDescription>
      </Alert>

      {/* Consultation CTA */}
      <ConsultationCTA />

      {/* Additional Information */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          <div className="font-medium mb-2">Vad händer nu?</div>
          <ul className="text-sm space-y-1">
            <li>• Du får en kopia av denna offert via e-post inom 5 minuter</li>
            <li>• Vi kontaktar dig inom 24 timmar för att boka hembesök</li>
            <li>• Hembesöket är kostnadsfritt och utan förpliktelser</li>
            <li>• Vid hembesöket får du en bindande offert med exakta priser</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}