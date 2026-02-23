import { NextRequest, NextResponse } from 'next/server';
import { getEstimateForPDF, updateLeadBookingStatus } from '@/lib/airtable';
import { generateCalLink } from '@/lib/cal-link-generator';

/**
 * URL Shortener redirect route
 * GET /b/[estimateId] → redirects to Cal.com booking page with customer data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: estimateId } = await params;

    if (!estimateId) {
      return NextResponse.redirect('https://cal.com/bksentreprenad/platsbesok');
    }

    // Fetch estimate with lead data
    const estimate = await getEstimateForPDF(estimateId);

    if (!estimate?.lead) {
      // Fallback to base Cal.com link if no lead data
      return NextResponse.redirect('https://cal.com/bksentreprenad/platsbesok');
    }

    // Track link click in Airtable (fire-and-forget)
    if (estimate.lead.id) {
      updateLeadBookingStatus(estimate.lead.id, 'Link Clicked').catch(err =>
        console.error('[Shortener] Failed to update booking status:', err)
      );
    }

    // Generate personalized Cal.com link with leadId for webhook tracking
    const calLink = generateCalLink({
      firstName: estimate.lead.first_name,
      lastName: estimate.lead.last_name,
      email: estimate.lead.email,
      phone: estimate.lead.phone,
      leadId: estimate.lead.id || undefined,
    });

    return NextResponse.redirect(calLink);
  } catch (error) {
    console.error('[Shortener] Error fetching estimate:', error);
    // Fallback to base Cal.com link on error
    return NextResponse.redirect('https://cal.com/bksentreprenad/platsbesok');
  }
}
