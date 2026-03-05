import { Quote } from '@/lib/types';
import { formatCurrency, getWorkTimelineDescription } from '@/lib/quote-utils';
import { CalendarDays, Clock } from 'lucide-react';

interface QuoteSummaryProps {
  quote: Quote;
}

export function QuoteSummary({ quote }: QuoteSummaryProps) {
  const validUntilDate = new Date(quote.valid_until).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="rounded-xl border border-sand-200 bg-white p-6 md:p-8 space-y-6">
      <h2 className="font-display text-xl text-charcoal">Preliminär offert</h2>

      {/* Price Summary */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-stone-500 text-sm">Totalt exkl. moms</span>
          <span className="text-charcoal">{formatCurrency(quote.total_sek)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-stone-500 text-sm">Moms (25%)</span>
          <span className="text-charcoal">{formatCurrency(quote.total_sek_with_vat - quote.total_sek)}</span>
        </div>
        <div className="border-t border-sand-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-display text-lg text-charcoal">Totalt inkl. moms</span>
            <span className="font-display text-2xl md:text-3xl text-gold">{formatCurrency(quote.total_sek_with_vat)}</span>
          </div>
        </div>
      </div>

      {/* Timeline and Validity */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-sand-100">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gold" />
          <span className="text-stone-500">Beräknad tid:</span>
          <span className="text-charcoal font-medium">
            {getWorkTimelineDescription(quote.estimated_days)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="w-4 h-4 text-gold" />
          <span className="text-stone-500">Gäller till:</span>
          <span className="text-charcoal font-medium">{validUntilDate}</span>
        </div>
      </div>
    </div>
  );
}
