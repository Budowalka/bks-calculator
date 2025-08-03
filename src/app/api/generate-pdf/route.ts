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

// GET endpoint - generates PDF, uploads to Airtable, and returns PDF
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/generate-pdf called');
    
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('estimateId');
    const uploadToAirtable = searchParams.get('uploadToAirtable') !== 'false'; // Default to true
    
    console.log('EstimateId from query params:', estimateId);
    console.log('Upload to Airtable:', uploadToAirtable);

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

    console.log('Starting PDF generation...');
    // Generate PDF
    let pdfBuffer, filename;
    try {
      pdfBuffer = await generateEstimatePDF(estimate);
      filename = generatePDFFilename(estimate);
      console.log('PDF generated successfully, size:', pdfBuffer.length);
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      return NextResponse.json(
        { error: 'Failed to generate PDF', details: pdfError instanceof Error ? pdfError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Upload PDF to Airtable (if enabled)
    if (uploadToAirtable) {
      try {
        console.log('Uploading PDF to Airtable...');
        await uploadPDFToAirtableEstimate(estimateId, pdfBuffer, filename);
        console.log('PDF uploaded to Airtable successfully');
      } catch (uploadError) {
        console.error('Error uploading PDF to Airtable:', uploadError);
        // Continue to return PDF even if upload fails
        console.log('Continuing to return PDF despite upload failure');
      }
    } else {
      console.log('Skipping Airtable upload (uploadToAirtable=false)');
    }

    console.log('Returning PDF response...');
    // Return PDF as response
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
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}