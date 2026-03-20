import { NextRequest, NextResponse } from 'next/server';
import {
  updateLeadBookingStatus,
  updateLeadEmailStage,
  updateLeadStatus,
  findLeadByEmail,
} from '@/lib/airtable';

/**
 * Cal.com Webhook — receives booking events.
 *
 * Cal.com sends a POST when a booking is created/cancelled.
 * We match the booking to a lead via metadata.leadId or email fallback,
 * then update Booking Status, Lead Status and Email Sequence Stage.
 *
 * Setup in Cal.com:
 *   URL: https://smova.se/api/webhooks/calcom
 *   Events: BOOKING_CREATED, BOOKING_CANCELLED
 *   Secret: set CALCOM_WEBHOOK_SECRET in .env
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook secret if configured
    if (process.env.CALCOM_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-cal-signature-256');
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }
    }

    const eventType = body.triggerEvent;
    const attendeeEmail = body.payload?.attendees?.[0]?.email;

    if (eventType === 'BOOKING_CREATED') {
      let leadId = extractLeadIdFromBooking(body);

      // Fallback: find lead by attendee email
      if (!leadId && attendeeEmail) {
        console.log(
          `[Cal.com Webhook] No metadata.leadId, searching by email: ${attendeeEmail}`
        );
        leadId = await findLeadByEmail(attendeeEmail);
      }

      if (leadId) {
        await Promise.all([
          updateLeadBookingStatus(leadId, 'Booked'),
          updateLeadEmailStage(leadId, 99),
          updateLeadStatus(leadId, '30 - 📅 Meeting Booked'),
        ]);

        console.log(
          `[Cal.com Webhook] Booking created — lead ${leadId} marked as Booked`
        );
      } else {
        console.log(
          `[Cal.com Webhook] Booking created but could not identify lead. Email: ${attendeeEmail}`
        );
      }
    } else if (eventType === 'BOOKING_CANCELLED') {
      let leadId = extractLeadIdFromBooking(body);

      if (!leadId && attendeeEmail) {
        console.log(
          `[Cal.com Webhook] Cancelled — no metadata.leadId, searching by email: ${attendeeEmail}`
        );
        leadId = await findLeadByEmail(attendeeEmail);
      }

      if (leadId) {
        await Promise.all([
          updateLeadBookingStatus(leadId, '' as 'Link Clicked'),
          updateLeadStatus(leadId, '20 - 👍 Interested'),
        ]);

        console.log(
          `[Cal.com Webhook] Booking cancelled — lead ${leadId} reverted to Interested`
        );
      } else {
        console.log(
          `[Cal.com Webhook] Booking cancelled but could not identify lead. Email: ${attendeeEmail}`
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Cal.com Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Extracts lead ID from the Cal.com booking payload.
 * The booking link includes the leadId in the URL metadata.
 */
function extractLeadIdFromBooking(
  body: Record<string, unknown>
): string | null {
  const metadata = (body.payload as Record<string, unknown>)
    ?.metadata as Record<string, string> | undefined;

  return metadata?.leadId || null;
}
