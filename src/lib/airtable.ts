// Airtable integration for BKS Calculator

import Airtable from 'airtable';
import { PricingComponent, FormData, CustomerInfo, Quote, MaterialUsage } from './types';
import { Attribution } from './attribution';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!);

// Table references
const TABLES = {
  PRICING_CATALOG: 'tblljFfeR14VehcrS',
  LEAD_DATA: 'tbljQFgvpPqYK3S8O', 
  ESTIMATES: 'tbl8DsoZbTVbSMLTb',
  ESTIMATE_ITEMS: 'tblH45FhG3zGfHg8p',
  OFFER_COMPONENTS: 'tblyHVam347DcaPAP',
  RESOURCES: 'tblqZzeBYScNTwBuq'
} as const;

// Cache for pricing data (in production, use Redis)
let pricingCache: PricingComponent[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get hardcoded material data for components that need it
 * This replaces the expensive dynamic fetching for performance
 */
function getHardcodedMaterialData(componentName: string): MaterialUsage[] {
  const MATERIAL_DATA: Record<string, MaterialUsage[]> = {
    'Fyllning och justering av stenflis': [{
      material_name: 'Stenflis 2-5 mm',
      material_type: 'Stenflis',
      quantity_per_unit: 0.07
    }],
    'Anläggning och justering av bärlager vid trafikyta': [{
      material_name: 'Bärlager 0-32 mm',
      material_type: 'Bärlager',
      quantity_per_unit: 0.48
    }],
    'Anläggning och justering av bärlager vid gångar': [{
      material_name: 'Bärlager 0-16 mm',
      material_type: 'Bärlager', 
      quantity_per_unit: 0.08
    }]
  };

  return MATERIAL_DATA[componentName] || [];
}

/**
 * Get material usage information for a pricing component from Offer Components table
 * DEPRECATED: Replaced with hardcoded data for performance
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getMaterialUsageForComponent(componentId: string): Promise<MaterialUsage[]> {
  try {
    // First get the pricing component record to access the Components field
    const pricingComponent = await base(TABLES.PRICING_CATALOG).find(componentId);
    const componentLinks = pricingComponent.get('Components') as string[] | undefined;
    
    if (!componentLinks || componentLinks.length === 0) {
      return [];
    }

    const materialUsages: MaterialUsage[] = [];

    // Get offer components data for each linked component
    for (const offerComponentId of componentLinks) {
      try {
        const offerComponent = await base(TABLES.OFFER_COMPONENTS).find(offerComponentId);
        const resourceIds = offerComponent.get('Resource Name') as string[];
        const quantityPerUnit = offerComponent.get('Resource Quantity per Unit') as number;

        if (!resourceIds || !quantityPerUnit) continue;

        // Get resource information
        for (const resourceId of resourceIds) {
          try {
            const resource = await base(TABLES.RESOURCES).find(resourceId);
            const itemName = resource.get('Item Name') as string;
            
            if (itemName && (itemName.includes('Bärlager') || itemName.includes('Stenflis'))) {
              const materialType = itemName.includes('Bärlager') ? 'Bärlager' : 'Stenflis';
              materialUsages.push({
                material_name: itemName,
                material_type: materialType as 'Bärlager' | 'Stenflis',
                quantity_per_unit: quantityPerUnit
              });
            }
          } catch (resourceError) {
            console.warn(`Could not fetch resource ${resourceId}:`, resourceError);
          }
        }
      } catch (offerComponentError) {
        console.warn(`Could not fetch offer component ${offerComponentId}:`, offerComponentError);
      }
    }

    return materialUsages;
  } catch (error) {
    console.warn(`Error fetching material usage for component ${componentId}:`, error);
    return [];
  }
}

/**
 * Fetch pricing components from Airtable with caching
 */
export async function getPricingComponents(): Promise<PricingComponent[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (pricingCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('✓ Using cached pricing components');
    return pricingCache;
  }

  try {
    console.log('Fetching pricing components from Airtable...');
    const startFetch = Date.now();
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
          'labor_max',
          'Components'
        ]
      })
      .all();
    
    console.log(`✓ Pricing catalog records fetched in ${Date.now() - startFetch}ms (${records.length} records)`);

    const components: PricingComponent[] = [];
    const startProcessing = Date.now();
    
    for (const record of records) {
      const component: PricingComponent = {
        id: record.id,
        'Component Name': record.get('Component Name') as string,
        'Unit': record.get('Unit') as string,
        'Unit Price': record.get('Unit Price') as number,
        'Used in Automatic Calculator': record.get('Used in Automatic Calculator') as boolean,
        'Stage': record.get('Stage') as string,
        'labor_rate': record.get('labor_rate') as number,
        'labor_max': record.get('labor_max') as number,
      };

      // Add hardcoded material data for components that need it
      const materialData = getHardcodedMaterialData(component['Component Name']);
      if (materialData.length > 0) {
        component.materials_used = materialData;
        console.log(`✓ Added hardcoded materials for "${component['Component Name']}" (${materialData.length} materials)`);
      }

      components.push(component);
    }

    console.log(`✓ Components processed in ${Date.now() - startProcessing}ms`);
    console.log(`✓ Total getPricingComponents time: ${Date.now() - startFetch}ms`);

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
  customerInfo: CustomerInfo,
  attribution?: Attribution
): Promise<string> {
  try {
    const fields: Record<string, unknown> = {
      'Lead First Name': customerInfo.first_name,
      'Lead Last Name': customerInfo.last_name,
      'Lead Phone Number': customerInfo.phone,
      'Lead Email': customerInfo.email,
      'Full Address': customerInfo.address,
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
      'Email Sequence Stage': 1,
    };

    // Add attribution fields if present
    if (attribution?.gclid) fields['gclid'] = attribution.gclid;
    if (attribution?.utm_source) fields['utm_source'] = attribution.utm_source;
    if (attribution?.utm_medium) fields['utm_medium'] = attribution.utm_medium;
    if (attribution?.utm_campaign) fields['utm_campaign'] = attribution.utm_campaign;
    if (attribution?.utm_term) fields['utm_term'] = attribution.utm_term;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await base(TABLES.LEAD_DATA).create(fields as any);

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
    console.log('Fetching estimate for PDF:', estimateId);
    
    // Get estimate record
    const estimateRecord = await base(TABLES.ESTIMATES).find(estimateId);
    
    if (!estimateRecord) {
      throw new Error(`Estimate record not found: ${estimateId}`);
    }
    
    // Get linked lead data
    const leadIds = estimateRecord.get('Lead') as string[] | undefined;
    let leadData = null;
    let leadId = null;
    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      try {
        leadId = leadIds[0]; // Store the lead ID for later use
        const leadRecord = await base(TABLES.LEAD_DATA).find(leadId);
        leadData = {
          id: leadId, // Include the lead ID in the lead data
          first_name: (leadRecord.get('Lead First Name') as string) || '',
          last_name: (leadRecord.get('Lead Last Name') as string) || '',
          phone: (leadRecord.get('Lead Phone Number') as string) || '',
          email: (leadRecord.get('Lead Email') as string) || '',
          full_address: (leadRecord.get('Full Address') as string) || '',
          street_address: (leadRecord.get('Street Address') as string) || '',
          postal_code: (leadRecord.get('Postal Code') as string) || '',
          city: (leadRecord.get('City') as string) || ''
        };
      } catch (leadError) {
        console.warn('Error fetching lead data:', leadError);
        // Continue without lead data
      }
    }

    // Get estimate items
    const estimateItemIds = estimateRecord.get('Estimate_Items') as string[] | undefined;
    let estimateItems: Array<{
      id: string;
      description: string;
      quantity: number;
      unit: string;
      unit_price: number;
      line_total: number;
      arbetsmoment: string;
    }> = [];
    
    if (estimateItemIds && Array.isArray(estimateItemIds) && estimateItemIds.length > 0) {
      try {
        const itemRecords = await base(TABLES.ESTIMATE_ITEMS)
          .select({
            filterByFormula: `OR(${estimateItemIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
          })
          .all();

        estimateItems = itemRecords.map(record => ({
          id: record.id,
          description: (record.get('Item Description') as string) || '',
          quantity: (record.get('Quantity') as number) || 0,
          unit: (record.get('Unit') as string) || '',
          unit_price: (record.get('Unit Price') as number) || 0,
          line_total: (record.get('Line Total') as number) || 0,
          arbetsmoment: (record.get('Arbetsmoment') as string) || ''
        }));
      } catch (itemsError) {
        console.warn('Error fetching estimate items:', itemsError);
        // Continue with empty items array
      }
    }

    // Build estimate data with safe defaults
    const estimate = {
      id: estimateRecord.id,
      estimate_nr: (estimateRecord.get('estimate_nr') as number) || 0,
      status: (estimateRecord.get('Status') as string) || 'Draft',
      created: (estimateRecord.get('Created') as string) || new Date().toISOString(),
      valid_until: (estimateRecord.get('Valid Until') as string) || new Date().toISOString(),
      notes: (estimateRecord.get('Notes') as string) || '',
      total_amount: (estimateRecord.get('Total Amount') as number) || 0,
      total_amount_vat: (estimateRecord.get('Total Amount w VAT') as number) || 0,
      vat_amount: (estimateRecord.get('Moms') as number) || 0,
      estimated_work_days: (estimateRecord.get('estimated_work_days') as number) || 1,
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
 * Upload PDF directly to Airtable using the direct upload API
 */
export async function uploadPDFToAirtableEstimate(
  estimateId: string,
  pdfBuffer: Buffer,
  filename: string
): Promise<void> {
  try {
    console.log('=== Starting PDF Upload to Airtable ===');
    console.log('Upload details:', { 
      estimateId, 
      filename, 
      bufferSize: pdfBuffer.length,
      sizeKB: Math.round(pdfBuffer.length / 1024),
      baseId: process.env.AIRTABLE_BASE_ID,
      hasApiKey: !!process.env.AIRTABLE_API_KEY
    });
    
    // Check if PDF is too large for direct upload (5MB limit)
    if (pdfBuffer.length > 5 * 1024 * 1024) { // 5MB limit for direct upload
      throw new Error(`PDF too large for direct upload: ${pdfBuffer.length} bytes. Maximum is 5MB.`);
    }
    
    // Validate required environment variables
    if (!process.env.AIRTABLE_BASE_ID) {
      throw new Error('AIRTABLE_BASE_ID environment variable is missing');
    }
    if (!process.env.AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY environment variable is missing');
    }
    
    // Update PDF created date
    console.log('Updating pdf_created_date field...');
    console.log('Update request details:', {
      table: TABLES.ESTIMATES,
      estimateId,
      baseId: process.env.AIRTABLE_BASE_ID,
      timestamp: new Date().toISOString()
    });
    
    try {
      const updateResult = await base(TABLES.ESTIMATES).update(estimateId, {
        'pdf_created_date': new Date().toISOString()
      });
      console.log('PDF created date updated successfully:', {
        recordId: updateResult.id,
        success: true
      });
    } catch (updateError) {
      console.error('PDF created date update failed:', {
        error: updateError,
        message: updateError instanceof Error ? updateError.message : 'Unknown error',
        estimateId,
        table: TABLES.ESTIMATES
      });
      // Don't throw here, continue with PDF upload
    }

    // Prepare direct upload data
    const uploadData = {
      contentType: "application/pdf",
      file: pdfBuffer.toString('base64'),
      filename: filename
    };

    // Use Airtable's direct upload API
    const uploadUrl = `https://content.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${estimateId}/fldj1yYgAFldG0VmQ/uploadAttachment`;
    
    console.log('Uploading PDF directly to Airtable...');
    console.log('Upload request details:', {
      url: uploadUrl,
      method: 'POST',
      estimateId,
      filename,
      bufferSize: pdfBuffer.length,
      hasApiKey: !!process.env.AIRTABLE_API_KEY
    });
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadData)
    });

    console.log('Upload response details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url,
      redirected: response.redirected
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed - Response:', errorText);
      throw new Error(`Direct upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('=== PDF Upload Successful ===');
    console.log('Upload result:', { 
      success: true,
      attachmentId: result.fields?.pdf_attachment?.[0]?.id, 
      attachmentSize: result.fields?.pdf_attachment?.[0]?.size,
      attachmentUrl: result.fields?.pdf_attachment?.[0]?.url 
    });
    
    console.log(`=== PDF processing completed for estimate ${estimateId} ===`);
  } catch (error) {
    console.error('Error uploading PDF to Airtable:', error);
    
    // Fallback: Update notes with PDF info if direct upload fails
    try {
      const existingRecord = await base(TABLES.ESTIMATES).find(estimateId);
      const existingNotes = existingRecord.get('Notes') as string || '';
      const newNotes = existingNotes ? 
        `${existingNotes}\n\nPDF generering misslyckades: ${filename} (${(pdfBuffer.length / 1024).toFixed(1)} KB) - ${error instanceof Error ? error.message : 'Unknown error'}` :
        `PDF generering misslyckades: ${filename} (${(pdfBuffer.length / 1024).toFixed(1)} KB) - ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      await base(TABLES.ESTIMATES).update(estimateId, {
        'Notes': newNotes
      });
      console.log('Updated estimate with PDF error info in notes as fallback');
    } catch (fallbackError) {
      console.error('Fallback notes update also failed:', fallbackError);
    }
    
    throw new Error('Failed to upload PDF to Airtable');
  }
}

/**
 * Retry wrapper for uploadPDFToAirtableEstimate
 */
export async function uploadPDFToAirtableEstimateWithRetry(
  estimateId: string,
  pdfBuffer: Buffer,
  filename: string,
  maxRetries: number = 2
): Promise<void> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await uploadPDFToAirtableEstimate(estimateId, pdfBuffer, filename);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Airtable upload attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error('Airtable upload failed after all retries');
}

