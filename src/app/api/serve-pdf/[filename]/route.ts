import { NextRequest, NextResponse } from 'next/server';
import { getPDF } from '@/lib/pdf-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Try to get PDF with retry logic
    let pdfData = getPDF(filename);
    
    if (!pdfData) {
      // Wait a bit and try again (for race conditions)
      await new Promise(resolve => setTimeout(resolve, 100));
      pdfData = getPDF(filename);
      
      if (!pdfData) {
        console.log(`PDF not found after retry: ${filename}`);
        return NextResponse.json(
          { error: 'PDF not found or expired' },
          { status: 404 }
        );
      }
    }

    console.log(`Serving PDF: ${filename} (${pdfData.buffer.length} bytes)`);

    // Return the PDF
    return new NextResponse(pdfData.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfData.buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*', // Allow Airtable to fetch
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Failed to serve PDF' },
      { status: 500 }
    );
  }
}