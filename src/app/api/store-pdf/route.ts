import { NextRequest, NextResponse } from 'next/server';
import { storePDF, cleanupOldPDF } from '@/lib/pdf-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, pdfBase64 } = body;

    if (!filename || !pdfBase64) {
      return NextResponse.json(
        { error: 'filename and pdfBase64 are required' },
        { status: 400 }
      );
    }

    // Clean up any existing PDF with the same filename
    cleanupOldPDF(filename);
    console.log(`Cleaned up old PDF if existed: ${filename}`);

    // Convert base64 back to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    // Store in memory with timestamp
    storePDF(filename, pdfBuffer);

    console.log(`Stored PDF temporarily: ${filename} (${pdfBuffer.length} bytes)`);

    // Return the URL where this PDF can be accessed
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bks-calculator.vercel.app';
    const pdfUrl = `${baseUrl}/api/serve-pdf/${filename}`;

    return NextResponse.json({
      success: true,
      filename: filename,
      url: pdfUrl,
      size: pdfBuffer.length
    });

  } catch (error) {
    console.error('Error storing PDF:', error);
    return NextResponse.json(
      { 
        error: 'Failed to store PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