/**
 * Append a note with timestamp to the Notes field on an Estimate record
 */
export async function appendEstimateNote(
  estimateId: string,
  note: string
): Promise<void> {
  try {
    const record = await base(TABLES.ESTIMATES).find(estimateId);
    const existingNotes = (record.get('Notes') as string) || '';
    const timestamp = new Date().toISOString();
    await base(TABLES.ESTIMATES).update(estimateId, {
      'Notes': existingNotes
        ? `${existingNotes}\n\n[${timestamp}] ${note}`
        : `[${timestamp}] ${note}`
    });
  } catch (error) {
    console.error('Failed to append estimate note:', error);
  }
}

/**
 * Find Estimates without PDF attachment (status=Automat, created in last 7 days)
 */
export async function getEstimatesWithoutPDF(): Promise<Array<{
  id: string;
  estimateNr: number;
  leadIds: string[];
}>> {
  try {
    const records = await base(TABLES.ESTIMATES)
      .select({
        filterByFormula: `AND(
          {Status} = 'Automat',
          {pdf_created_date} = '',
          DATETIME_DIFF(NOW(), {Created}, 'days') <= 7
        )`,
        fields: ['Status', 'Lead', 'Estimate Nr', 'Created', 'Notes'],
        maxRecords: 20
      })
      .all();

    return records.map(record => ({
      id: record.id,
      estimateNr: (record.get('Estimate Nr') as number) || 0,
      leadIds: (record.get('Lead') as string[]) || [],
    }));
  } catch (error) {
    console.error('Error fetching estimates without PDF:', error);
    return [];
  }
}

