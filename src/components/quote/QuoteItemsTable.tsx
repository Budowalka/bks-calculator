import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuoteItem } from '@/lib/types';
import { 
  groupQuoteItemsByCategory, 
  getCategoryDisplayName, 
  formatCurrency, 
  formatQuantityWithUnit 
} from '@/lib/quote-utils';

interface QuoteItemsTableProps {
  items: QuoteItem[];
}

export function QuoteItemsTable({ items }: QuoteItemsTableProps) {
  const groupedItems = groupQuoteItemsByCategory(items);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detaljerad uppdelning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="border-b border-border pb-2">
              <h3 className="font-semibold text-foreground">
                {getCategoryDisplayName(category)}
              </h3>
            </div>

            {/* Category Items */}
            <div className="space-y-2">
              {categoryItems.map((item, index) => (
                <div 
                  key={`${category}-${index}`}
                  className="flex justify-between items-start gap-4 py-2 border-b border-border/50 last:border-b-0"
                >
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatQuantityWithUnit(item.quantity, item.unit)} × {formatCurrency(item.unit_price_sek)}
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {formatCurrency(item.total_sek)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Subtotal */}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="font-medium text-sm text-muted-foreground">
                Delsumma {getCategoryDisplayName(category).toLowerCase()}:
              </span>
              <span className="font-semibold text-sm">
                {formatCurrency(
                  categoryItems.reduce((sum, item) => sum + item.total_sek, 0)
                )}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}