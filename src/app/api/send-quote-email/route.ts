import { NextRequest, NextResponse } from 'next/server';
import { getEstimateForPDF, updateLeadSentMessages } from '@/lib/airtable';
import { generatePreviewPDF, generatePreviewPDFFilename } from '@/lib/preview-pdf-generator';
import { sendQuoteEmail, validateEmailConfig } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { estimateId, generatePdfIfMissing = true } = body;

    if (!estimateId) {
      return NextResponse.json(
        { error: 'estimateId is required' },
        { status: 400 }
      );
    }

    console.log('Sending quote email for estimate:', estimateId);

    // Validate email configuration
    const emailValidation = validateEmailConfig();
    if (!emailValidation.valid) {
      console.error('Email configuration validation failed:', emailValidation.errors);
      return NextResponse.json(
        { 
          error: 'Email configuration is invalid',
          details: emailValidation.errors
        },
        { status: 500 }
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

    // Check if this is an automatic estimate (status should be "Automat")
    if (estimate.status !== 'Automat') {
      return NextResponse.json(
        { error: 'Quote email can only be sent for automatic estimates (status: Automat)' },
        { status: 400 }
      );
    }

    // Check if customer has email address
    if (!estimate.lead?.email) {
      return NextResponse.json(
        { error: 'No customer email address found in estimate data' },
        { status: 400 }
      );
    }

    let pdfBuffer: Buffer | undefined;
    let pdfFilename: string | undefined;

    // Generate PDF if requested and missing
    if (generatePdfIfMissing) {
      try {
        console.log('Generating preview PDF for email attachment...');
        pdfBuffer = await generatePreviewPDF(estimate);
        pdfFilename = generatePreviewPDFFilename(estimate);
        
        // Validate PDF buffer
        if (!pdfBuffer || pdfBuffer.length === 0) {
          console.error('PDF generation returned empty buffer');
          pdfBuffer = undefined;
          pdfFilename = undefined;
        } else {
          console.log('Preview PDF generated successfully for email, size:', pdfBuffer.length, 'bytes');
        }
      } catch (pdfError) {
        console.error('Error generating PDF for email:', pdfError);
        // Reset PDF variables to ensure no invalid data is passed
        pdfBuffer = undefined;
        pdfFilename = undefined;
        console.log('Continuing to send email without PDF attachment');
      }
    }

    // Prepare estimate data for email service
    const emailEstimateData = {
      estimate_nr: estimate.estimate_nr,
      total_amount_vat: estimate.total_amount_vat,
      estimated_work_days: estimate.estimated_work_days,
      lead: {
        first_name: estimate.lead.first_name,
        last_name: estimate.lead.last_name,
        email: estimate.lead.email,
        phone: estimate.lead.phone,
        // Add Cal.com fields
        'Lead First Name': estimate.lead.first_name,
        'Lead Last Name': estimate.lead.last_name,
        'Lead Email': estimate.lead.email,
        'Lead Phone Number': estimate.lead.phone
      }
    };

    // Send email
    console.log('Sending quote email to:', estimate.lead.email);
    const emailResult = await sendQuoteEmail(emailEstimateData, pdfBuffer, pdfFilename);

    if (!emailResult.success) {
      console.error('Failed to send quote email:', emailResult.error);
      return NextResponse.json(
        {
          error: 'Failed to send quote email',
          details: emailResult.error
        },
        { status: 500 }
      );
    }

    console.log('Quote email sent successfully');

    // Update sent messages tracking in Lead_Data table
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

    return NextResponse.json({
      success: true,
      message: 'Quote email sent successfully',
      estimateId: estimateId,
      recipientEmail: estimate.lead.email,
      messageId: emailResult.messageId,
      pdfAttached: !!pdfBuffer,
      pdfSize: pdfBuffer?.length
    });

  } catch (error) {
    console.error('Send quote email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send quote email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing email sending
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/send-quote-email called (test mode)');
    
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('estimateId');
    // const skipPdf = searchParams.get('skipPdf') === 'true'; // Reserved for future use

    if (!estimateId) {
      return NextResponse.json(
        { error: 'estimateId query parameter is required' },
        { status: 400 }
      );
    }

    // Use POST logic but via GET for testing
    const result = await POST(request);
    return result;

  } catch (error) {
    console.error('Test send quote email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test send quote email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}