/**
 * Update the Booking Status field on a Lead_Data record
 */
export async function updateLeadBookingStatus(
  leadId: string,
  status: 'Link Clicked' | 'Booked' | 'Completed'
): Promise<void> {
  try {
    await base(TABLES.LEAD_DATA).update(leadId, {
      'Booking Status': status,
    });
    console.log(`Booking status updated to "${status}" for lead:`, leadId);
  } catch (error) {
    console.error('Error updating booking status:', error);
  }
}

/**
 * Update the Email Sequence Stage field on a Lead_Data record
 */
export async function updateLeadEmailStage(
  leadId: string,
  stage: number
): Promise<void> {
  try {
    await base(TABLES.LEAD_DATA).update(leadId, {
      'Email Sequence Stage': stage,
    });
  } catch (error) {
    console.error('Error updating email stage:', error);
  }
}

/**
 * Set Last Email Sent on a lead record. Called only after a real email
 * is dispatched (initial offer, retry, or follow-up), so follow-up cron
 * never runs before the offer actually lands in the inbox.
 */
export async function setLeadLastEmailSent(leadId: string): Promise<void> {
  try {
    await base(TABLES.LEAD_DATA).update(leadId, {
      'Last Email Sent': new Date().toISOString(),
    });
    console.log('Last Email Sent set for lead:', leadId);
  } catch (error) {
    console.error('Error setting Last Email Sent:', error);
  }
}

