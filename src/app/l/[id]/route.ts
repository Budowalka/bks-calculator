import { NextRequest, NextResponse } from 'next/server';
import { getLeadForRedirect, updateLeadBookingStatus } from '@/lib/airtable';
import { generateCalLink } from '@/lib/cal-link-generator';

/**
 * URL Shortener redirect route (by leadId)
 * GET /l/[leadId] → redirects to Cal.com booking page with customer data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    if (!leadId) {
      return NextResponse.redirect('https://cal.com/bksentreprenad/platsbesok');
    }

    const lead = await getLeadForRedirect(leadId);

    if (!lead) {
      return NextResponse.redirect('https://cal.com/bksentreprenad/platsbesok');
    }

    // Track link click in Airtable (fire-and-forget)
    updateLeadBookingStatus(lead.id, 'Link Clicked').catch(err =>
      console.error('[Shortener /l] Failed to update booking status:', err)
    );

    const calLink = generateCalLink({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      leadId: lead.id,
    });

    return NextResponse.redirect(calLink);
  } catch (error) {
    console.error('[Shortener /l] Error fetching lead:', error);
    return NextResponse.redirect('https://cal.com/bksentreprenad/platsbesok');
  }
}
