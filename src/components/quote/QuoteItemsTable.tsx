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
    <div className="rounded-xl border border-sand-200 bg-white overflow-hidden">
      <div className="px-6 py-5 border-b border-sand-200">
        <h2 className="font-display text-xl text-charcoal">Detaljerad uppdelning</h2>
      </div>

      <div className="divide-y divide-sand-100">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="px-6 py-5 space-y-3">
            {/* Category Header */}
            <h3 className="font-display text-base text-charcoal">
              {getCategoryDisplayName(category)}
            </h3>

            {/* Category Items */}
            <div className="space-y-2">
              {categoryItems.map((item, index) => (
                <div
                  key={`${category}-${index}`}
                  className="flex justify-between items-start gap-4 py-1.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-charcoal">
                      {item.name}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {formatQuantityWithUnit(item.quantity, item.unit)} x {formatCurrency(item.unit_price_sek)}
                    </div>
                  </div>
                  <div className="text-sm text-charcoal font-medium">
                    {formatCurrency(item.total_sek)}
                  </div>
                </div>
              ))}
            </div>

            {/* Category Subtotal */}
            <div className="flex justify-between items-center pt-2 border-t border-sand-100">
              <span className="text-sm text-stone-400">
                Delsumma {getCategoryDisplayName(category).toLowerCase()}
              </span>
              <span className="text-sm text-charcoal font-semibold">
                {formatCurrency(
                  categoryItems.reduce((sum, item) => sum + item.total_sek, 0)
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
