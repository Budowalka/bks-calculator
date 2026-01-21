import { NextRequest, NextResponse } from 'next/server';
import { BKSCalculator } from '@/lib/calculator';
import { createLead, createEstimate, createEstimateItems, getPricingComponents, getEstimateForPDF, uploadPDFToAirtableEstimate, updateLeadSentMessages } from '@/lib/airtable';
import { FormData, CustomerInfo, QuoteResponse } from '@/lib/types';
import { generatePreviewPDF, generatePreviewPDFFilename } from '@/lib/preview-pdf-generator';
import { sendQuoteEmail, validateEmailConfig } from '@/lib/email-service';
import { sendQuoteConfirmationSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { formData }: { formData: FormData } = body;

    // Validate required fields
    if (!formData) {
      return NextResponse.json(
        { success: false, error: 'Missing form data' },
        { status: 400 }
      );
    }

    // Validate required form fields
    const requiredFields = ['materialval', 'area', 'forberedelse', 'anvandning', 'fog', 'kantsten_need'];
    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate customer contact info (collected in form)
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer information' },
        { status: 400 }
      );
    }

    // Parse customer name into first_name and last_name
    const nameParts = formData.name.trim().split(' ');
    const customerInfo: CustomerInfo = {
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' ') || nameParts[0], // Use first name as last name if only one name provided
      email: formData.email,
      phone: formData.phone,
      address: formData.address
    };

    // Get pricing components from Airtable
    console.log('=== Starting Airtable Operations ===');
    const startPricing = Date.now();
    const pricingComponents = await getPricingComponents();
    console.log(`✓ Pricing components fetched in ${Date.now() - startPricing}ms`);
    
    // Initialize calculator and generate quote
    const startCalc = Date.now();
    const calculator = new BKSCalculator(pricingComponents);
    const quote = calculator.calculateQuote(formData);
    console.log(`✓ Quote calculated in ${Date.now() - startCalc}ms`);

    // Create lead record in Airtable
    const startLead = Date.now();
    const leadId = await createLead(formData, customerInfo);
    console.log(`✓ Lead created in ${Date.now() - startLead}ms (ID: ${leadId})`);
    
    // Create estimate record in Airtable
    const startEstimate = Date.now();
    const estimateId = await createEstimate(leadId, quote, formData);
    console.log(`✓ Estimate created in ${Date.now() - startEstimate}ms (ID: ${estimateId})`);
    
    // Create estimate items in Airtable
    const startItems = Date.now();
    await createEstimateItems(estimateId, quote, pricingComponents);
    console.log(`✓ Estimate items created in ${Date.now() - startItems}ms (${quote.items.length} items)`);
    
    const totalAirtableTime = Date.now() - startPricing;
    console.log(`=== Total Airtable Operations: ${totalAirtableTime}ms ===`);

    // Synchronous PDF and Email Generation - Complete before responding to user
    console.log('Starting synchronous PDF and email generation for estimate:', estimateId);
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log('Environment details:', {
      isDevelopment,
      nodeEnv: process.env.NODE_ENV,
      estimateId
    });
    
    try {
      // Validate email configuration first
      console.log('Validating email configuration...');
      const emailValidation = validateEmailConfig();
      if (!emailValidation.valid) {
        throw new Error(`Email configuration is invalid: ${emailValidation.errors.join(', ')}`);
      }
      
      // Fetch estimate data for both PDF and email
      console.log('Fetching estimate data...');
      const estimate = await getEstimateForPDF(estimateId);
      
      if (!estimate) {
        throw new Error('Estimate not found for PDF generation and email sending');
      }
      
      if (estimate.status !== 'Automat') {
        throw new Error(`PDF and email can only be generated for automatic estimates (status: Automat), got: ${estimate.status}`);
      }
      
      if (!estimate.lead?.email) {
        throw new Error('No customer email address found in estimate data');
      }
      
      console.log('Starting PDF generation...');
      
      // Add delay in development to avoid interference
      if (isDevelopment) {
        console.log('Development mode: waiting 2 seconds before PDF generation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Generate PDF
      const pdfBuffer = await generatePreviewPDF(estimate);
      const filename = generatePreviewPDFFilename(estimate);
      
      console.log('Preview PDF generated successfully, size:', pdfBuffer.length);
      
      // Upload PDF to Airtable
      console.log('Uploading PDF to Airtable...');
      await uploadPDFToAirtableEstimate(estimateId, pdfBuffer, filename);
      console.log('Preview PDF uploaded to Airtable successfully');
      
      // Prepare estimate data for email service
      console.log('Preparing email data...');
      const emailEstimateData = {
        estimate_nr: estimate.estimate_nr,
        total_amount_vat: estimate.total_amount_vat,
        estimated_work_days: estimate.estimated_work_days,
        lead: {
          first_name: estimate.lead.first_name,
          last_name: estimate.lead.last_name,
          email: estimate.lead.email,
          phone: estimate.lead.phone,
          'Lead First Name': estimate.lead.first_name,
          'Lead Last Name': estimate.lead.last_name,
          'Lead Email': estimate.lead.email,
          'Lead Phone Number': estimate.lead.phone
        }
      };
      
      // Send email with PDF attachment
      console.log('Sending quote email to:', estimate.lead.email);
      const emailResult = await sendQuoteEmail(emailEstimateData, pdfBuffer, filename);
      
      if (!emailResult.success) {
        throw new Error(`Failed to send quote email: ${emailResult.error}`);
      }
      
      console.log('Quote email sent successfully');
      
      // Update sent messages tracking in Lead_Data table
      console.log('Updating sent messages tracking...');
      if (estimate.lead?.id) {
        const emailSubject = `Din preliminära offert för stenläggning - Offert #${estimate.estimate_nr}`;
        await updateLeadSentMessages(
          estimate.lead.id,
          emailSubject,
          estimate.lead.email,
          emailResult.messageId,
          !!pdfBuffer
        );
        console.log('Sent messages tracking updated for lead:', estimate.lead.id);
      } else {
        console.warn('No lead ID available for sent messages tracking');
      }
      
      console.log('✓ PDF generation and email sending completed successfully');

      // Send SMS confirmation (fire-and-forget, non-blocking)
      if (estimate.lead?.phone) {
        sendQuoteConfirmationSMS({
          customerPhone: estimate.lead.phone,
          customerEmail: estimate.lead.email,
          estimateId,
        }).then(smsResult => {
          if (smsResult.success) {
            console.log(`✓ SMS sent successfully: ${smsResult.smsId}, cost: ${smsResult.cost} SEK`);
          } else {
            console.warn(`SMS sending skipped or failed: ${smsResult.error}`);
          }
        }).catch(smsError => {
          console.error('SMS sending error:', smsError);
        });
      } else {
        console.log('SMS skipped: no phone number available');
      }

    } catch (error) {
      console.error('Error in synchronous PDF and email processing:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        estimateId,
        timestamp: new Date().toISOString()
      });
      
      // For now, we'll log the error but continue with the response
      // In the future, you might want to return an error response here
      console.error('PDF/Email processing failed, but continuing with quote response');
    }

    // Prepare response
    const response: QuoteResponse = {
      success: true,
      quote: {
        ...quote,
        quote_id: estimateId
      },
      customerInfo: customerInfo,
      disclaimer: {
        title: "Viktig information om din offert",
        content: "Detta är en preliminär prisuppskattning baserad på de uppgifter du angett. Det slutgiltiga priset fastställs efter ett kostnadsfritt hembesök där vi gör exakta mätningar och bedömer eventuella specifika förutsättningar på din fastighet."
      },
      next_steps: {
        title: "Nästa steg",
        content: "En kopia av denna offert har skickats till din e-post. Vi kontaktar dig inom 24 timmar för att boka ett kostnadsfritt hembesök där du får en bindande offert.",
        cta_text: "Väntar på ditt svar",
        cta_url: "#"
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing quote request:', error);
    
    // In development, provide more detailed error information
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment && error instanceof Error 
      ? `Development Error: ${error.message}` 
      : 'Ett fel uppstod när offerten skulle skapas. Vänligen försök igen eller kontakta oss direkt.';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        disclaimer: {
          title: "Tekniskt fel",
          content: "Vi ber om ursäkt för besväret. Du kan kontakta oss direkt på telefon eller e-post så hjälper vi dig med din offert."
        },
        next_steps: {
          title: "Kontakta oss direkt",
          content: "Ring oss på 08-XXX XX XX eller skicka e-post till info@bks.se så hjälper vi dig direkt.",
          cta_text: "Kontakta oss",
          cta_url: "tel:08XXXXXXX"
        }
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}