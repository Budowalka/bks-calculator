// Airtable integration for BKS Calculator

import Airtable from 'airtable';
import { PricingComponent, FormData, CustomerInfo, Quote, MaterialUsage } from './types';

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
 * Get material usage information for a pricing component from Offer Components table
 */
async function getMaterialUsageForComponent(componentId: string): Promise<MaterialUsage[]> {
  try {
    const offerComponents = await base(TABLES.OFFER_COMPONENTS)
      .select({
        filterByFormula: `{Offer Component} = "${componentId}"`,
        fields: ['Resource Name', 'Resource Quantity per Unit']
      })
      .all();

    const materialUsages: MaterialUsage[] = [];

    for (const offerComp of offerComponents) {
      const resourceIds = offerComp.get('Resource Name') as string[];
      const quantityPerUnit = offerComp.get('Resource Quantity per Unit') as number;

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

    const components: PricingComponent[] = [];
    
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

      // Fetch material usage information for this component
      try {
        const materialUsages = await getMaterialUsageForComponent(record.id);
        if (materialUsages.length > 0) {
          component.materials_used = materialUsages;
        }
      } catch (error) {
        console.warn(`Failed to fetch materials for component ${component['Component Name']}:`, error);
      }

      components.push(component);
    }

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
    console.log('Uploading PDF directly to Airtable:', { estimateId, filename, bufferSize: pdfBuffer.length });
    
    // Check if PDF is too large for direct upload (5MB limit)
    if (pdfBuffer.length > 5 * 1024 * 1024) { // 5MB limit for direct upload
      throw new Error(`PDF too large for direct upload: ${pdfBuffer.length} bytes. Maximum is 5MB.`);
    }
    
    // Update PDF created date
    console.log('Updating pdf_created_date field...');
    await base(TABLES.ESTIMATES).update(estimateId, {
      'pdf_created_date': new Date().toISOString()
    });
    console.log('PDF created date updated successfully');

    // Prepare direct upload data
    const uploadData = {
      contentType: "application/pdf",
      file: pdfBuffer.toString('base64'),
      filename: filename
    };

    // Use Airtable's direct upload API
    const uploadUrl = `https://content.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${estimateId}/fldj1yYgAFldG0VmQ/uploadAttachment`;
    
    console.log('Uploading PDF directly to Airtable...');
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Direct upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('PDF uploaded successfully via direct upload API');
    console.log('Upload result:', { attachmentId: result.fields?.pdf_attachment?.[0]?.id, size: result.fields?.pdf_attachment?.[0]?.size });
    
    console.log(`PDF processing completed for estimate ${estimateId}`);
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
 * Update the Sent Messages field in Lead_Data table
 */
export async function updateLeadSentMessages(
  leadId: string,
  emailSubject: string,
  recipientEmail: string,
  messageId?: string,
  pdfAttached: boolean = false
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
    
    const newMessage = `
### ${emailSubject}
**Skickat:** ${timestamp}
**Till:** ${recipientEmail}
**PDF bifogad:** ${pdfAttached ? 'Ja' : 'Nej'}
${messageId ? `**Message ID:** ${messageId}` : ''}

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