/**
 * Upserts a lead by email. If a lead with this email exists within the last
 * `windowDays` AND is not already booked (Stage != 99), updates that record
 * in place instead of creating a duplicate. Otherwise creates a new lead.
 *
 * Rationale: users often re-submit the form to compare variants (different
 * material, size, etc.). We want them to receive a fresh quote each time —
 * but with one Airtable record, one nurture sequence, and no duplicate mail.
 *
 * - Form and personal fields are overwritten with the latest submission.
 * - Email Sequence Stage resets to 1 (new quote deserves fresh nurture).
 * - Last Email Sent is cleared so the follow-up cron doesn't fire from an
 *   old timestamp — it gets set again by updateLeadSentMessages after the
 *   new offer actually ships.
 * - Lead Status and Booking Status are NOT touched (manual progression).
 * - Sent Messages is NOT touched (preserves history).
 * - Booked leads (Stage 99) are treated as a new inquiry → new lead.
 */
export async function upsertLeadByEmail(
  formData: FormData,
  customerInfo: CustomerInfo,
  attribution?: Attribution,
  windowDays = 30
): Promise<{ id: string; isUpdate: boolean }> {
  try {
    const escapedEmail = customerInfo.email.toLowerCase().replace(/"/g, '\\"');
    const existing = await base(TABLES.LEAD_DATA)
      .select({
        filterByFormula: `AND(
          LOWER({Lead Email}) = "${escapedEmail}",
          DATETIME_DIFF(NOW(), CREATED_TIME(), 'days') <= ${windowDays},
          OR({Email Sequence Stage} != 99, {Email Sequence Stage} = BLANK())
        )`,
        maxRecords: 1,
        sort: [{ field: 'Last Email Sent', direction: 'desc' }],
        fields: ['Lead Email', 'Email Sequence Stage'],
      })
      .firstPage();

    if (existing.length === 0) {
      const id = await createLead(formData, customerInfo, attribution);
      return { id, isUpdate: false };
    }

    const leadRecord = existing[0];
    const updateFields: Record<string, unknown> = {
      'Lead First Name': customerInfo.first_name,
      'Lead Last Name': customerInfo.last_name,
      'Lead Phone Number': customerInfo.phone,
      'Full Address': customerInfo.address,
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
      'Email Sequence Stage': 1,
      'Last Email Sent': null,
    };
    if (attribution?.gclid) updateFields['gclid'] = attribution.gclid;
    if (attribution?.utm_source) updateFields['utm_source'] = attribution.utm_source;
    if (attribution?.utm_medium) updateFields['utm_medium'] = attribution.utm_medium;
    if (attribution?.utm_campaign) updateFields['utm_campaign'] = attribution.utm_campaign;
    if (attribution?.utm_term) updateFields['utm_term'] = attribution.utm_term;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await base(TABLES.LEAD_DATA).update(leadRecord.id, updateFields as any);
    return { id: leadRecord.id, isUpdate: true };
  } catch (error) {
    console.error('Error in upsertLeadByEmail:', error);
    throw new Error('Failed to upsert lead record');
  }
}

/**
 * Get leads that need a follow-up email at a given stage
 */
export async function getLeadsNeedingFollowUp(
  stage: number,
  minHoursSinceLastEmail: number
): Promise<Array<{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  bookingStatus: string | null;
}>> {
  try {
    // Find leads at the given email stage that:
    // 1. Haven't booked yet
    // 2. Had their last email sent at least N hours ago
    const records = await base(TABLES.LEAD_DATA)
      .select({
        filterByFormula: `AND(
          {Email Sequence Stage} = ${stage},
          {Lead Status} = '10 - 🤖 Automatic Proposal',
          OR({Booking Status} = '', {Booking Status} = 'Link Clicked'),
          {Last Email Sent} != '',
          DATETIME_DIFF(NOW(), {Last Email Sent}, 'hours') >= ${minHoursSinceLastEmail}
        )`,
        fields: [
          'Lead Email',
          'Lead First Name',
          'Lead Last Name',
          'Lead Phone Number',
          'Booking Status',
        ],
      })
      .all();

    return records.map(record => ({
      id: record.id,
      email: (record.get('Lead Email') as string) || '',
      firstName: (record.get('Lead First Name') as string) || '',
      lastName: (record.get('Lead Last Name') as string) || '',
      phone: (record.get('Lead Phone Number') as string) || '',
      bookingStatus: (record.get('Booking Status') as string) || null,
    }));
  } catch (error) {
    console.error('Error fetching leads for follow-up:', error);
    return [];
  }
}

/**
 * Fetch lead data for URL shortener redirect (/l/[leadId])
 */
export async function getLeadForRedirect(leadId: string): Promise<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
} | null> {
  try {
    const record = await base(TABLES.LEAD_DATA).find(leadId);
    return {
      id: record.id,
      firstName: (record.get('Lead First Name') as string) || '',
      lastName: (record.get('Lead Last Name') as string) || '',
      email: (record.get('Lead Email') as string) || '',
      phone: (record.get('Lead Phone Number') as string) || '',
    };
  } catch (error) {
    console.error('[getLeadForRedirect] Error fetching lead:', error);
    return null;
  }
}

