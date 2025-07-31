// Airtable integration for BKS Calculator

import Airtable from 'airtable';
import { PricingComponent, FormData, CustomerInfo, Quote } from './types';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!);

// Table references
const TABLES = {
  PRICING_CATALOG: 'tblljFfeR14VehcrS',
  LEAD_DATA: 'tbljQFgvpPqYK3S8O', 
  ESTIMATES: 'tbl8DsoZbTVbSMLTb',
  ESTIMATE_ITEMS: 'tblH45FhG3zGfHg8p'
} as const;

// Cache for pricing data (in production, use Redis)
let pricingCache: PricingComponent[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch pricing components from Airtable with caching
 */
export async function getPricingComponents(): Promise<PricingComponent[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (pricingCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return pricingCache;
  }

  try {
    const records = await base(TABLES.PRICING_CATALOG)
      .select({
        filterByFormula: '{Used in Automatic Calculator} = TRUE()',
        fields: [
          'Component Name',
          'Unit', 
          'Unit Price',
          'Used in Automatic Calculator',
          'Stage',
          'labor_rate',
          'labor_max'
        ]
      })
      .all();

    const components: PricingComponent[] = records.map(record => ({
      id: record.id,
      'Component Name': record.get('Component Name') as string,
      'Unit': record.get('Unit') as string,
      'Unit Price': record.get('Unit Price') as number,
      'Used in Automatic Calculator': record.get('Used in Automatic Calculator') as boolean,
      'Stage': record.get('Stage') as string,
      'labor_rate': record.get('labor_rate') as number,
      'labor_max': record.get('labor_max') as number,
    }));

    // Update cache
    pricingCache = components;
    cacheTimestamp = now;

    return components;
  } catch (error) {
    console.error('Error fetching pricing components:', error);
    throw new Error('Failed to fetch pricing data');
  }
}

/**
 * Create a lead record in Airtable
 */
export async function createLead(
  formData: FormData, 
  customerInfo: CustomerInfo
): Promise<string> {
  try {
    const record = await base(TABLES.LEAD_DATA).create({
      'Lead First Name': customerInfo.first_name,
      'Lead Last Name': customerInfo.last_name,  
      'Lead Phone Number': customerInfo.phone,
      'Lead Email': customerInfo.email,
      'materialval': formData.materialval,
      'area': formData.area,
      'forberedelse': formData.forberedelse,
      'anvandning': formData.anvandning,
      'fog': formData.fog,
      'kantsten_need': formData.kantsten_need,
      'kantsten-langd': formData.kantsten_langd || null,
      'materialval-kantsten': formData.materialval_kantsten || null,
      'maskin-plats': formData.plats_maskin || null,
      'plats-kranbil': formData.plats_kranbil,
      'Lead Status': '10 - 🤖 Automatic Proposal',
      'Submission Date': new Date().toISOString()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (record as any).id;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new Error('Failed to create lead record');
  }
}

/**
 * Create an estimate record in Airtable
 */
export async function createEstimate(
  leadId: string,
  quote: Quote,
  formData: FormData
): Promise<string> {
  try {
    const record = await base(TABLES.ESTIMATES).create({
      'Lead': [leadId],
      'Status': 'Automat',
      'Estimate Title': `Automatoffert - ${formData.materialval} - ${formData.area}m²`,
      'Notes': `Automatisk offert genererad från kalkylator`,
      'Total Amount': quote.total_sek,
      'Total Amount w VAT': quote.total_sek_with_vat,
      'Moms': 25, // 25% VAT
      'estimated_work_days': quote.estimated_days,
      'Valid Until': quote.valid_until,
      'estimate_nr': quote.quote_id
    });

    return record.id;
  } catch (error) {
    console.error('Error creating estimate:', error);
    throw new Error('Failed to create estimate record');
  }
}

/**
 * Create estimate items in Airtable
 */
export async function createEstimateItems(
  estimateId: string,
  quote: Quote,
  pricingComponents: PricingComponent[]
): Promise<void> {
  try {
    const estimateItems = quote.items.map(item => {
      // Find the pricing component to get additional data
      const pricingComponent = pricingComponents.find(
        pc => pc['Component Name'] === item.name
      );

      return {
        'Estimate': [estimateId],
        'Item Description': item.name,
        'Quantity': item.quantity,
        'Unit Price': item.unit_price_sek,
        'Unit': item.unit,
        'Line Total': item.total_sek,
        'Arbetsmoment': item.category,
        'Labor Rate': pricingComponent?.labor_rate || null,
        'labor_max': pricingComponent?.labor_max || null,
        'Pricing Component': pricingComponent ? [pricingComponent.id] : []
      };
    });

    // Create records in batches (Airtable allows max 10 per batch)
    const batchSize = 10;
    for (let i = 0; i < estimateItems.length; i += batchSize) {
      const batch = estimateItems.slice(i, i + batchSize);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await base(TABLES.ESTIMATE_ITEMS).create(batch as any);
    }
  } catch (error) {
    console.error('Error creating estimate items:', error);
    throw new Error('Failed to create estimate items');
  }
}

/**
 * Find pricing component by name
 */
export function findPricingComponent(
  components: PricingComponent[], 
  name: string
): PricingComponent | undefined {
  return components.find(component => 
    component['Component Name'] === name
  );
}

/**
 * Generate a unique quote ID
 */
export function generateQuoteId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getHours()).padStart(2, '0') + 
               String(date.getMinutes()).padStart(2, '0');
  
  return `BKS-${year}${month}${day}-${time}`;
}

/**
 * Calculate quote validity date (30 days from now)
 */
export function getValidUntilDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}