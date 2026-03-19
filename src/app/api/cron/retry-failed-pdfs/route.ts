import { NextRequest, NextResponse } from 'next/server';
import { getEstimatesWithoutPDF, getEstimateForPDF, uploadPDFToAirtableEstimate, updateLeadSentMessages, appendEstimateNote } from '@/lib/airtable';
import { generatePreviewPDF, generatePreviewPDFFilename } from '@/lib/preview-pdf-generator';
import { sendQuoteEmail, validateEmailConfig } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

/**
 * Vercel Cron Job — retries PDF generation for estimates that failed.
 *
 * Runs every hour at :30. Finds Estimates with status "Automat" that have
 * no PDF attachment (pdf_created_date is empty) and were created in the last 7 days.
 * For each: generates PDF, uploads to Airtable, sends email with PDF attachment.
 *
 * Cron schedule in vercel.json: "30 * * * *"
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emailValidation = validateEmailConfig();
  if (!emailValidation.valid) {
    return NextResponse.json({
      error: 'Email configuration invalid',
      details: emailValidation.errors,
    }, { status: 500 });
  }

  const estimates = await getEstimatesWithoutPDF();
  console.log(`[retry-failed-pdfs] Found ${estimates.length} estimates without PDF`);

  if (estimates.length === 0) {
    return NextResponse.json({
      processed: 0,
      message: 'No estimates need PDF retry',
      timestamp: new Date().toISOString(),
    });
  }

  const results: Array<{
    id: string;
    estimateNr: number;
    success: boolean;
    pdfGenerated: boolean;
    emailSent: boolean;
    error?: string;
  }> = [];

  for (const est of estimates) {
    try {
      console.log(`[retry-failed-pdfs] Processing estimate ${est.id} (nr: ${est.estimateNr})`);

      const estimate = await getEstimateForPDF(est.id);
      if (!estimate || estimate.status !== 'Automat') {
        console.log(`[retry-failed-pdfs] Skipping ${est.id}: not found or wrong status`);
        continue;
      }

      if (!estimate.lead?.email) {
        console.log(`[retry-failed-pdfs] Skipping ${est.id}: no customer email`);
        await appendEstimateNote(est.id, 'PDF retry skipped: no customer email');
        continue;
      }

      // Generate PDF
      const pdfBuffer = await generatePreviewPDF(estimate);
      const filename = generatePreviewPDFFilename(estimate);
      console.log(`[retry-failed-pdfs] PDF generated for ${est.id}, size: ${pdfBuffer.length} bytes`);

      // Upload to Airtable
      await uploadPDFToAirtableEstimate(est.id, pdfBuffer, filename);
      console.log(`[retry-failed-pdfs] PDF uploaded to Airtable for ${est.id}`);

      // Send email with PDF
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
          'Lead Phone Number': estimate.lead.phone,
        }
      };

      const emailResult = await sendQuoteEmail(emailEstimateData, pdfBuffer, filename, est.id);

      if (emailResult.success && estimate.lead.id) {
        const emailSubject = `Din preliminära offert för stenläggning - Offert #${estimate.estimate_nr}`;
        const bodyText = `Hej ${estimate.lead.first_name},\n\nTack för att du använde vår onlinekalkylator!\n\nDin preliminära totalkostnad: ${new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(estimate.total_amount_vat)}\nInkl. moms — Beräknad arbetstid: ${estimate.estimated_work_days} arbetsdagar\n\nEn komplett uppdelning av ditt projekt finns i den bifogade PDF-filen.\n\nMed vänliga hälsningar,\nRamiro Botero\nBKS AB — 073-575 78 97`;
        await updateLeadSentMessages(
          estimate.lead.id,
          emailSubject,
          estimate.lead.email,
          emailResult.messageId,
          true,
          bodyText
        );
      }

      await appendEstimateNote(est.id, `PDF retry succeeded: PDF generated and email sent`);

      results.push({
        id: est.id,
        estimateNr: est.estimateNr,
        success: true,
        pdfGenerated: true,
        emailSent: emailResult.success,
      });

      console.log(`[retry-failed-pdfs] Successfully processed ${est.id}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[retry-failed-pdfs] Failed for ${est.id}:`, errorMsg);

      await appendEstimateNote(est.id, `PDF retry failed: ${errorMsg}`);

      results.push({
        id: est.id,
        estimateNr: est.estimateNr,
        success: false,
        pdfGenerated: false,
        emailSent: false,
        error: errorMsg,
      });
    }
  }

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`[retry-failed-pdfs] Done: ${succeeded} succeeded, ${failed} failed`);

  return NextResponse.json({
    processed: results.length,
    succeeded,
    failed,
    results,
    timestamp: new Date().toISOString(),
  });
}
