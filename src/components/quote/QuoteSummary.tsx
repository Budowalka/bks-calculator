import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote } from '@/lib/types';
import { formatCurrency, getWorkTimelineDescription } from '@/lib/quote-utils';
import { CalendarDays, Clock, CheckCircle } from 'lucide-react';

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
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <CheckCircle className="w-5 h-5" />
          Preliminär offert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Totalt exkl. moms:</span>
            <span className="font-medium">{formatCurrency(quote.total_sek)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Moms (25%):</span>
            <span className="font-medium">{formatCurrency(quote.total_sek_with_vat - quote.total_sek)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Totalt inkl. moms:</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(quote.total_sek_with_vat)}</span>
            </div>
          </div>
        </div>

        {/* Timeline and Validity */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Beräknad tid:</span>
            <Badge variant="secondary" className="font-medium">
              {getWorkTimelineDescription(quote.estimated_days)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Gäller till:</span>
            <span className="font-medium">{validUntilDate}</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}