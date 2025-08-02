import { NextRequest, NextResponse } from 'next/server';
import { getEstimateForPDF, uploadPDFToAirtableEstimate } from '@/lib/airtable';
import { generatePreviewPDF, generatePreviewPDFFilename } from '@/lib/preview-pdf-generator';

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

    console.log('Generating preview PDF for estimate:', estimateId);

    // Fetch estimate data from Airtable
    const estimate = await getEstimateForPDF(estimateId);
    
    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Check if this is an automatic estimate (status should be "Automat")
    if (estimate.status !== 'Automat') {
      return NextResponse.json(
        { error: 'Preview PDF can only be generated for automatic estimates (status: Automat)' },
        { status: 400 }
      );
    }

    // Generate preview PDF
    const pdfBuffer = await generatePreviewPDF(estimate);
    const filename = generatePreviewPDFFilename(estimate);

    console.log('Preview PDF generated successfully, size:', pdfBuffer.length);

    // Upload PDF to Airtable
    await uploadPDFToAirtableEstimate(estimateId, pdfBuffer, filename);
    console.log('Preview PDF uploaded to Airtable successfully');

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

    // Default: return success status (for automation usage)
    return NextResponse.json({
      success: true,
      message: 'Preview PDF generated and uploaded to Airtable successfully',
      filename: filename,
      estimateId: estimateId,
      pdfSize: pdfBuffer.length
    });

  } catch (error) {
    console.error('Preview PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate preview PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing - always returns PDF directly
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/generate-preview-pdf called');
    
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('estimateId');
    console.log('EstimateId from query params:', estimateId);

    if (!estimateId) {
      console.log('No estimateId provided in query params');
      return NextResponse.json(
        { error: 'estimateId query parameter is required' },
        { status: 400 }
      );
    }

    console.log('Starting to fetch estimate data...');
    // Fetch estimate data from Airtable
    let estimate;
    try {
      estimate = await getEstimateForPDF(estimateId);
      console.log('Estimate data fetched successfully');
    } catch (estimateError) {
      console.error('Error fetching estimate:', estimateError);
      return NextResponse.json(
        { error: 'Failed to fetch estimate data', details: estimateError instanceof Error ? estimateError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    if (!estimate) {
      console.log('Estimate not found');
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Check if this is an automatic estimate
    if (estimate.status !== 'Automat') {
      return NextResponse.json(
        { error: 'Preview PDF can only be generated for automatic estimates (status: Automat)', currentStatus: estimate.status },
        { status: 400 }
      );
    }

    console.log('Starting preview PDF generation...');
    // Generate preview PDF
    let pdfBuffer, filename;
    try {
      pdfBuffer = await generatePreviewPDF(estimate);
      filename = generatePreviewPDFFilename(estimate);
      console.log('Preview PDF generated successfully, size:', pdfBuffer.length);
    } catch (pdfError) {
      console.error('Error generating preview PDF:', pdfError);
      return NextResponse.json(
        { error: 'Failed to generate preview PDF', details: pdfError instanceof Error ? pdfError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    console.log('Returning preview PDF response...');
    // Return PDF as response (for testing only - no Airtable upload)
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Preview PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate preview PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}