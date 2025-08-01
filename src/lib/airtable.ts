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
      'Lead Status': '10 - 🤖 Automatic Proposal'
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
      'Notes': `Automatisk offert genererad från kalkylator - ${formData.materialval} - ${formData.area}m²`
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
/**
 * Map internal category names to Airtable Arbetsmoment options
 */
function mapCategoryToArbetsmoment(category: string): string {
  const categoryMap: Record<string, string> = {
    'Maskinflytt': '10 - Maskinflytt och etablering',
    'Schakt': '20 - Schakt',
    'Underarbete': '30 - Underarbete',
    'Stenläggning': '50 - Stenläggning',
    'Fogning': '70 - Fogning',
    'Bortforsling': '99 - Bortforsling av byggavfall och städning'
  };
  
  return categoryMap[category] || category;
}

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
        fields: {
          'Estimate': [estimateId],
          'Pricing Component': pricingComponent ? [pricingComponent.id] : [],
          'Quantity': item.quantity,
          'Unit Price': item.unit_price_sek,
          'Unit': item.unit,
          'Arbetsmoment': mapCategoryToArbetsmoment(item.category)
        }
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

/**
 * Get complete estimate data with items and lead info for PDF generation
 */
export async function getEstimateForPDF(estimateId: string) {
  try {
    // Get estimate record
    const estimateRecord = await base(TABLES.ESTIMATES).find(estimateId);
    
    // Get linked lead data
    const leadIds = estimateRecord.get('Lead') as string[];
    let leadData = null;
    if (leadIds && leadIds.length > 0) {
      const leadRecord = await base(TABLES.LEAD_DATA).find(leadIds[0]);
      leadData = {
        first_name: leadRecord.get('Lead First Name') as string,
        last_name: leadRecord.get('Lead Last Name') as string,
        phone: leadRecord.get('Lead Phone Number') as string,
        email: leadRecord.get('Lead Email') as string,
        full_address: leadRecord.get('Full Address') as string,
        street_address: leadRecord.get('Street Address') as string,
        postal_code: leadRecord.get('Postal Code') as string,
        city: leadRecord.get('City') as string
      };
    }

    // Get estimate items
    const estimateItemIds = estimateRecord.get('Estimate_Items') as string[];
    let estimateItems: Array<{
      id: string;
      description: string;
      quantity: number;
      unit: string;
      unit_price: number;
      line_total: number;
      arbetsmoment: string;
    }> = [];
    
    if (estimateItemIds && estimateItemIds.length > 0) {
      const itemRecords = await base(TABLES.ESTIMATE_ITEMS)
        .select({
          filterByFormula: `OR(${estimateItemIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
        })
        .all();

      estimateItems = itemRecords.map(record => ({
        id: record.id,
        description: record.get('Item Description') as string,
        quantity: record.get('Quantity') as number,
        unit: record.get('Unit') as string,
        unit_price: record.get('Unit Price') as number,
        line_total: record.get('Line Total') as number,
        arbetsmoment: record.get('Arbetsmoment') as string
      }));
    }

    // Build estimate data
    const estimate = {
      id: estimateRecord.id,
      estimate_nr: estimateRecord.get('estimate_nr') as number,
      status: estimateRecord.get('Status') as string,
      created: estimateRecord.get('Created') as string,
      valid_until: estimateRecord.get('Valid Until') as string,
      notes: estimateRecord.get('Notes') as string,
      total_amount: estimateRecord.get('Total Amount') as number,
      total_amount_vat: estimateRecord.get('Total Amount w VAT') as number,
      vat_amount: estimateRecord.get('Moms') as number,
      estimated_work_days: estimateRecord.get('estimated_work_days') as number,
      items: estimateItems,
      lead: leadData
    };

    return estimate;
  } catch (error) {
    console.error('Error fetching estimate for PDF:', error);
    throw new Error('Failed to fetch estimate data');
  }
}

/**
 * Upload PDF to Airtable as attachment and update estimate record
 */
export async function uploadPDFToAirtableEstimate(
  estimateId: string,
  pdfBuffer: Buffer,
  filename: string
): Promise<void> {
  try {
    // Convert buffer to base64 (required by Airtable API)
    const base64Data = pdfBuffer.toString('base64');
    
    // Create attachment object for Airtable - using partial type to avoid ID requirement
    const attachment: Partial<{
      id: string;
      filename: string;
      type: string;
      size: number;
      url: string;
    }> = {
      filename: filename,
      type: 'application/pdf',
      size: pdfBuffer.length,
      url: `data:application/pdf;base64,${base64Data}`
    };

    // First update with PDF created date
    await base(TABLES.ESTIMATES).update(estimateId, {
      'pdf_created_date': new Date().toISOString()
    });

    // Then update with attachment using a more permissive approach
    const updateFields: Record<string, unknown> = {
      'pdf_attachment': [attachment]
    };
    
    // @ts-expect-error - Bypassing TypeScript for Airtable attachment upload
    await base(TABLES.ESTIMATES).update(estimateId, updateFields);

    console.log(`PDF successfully uploaded to estimate ${estimateId}`);
  } catch (error) {
    console.error('Error uploading PDF to Airtable:', error);
    throw new Error('Failed to upload PDF to Airtable');
  }
}