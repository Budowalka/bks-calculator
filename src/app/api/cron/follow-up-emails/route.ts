import { NextRequest, NextResponse } from 'next/server';
import { getLeadsNeedingFollowUp, updateLeadEmailStage, updateLeadSentMessages } from '@/lib/airtable';
import { sendFollowUpEmail, STAGE_CONFIG } from '@/lib/email-sequences';

/**
 * Vercel Cron Job — processes follow-up email sequences.
 *
 * Runs every hour. For each stage (1, 2, 3) queries Airtable for leads
 * at that stage and sends the corresponding follow-up email.
 *
 * Cron schedule in vercel.json: "0 * * * *" (every hour)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this automatically)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Array<{
    stage: number;
    leadId: string;
    email: string;
    success: boolean;
    error?: string;
  }> = [];

  for (const config of STAGE_CONFIG) {
    const leads = await getLeadsNeedingFollowUp(config.stage, config.hoursAfterLastEmail);

    for (const lead of leads) {
      if (!lead.email) continue;

      // Build a booking link from the lead id
      const bookingLink = `https://smova.se/b/${lead.id}`;

      const result = await sendFollowUpEmail(
        config.stage as 1 | 2 | 3,
        {
          to: lead.email,
          firstName: lead.firstName || 'Kund',
          bookingLink,
        }
      );

      if (result.success) {
        // Advance to next stage
        await updateLeadEmailStage(lead.id, config.stage + 1);
        await updateLeadSentMessages(
          lead.id,
          `Follow-up ${config.stage}: ${STAGE_CONFIG.find(s => s.stage === config.stage)?.subject}`,
          lead.email
        );
      }

      results.push({
        stage: config.stage,
        leadId: lead.id,
        email: lead.email,
        success: result.success,
        error: result.error,
      });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
