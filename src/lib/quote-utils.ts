// Quote display utilities for category ordering and formatting

import { QuoteItem } from './types';

// Category order mapping based on Airtable stage numbers
export const CATEGORY_ORDER = [
  'Maskinflytt',
  'Schakt', 
  'Underarbete',
  'Stenläggning',
  'Kantsten',
  'Fogning',
  'Bortforsling'
] as const;

// Display names for categories (without numbers)
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'Maskinflytt': 'Maskinflytt och etablering',
  'Schakt': 'Schakt',
  'Underarbete': 'Underarbete', 
  'Stenläggning': 'Stenläggning',
  'Kantsten': 'Kantsten',
  'Fogning': 'Fogning',
  'Bortforsling': 'Bortforsling av byggavfall och städning'
};

// Get category order index for sorting
function getCategoryOrderIndex(category: string): number {
  const index = CATEGORY_ORDER.indexOf(category as any);
  return index === -1 ? 999 : index;
}

// Sort quote items by category order
export function sortQuoteItemsByCategory(items: QuoteItem[]): QuoteItem[] {
  return [...items].sort((a, b) => {
    const aOrder = getCategoryOrderIndex(a.category);
    const bOrder = getCategoryOrderIndex(b.category);
    return aOrder - bOrder;
  });
}

// Group quote items by category in correct order
export function groupQuoteItemsByCategory(items: QuoteItem[]): Record<string, QuoteItem[]> {
  const sortedItems = sortQuoteItemsByCategory(items);
  const grouped: Record<string, QuoteItem[]> = {};
  
  sortedItems.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });
  
  return grouped;
}

// Get display name for category
export function getCategoryDisplayName(category: string): string {
  return CATEGORY_DISPLAY_NAMES[category] || category;
}

// Format currency in Swedish Kronor
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format quantity with unit
export function formatQuantityWithUnit(quantity: number, unit: string): string {
  // Handle decimal quantities
  const formattedQuantity = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
  return `${formattedQuantity} ${unit}`;
}

// Calculate estimated work timeline description
export function getWorkTimelineDescription(estimatedDays: number): string {
  if (estimatedDays <= 1) {
    return '1 dag';
  } else if (estimatedDays <= 3) {
    return `${estimatedDays} dagar`;
  } else if (estimatedDays <= 5) {
    return `${estimatedDays} dagar (1 vecka)`;
  } else {
    const weeks = Math.ceil(estimatedDays / 5);
    return `${estimatedDays} dagar (${weeks} ${weeks === 1 ? 'vecka' : 'veckor'})`;
  }
}