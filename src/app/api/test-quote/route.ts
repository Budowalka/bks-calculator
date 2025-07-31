import { NextRequest, NextResponse } from 'next/server';
import { FormData, QuoteResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { formData }: { formData: FormData } = body;

    console.log('Received form data:', formData);

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

    // Create a mock successful response
    const response: QuoteResponse = {
      success: true,
      quote: {
        quote_id: 'TEST-' + Date.now(),
        items: [
          {
            name: 'Test Item',
            category: 'Stenläggning',
            quantity: formData.area,
            unit: 'm²',
            unit_price_sek: 800,
            total_sek: formData.area * 800
          }
        ],
        categories_summary: {
          'Stenläggning': formData.area * 800
        },
        total_sek: formData.area * 800,
        total_sek_with_vat: formData.area * 800 * 1.25,
        estimated_days: Math.ceil(formData.area / 50),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      disclaimer: {
        title: "Test Mode - Viktig information",
        content: "Detta är en testoffert. Den slutgiltiga offerten kommer efter hembesök med exakta mätningar."
      },
      next_steps: {
        title: "Test genomfört",
        content: "Formuläret fungerar korrekt! I produktionsläge skulle detta skapa en riktig offert.",
        cta_text: "Förstått",
        cta_url: "#"
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in test endpoint:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: `Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        disclaimer: {
          title: "Test fel",
          content: "Ett fel uppstod i testläget."
        },
        next_steps: {
          title: "Debug information",
          content: "Kontrollera konsolen för mer information.",
          cta_text: "OK",
          cta_url: "#"
        }
      },
      { status: 500 }
    );
  }
}