/**
 * Find a lead by email address (newest first)
 */
export async function findLeadByEmail(email: string): Promise<string | null> {
  try {
    const records = await base(TABLES.LEAD_DATA)
      .select({
        filterByFormula: `{Lead Email} = '${email.replace(/'/g, "\\'")}'`,
        fields: ['Lead Email'],
        sort: [{ field: 'Created', direction: 'desc' }],
        maxRecords: 1,
      })
      .all();

    return records.length > 0 ? records[0].id : null;
  } catch (error) {
    console.error('Error finding lead by email:', error);
    return null;
  }
}

/**
 * Update the Lead Status field on a Lead_Data record
 */
export async function updateLeadStatus(leadId: string, status: string): Promise<void> {
  try {
    await base(TABLES.LEAD_DATA).update(leadId, {
      'Lead Status': status,
    });
    console.log(`Lead status updated to "${status}" for lead:`, leadId);
  } catch (error) {
    console.error('Error updating lead status:', error);
  }
}

export async function updateLeadSentMessages(
  leadId: string,
  emailSubject: string,
  recipientEmail: string,
  messageId?: string,
  pdfAttached: boolean = false,
  bodyText?: string
): Promise<void> {
  try {
    console.log('Updating sent messages for lead:', leadId);

    // Get current sent messages
    const leadRecord = await base(TABLES.LEAD_DATA).find(leadId);
    const existingSentMessages = (leadRecord.get('Sent Messages') as string) || '';

    // Create new message entry
    const timestamp = new Date().toLocaleString('sv-SE', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const bodySection = bodyText ? `\n${bodyText}\n` : '';
    const newMessage = `
### ${emailSubject}
**Skickat:** ${timestamp}
**Till:** ${recipientEmail}
**PDF bifogad:** ${pdfAttached ? 'Ja' : 'Nej'}
${messageId ? `**Message ID:** ${messageId}` : ''}
${bodySection}
---
`;

    // Combine with existing messages
    const updatedSentMessages = existingSentMessages ?
      `${newMessage}${existingSentMessages}` :
      newMessage;

    // Update both Sent Messages and Last Email Sent fields
    await base(TABLES.LEAD_DATA).update(leadId, {
      'Sent Messages': updatedSentMessages,
      'Last Email Sent': new Date().toISOString()
    });

    console.log('Successfully updated sent messages for lead:', leadId);
  } catch (error) {
    console.error('Error updating sent messages:', error);
    // Don't throw error - this shouldn't break the email sending process
    console.log('Continuing despite sent messages update failure');
  }
}

