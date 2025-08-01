import { NextRequest, NextResponse } from 'next/server';
import { getEstimateForPDF, uploadPDFToAirtableEstimate } from '@/lib/airtable';
import { generateEstimatePDF, generatePDFFilename } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { estimateId, returnPdf = false } = body;

    if (!estimateId) {
      return NextResponse.json(
        { error: 'estimateId is required' },
        { status: 400 }
      );
    }

    // Fetch estimate data from Airtable
    const estimate = await getEstimateForPDF(estimateId);
    
    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateEstimatePDF(estimate);
    const filename = generatePDFFilename(estimate);

    // Upload PDF to Airtable
    await uploadPDFToAirtableEstimate(estimateId, pdfBuffer, filename);

    // If returnPdf is true, return the PDF (for testing)
    if (returnPdf) {
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    }

    // Default: return success status (for webhook usage)
    return NextResponse.json({
      success: true,
      message: 'PDF generated and uploaded to Airtable successfully',
      filename: filename,
      estimateId: estimateId
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing - always returns PDF directly
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('estimateId');

    if (!estimateId) {
      return NextResponse.json(
        { error: 'estimateId query parameter is required' },
        { status: 400 }
      );
    }

    // Fetch estimate data from Airtable
    const estimate = await getEstimateForPDF(estimateId);
    
    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateEstimatePDF(estimate);
    const filename = generatePDFFilename(estimate);

    // Upload PDF to Airtable
    await uploadPDFToAirtableEstimate(estimateId, pdfBuffer, filename);

    // Return PDF as response (for testing)
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}