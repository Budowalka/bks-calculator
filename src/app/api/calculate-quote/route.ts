import { NextRequest, NextResponse } from 'next/server';
import { BKSCalculator } from '@/lib/calculator';
import { createLead, createEstimate, createEstimateItems, getPricingComponents } from '@/lib/airtable';
import { FormData, CustomerInfo, QuoteResponse } from '@/lib/types';

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
    const pricingComponents = await getPricingComponents();
    
    // Initialize calculator and generate quote
    const calculator = new BKSCalculator(pricingComponents);
    const quote = calculator.calculateQuote(formData);

    // Create lead record in Airtable
    const leadId = await createLead(formData, customerInfo);
    
    // Create estimate record in Airtable
    const estimateId = await createEstimate(leadId, quote, formData);
    
    // Create estimate items in Airtable
    await createEstimateItems(estimateId, quote, pricingComponents);

    // Automated workflow: Both PDF and Email in background for fast user response
    console.log('Starting background workflows for estimate:', estimateId);
    
    // PDF Generation - Fire and forget
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/generate-preview-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estimateId: estimateId,
        returnPdf: false
      })
    }).then(async (pdfResponse) => {
      if (pdfResponse.ok) {
        console.log('Preview PDF generated successfully in background');
      } else {
        const pdfError = await pdfResponse.text();
        console.error('Failed to generate preview PDF:', pdfError);
      }
    }).catch((pdfError) => {
      console.error('Error in background PDF generation:', pdfError);
    });

    // Email Sending - Fire and forget
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-quote-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estimateId: estimateId,
        generatePdfIfMissing: true // Generate PDF if background PDF isn't ready yet
      })
    }).then(async (emailResponse) => {
      if (emailResponse.ok) {
        console.log('Quote email sent successfully in background');
      } else {
        const emailError = await emailResponse.text();
        console.error('Failed to send quote email in background:', emailError);
      }
    }).catch((emailError) => {
      console.error('Error in background email sending:', emailError);
    });

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