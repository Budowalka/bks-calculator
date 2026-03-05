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

  const { quote, disclaimer, customerInfo } = quoteData;

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 mb-2">
          <CheckCircle className="w-7 h-7 text-gold" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-charcoal">
          Tack för din förfrågan!
        </h1>
        <p className="text-stone-500 max-w-lg mx-auto">
          Din preliminära offert har genererats. Nedan ser du en detaljerad uppdelning av kostnaderna.
        </p>
      </div>

      {/* Quote Summary */}
      <QuoteSummary quote={quote} />

      {/* What's Included / Not Included */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-sand-200 bg-sand-50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gold" />
            <h3 className="font-display text-base text-charcoal">Vad som ingår i priset</h3>
          </div>
          <ul className="text-sm space-y-1.5 text-stone-600">
            <li className="flex items-start gap-2"><span className="text-gold mt-0.5">-</span>Alla förberedande material (makadam, stenflis, geotextil)</li>
            <li className="flex items-start gap-2"><span className="text-gold mt-0.5">-</span>Schakt och jordarbeten</li>
            <li className="flex items-start gap-2"><span className="text-gold mt-0.5">-</span>Asfalt (om vald som slutbeläggning)</li>
            <li className="flex items-start gap-2"><span className="text-gold mt-0.5">-</span>Alla arbeten och maskintransport</li>
            <li className="flex items-start gap-2"><span className="text-gold mt-0.5">-</span>Bortforsling av byggavfall</li>
          </ul>
        </div>

        <div className="rounded-xl border border-stone-300 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-stone-400" />
            <h3 className="font-display text-base text-charcoal">Ingår inte i priset</h3>
          </div>
          <ul className="text-sm space-y-1.5 text-stone-600">
            <li className="flex items-start gap-2"><span className="text-stone-400 mt-0.5">-</span>Rivning av befintligt material (asfalt, betong, gamla stenar mm.)</li>
            <li className="flex items-start gap-2"><span className="text-stone-400 mt-0.5">-</span>Betongplattor och marksten</li>
            <li className="flex items-start gap-2"><span className="text-stone-400 mt-0.5">-</span>Små- och storgatsten</li>
            <li className="flex items-start gap-2"><span className="text-stone-400 mt-0.5">-</span>Granithällar och skifferplattor</li>
          </ul>
          <p className="text-xs text-stone-400 pt-1">
            Stenläggnings-material väljs och prissätts vid vårt kostnadsfria hembesök baserat på typ, färg och tillverkare.
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="flex flex-col items-center py-2">
        <p className="text-sm text-stone-400 mb-2">Se detaljerad uppdelning nedan</p>
        <div className="animate-bounce">
          <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Itemized Breakdown */}
      <QuoteItemsTable items={quote.items} />

      {/* Disclaimer */}
      <div className="rounded-xl border border-sand-200 bg-sand-50/50 p-5 flex gap-3">
        <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <div>
          <h3 className="font-display text-sm text-charcoal mb-1">{disclaimer.title}</h3>
          <p className="text-sm text-stone-500">{disclaimer.content}</p>
        </div>
      </div>

      {/* Consultation CTA */}
      <ConsultationCTA customerInfo={customerInfo} />

      {/* Next Steps */}
      <div className="rounded-xl border border-sand-200 bg-white p-5 flex gap-3">
        <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <div>
          <h3 className="font-display text-sm text-charcoal mb-2">Vad händer nu?</h3>
          <ul className="text-sm space-y-1.5 text-stone-500">
            <li>En kopia av denna offert har skickats till din e-post</li>
            <li>Vi kontaktar dig inom 24 timmar för att boka hembesök</li>
            <li>Hembesöket är kostnadsfritt och utan förpliktelser</li>
            <li>Vid hembesöket får du en bindande offert med exakta priser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
