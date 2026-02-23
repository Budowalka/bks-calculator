// Follow-up email sequences for BKS Calculator leads

import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface FollowUpData {
  to: string;
  firstName: string;
  bookingLink: string;
}

// Stage 1: T+24h — reminder
function stage1Html(d: FollowUpData): string {
  return `
<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <p>Hej ${d.firstName},</p>
  <p>Har du hunnit titta på din offert? Vi vill bara säkerställa att du fått allt du behöver.</p>
  <h3>Vanliga frågor:</h3>
  <ul>
    <li><strong>Vad ingår i priset?</strong> Allt markarbete — schakt, underarbete, stenläggning och fogning.</li>
    <li><strong>Ingår materialet?</strong> Stenmaterial väljs vid hembesöket, så du ser och känner innan du bestämmer dig.</li>
    <li><strong>Kostar hembesöket?</strong> Nej, helt kostnadsfritt och utan förpliktelser.</li>
  </ul>
  <p style="text-align:center;margin:30px 0;">
    <a href="${d.bookingLink}" style="display:inline-block;background-color:#28a745;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">Boka kostnadsfritt hembesök</a>
  </p>
  <p>Med vänliga hälsningar,<br><strong>Ramiro Botero</strong><br>BKS AB — 073-575 78 97</p>
</body>
</html>`;
}

// Stage 2: T+3d — educational
function stage2Html(d: FollowUpData): string {
  return `
<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <p>Hej ${d.firstName},</p>
  <p>Planerar du stenläggning? Här är tre saker som gör stor skillnad för resultatet:</p>
  <h3>1. Rätt underarbete = hållbarhet i 20+ år</h3>
  <p>Schakt och bärlager utgör grunden. Vi använder maskinpackat bärlager i rätt tjocklek beroende på om ytan ska klara gångtrafik eller biltrafik.</p>
  <h3>2. Val av fog påverkar underhållet</h3>
  <p>Ogräshämmande fogsand minskar underhåll dramatiskt. Flexibel hårdfog passar bäst för rörliga underlag.</p>
  <h3>3. Maskinval sparar tid och pengar</h3>
  <p>Större maskin = snabbare arbete = lägre kostnad. Vi anpassar efter tillgängligheten på din fastighet.</p>
  <p style="text-align:center;margin:30px 0;">
    <a href="${d.bookingLink}" style="display:inline-block;background-color:#28a745;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">Boka hembesök — vi berättar mer</a>
  </p>
  <p>Med vänliga hälsningar,<br><strong>Ramiro Botero</strong><br>BKS AB — 073-575 78 97</p>
</body>
</html>`;
}

// Stage 3: T+7d — urgency
function stage3Html(d: FollowUpData): string {
  return `
<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <p>Hej ${d.firstName},</p>
  <p>Din offert är giltig i 23 dagar till. Vi vill gärna hjälpa dig komma igång innan sommarsäsongen.</p>
  <p>Bara en snabb påminnelse — hembesöket är:</p>
  <ul>
    <li>✅ Helt kostnadsfritt</li>
    <li>✅ Utan förpliktelser</li>
    <li>✅ 30-45 minuter med exakta mätningar</li>
    <li>✅ Materialrådgivning på plats</li>
  </ul>
  <p style="text-align:center;margin:30px 0;">
    <a href="${d.bookingLink}" style="display:inline-block;background-color:#28a745;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">Boka innan offerten går ut</a>
  </p>
  <p>Har du redan bestämt dig eller har frågor? Ring oss direkt: <strong>073-575 78 97</strong></p>
  <p>Med vänliga hälsningar,<br><strong>Ramiro Botero</strong><br>BKS AB</p>
</body>
</html>`;
}

const STAGE_CONFIG = [
  {
    stage: 1,
    subject: 'Har du hunnit titta på din offert?',
    html: stage1Html,
    hoursAfterLastEmail: 24,
  },
  {
    stage: 2,
    subject: '3 saker att tänka på inför stenläggning',
    html: stage2Html,
    hoursAfterLastEmail: 72, // 3 days
  },
  {
    stage: 3,
    subject: 'Din offert går ut om 23 dagar',
    html: stage3Html,
    hoursAfterLastEmail: 168, // 7 days
  },
] as const;

export { STAGE_CONFIG };

export async function sendFollowUpEmail(
  stage: 1 | 2 | 3,
  data: FollowUpData
): Promise<{ success: boolean; error?: string }> {
  const config = STAGE_CONFIG.find(s => s.stage === stage);
  if (!config) return { success: false, error: `Unknown stage: ${stage}` };

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER_EMAIL) {
    return { success: false, error: 'SendGrid not configured' };
  }

  try {
    const senderName =
      process.env.SENDGRID_SENDER_NAME?.replace(/\+/g, ' ') ||
      'Ramiro Botero';

    await sgMail.send({
      to: data.to,
      from: {
        email: process.env.SENDGRID_SENDER_EMAIL,
        name: senderName,
      },
      subject: config.subject,
      html: config.html(data),
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
