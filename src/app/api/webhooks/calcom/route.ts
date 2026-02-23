import { NextRequest, NextResponse } from 'next/server';
import { updateLeadBookingStatus, updateLeadEmailStage } from '@/lib/airtable';

/**
 * Cal.com Webhook — receives booking events.
 *
 * Cal.com sends a POST when a booking is created/cancelled.
 * We match the booking email to a lead in Airtable and update status.
 *
 * Setup in Cal.com:
 *   URL: https://your-domain.com/api/webhooks/calcom
 *   Events: BOOKING_CREATED
 *   Secret: set CALCOM_WEBHOOK_SECRET in .env
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook secret if configured
    if (process.env.CALCOM_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-cal-signature-256');
      // Basic check — for production, implement HMAC verification
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }
    }

    const eventType = body.triggerEvent;

    if (eventType === 'BOOKING_CREATED') {
      const attendeeEmail = body.payload?.attendees?.[0]?.email;
      const leadId = extractLeadIdFromBooking(body);

      if (leadId) {
        // Update booking status
        await updateLeadBookingStatus(leadId, 'Booked');
        // Stop follow-up sequence by advancing past all stages
        await updateLeadEmailStage(leadId, 99);

        console.log(
          `[Cal.com Webhook] Booking created — lead ${leadId} marked as Booked`
        );
      } else {
        console.log(
          `[Cal.com Webhook] Booking created but could not identify lead. Email: ${attendeeEmail}`
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
 * The booking link includes the estimateId in the URL metadata.
 */
function extractLeadIdFromBooking(
  body: Record<string, unknown>
): string | null {
  // Cal.com passes metadata from the booking URL
  // Our links are: cal.com/bksentreprenad/platsbesok?metadata[leadId]=xxx
  const metadata = (body.payload as Record<string, unknown>)
    ?.metadata as Record<string, string> | undefined;

  return metadata?.leadId || null;
}
