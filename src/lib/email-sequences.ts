// Follow-up email sequences for BKS Calculator leads
//
// 5-mailowa sekwencja post-quote. Cel: booking hembesök.
// Design: gold (#C8A55C) + charcoal (#1E1D1B) + warm cream (#F5F2ED).
// Georgia serif body, system sans-serif UI elements.

import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface FollowUpData {
  to: string;
  firstName: string;
  bookingLink: string;
}

// ─── Shared email layout ───

function emailLayout(body: string, bookingLink: string, ctaText: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F5F2ED;font-family:Georgia,Times,serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F2ED;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:4px;overflow:hidden;max-width:600px;">
          <tr><td style="height:4px;background-color:#C8A55C;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <img src="https://www.smova.se/images/logo-bks.png" alt="BKS AB" width="80" style="display:block;border:0;outline:none;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0 40px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 40px 12px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#C8A55C;border-radius:6px;">
                    <a href="${bookingLink}" style="display:inline-block;padding:16px 36px;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#1E1D1B;text-decoration:none;letter-spacing:0.3px;">${ctaText}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 28px 40px;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:14px;color:#8A8579;">
                Eller ring direkt: <a href="tel:+46735757897" style="color:#1E1D1B;font-weight:600;text-decoration:none;">073-575 78 97</a>
              </p>
            </td>
          </tr>
          <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#E8E4DD;"></div></td></tr>
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#1E1D1B;font-weight:600;">Ramiro Botero</p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#8A8579;">BKS AB &middot; <a href="tel:+46735757897" style="color:#8A8579;text-decoration:none;">073-575 78 97</a></p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td align="center" style="padding:20px 40px;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#A09A91;">BKS AB &middot; Kungsgatan 29, 111 56 Stockholm &middot; Org.nr 559179-6700</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const P = (text: string) =>
  `<p style="margin:0 0 18px 0;font-family:Georgia,Times,serif;font-size:17px;line-height:1.7;color:#1E1D1B;">${text}</p>`;
const P_LAST = (text: string) =>
  `<p style="margin:0 0 24px 0;font-family:Georgia,Times,serif;font-size:17px;line-height:1.7;color:#1E1D1B;">${text}</p>`;
const H3 = (text: string) =>
  `<p style="margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#1E1D1B;font-weight:600;">${text}</p>`;
const EM = (text: string) =>
  `<p style="margin:0 0 18px 0;font-family:Georgia,Times,serif;font-size:17px;line-height:1.7;color:#5A5549;font-style:italic;">${text}</p>`;
const UL = (items: string[]) =>
  `<ul style="margin:0 0 18px 0;padding-left:20px;font-family:Georgia,Times,serif;font-size:17px;line-height:1.7;color:#1E1D1B;">${items.map(i => `<li style="margin-bottom:6px;">${i}</li>`).join('')}</ul>`;

// ─── STAGE 1: T+24h — Reminder + hembesökets värde ───

function stage1Html(d: FollowUpData): string {
  return emailLayout(
    [
      P(`Hej ${d.firstName},`),
      P('Igår skickade vi din preliminära offert. Jag vill bara kolla att allt kommit fram.'),
      P('Offerten ger dig en bra bild av kostnaden. Men det finns saker som kalkylatorn inte kan bedöma på distans: markförhållanden, tillgänglighet för maskiner, och inte minst val av sten, som påverkar både pris och slutresultat.'),
      P('Det är därför vi erbjuder ett kostnadsfritt hembesök. Inga förpliktelser, ca 30 minuter. Vi tittar på din tomt, diskuterar dina önskemål och ger dig en bindande offert.'),
      P_LAST('<strong>Tips:</strong> Ta med din partner om ni är två som bestämmer hemma. Det brukar göra det enklare att komma vidare.'),
    ].join(''),
    d.bookingLink,
    'Boka kostnadsfritt hembesök',
    'Vi kollar bara att allt kommit fram. Hembesök kostnadsfritt, 30 min.'
  );
}

function stage1Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

Igår skickade vi din preliminära offert. Jag vill bara kolla att allt kommit fram.

Offerten ger dig en bra bild av kostnaden. Men det finns saker som kalkylatorn inte kan bedöma på distans: markförhållanden, tillgänglighet för maskiner, och inte minst val av sten, som påverkar både pris och slutresultat.

Det är därför vi erbjuder ett kostnadsfritt hembesök. Inga förpliktelser, ca 30 minuter. Vi tittar på din tomt, diskuterar dina önskemål och ger dig en bindande offert.

Tips: Ta med din partner om ni är två som bestämmer hemma. Det brukar göra det enklare att komma vidare.

Boka kostnadsfritt hembesök: ${d.bookingLink}

Eller ring direkt: 073-575 78 97

/ Ramiro
BKS AB`;
}

// ─── STAGE 2: T+3d — Social proof ───

function stage2Html(d: FollowUpData): string {
  return emailLayout(
    [
      P(`Hej ${d.firstName},`),
      P('En familj i Bromma kontaktade oss förra året. De hade en grusuppfart som blivit ett årligt projekt: ogräs varje sommar, grus som spred sig till gräsmattan, lerigt till hösten.'),
      P('De hade fått tre offerter. Vår var inte billigast. Men vid hembesöket visade vi exakt vad som ingick i varje rad, och vad de andra offerterna inte nämnde: djup på schakt, antal lager bärlager, typ av fog.'),
      P('Arbetet tog 5 dagar. Uppfarten klarade sin första vinter utan att röra sig en millimeter.'),
      P_LAST('Vi gör gärna samma sak för dig. Vi börjar med att titta på din tomt och dina förutsättningar. Kostnadsfritt.'),
    ].join(''),
    d.bookingLink,
    'Boka hembesök',
    'Från grusplan till stenlagd uppfart — ett projekt i Bromma.'
  );
}

function stage2Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

En familj i Bromma kontaktade oss förra året. De hade en grusuppfart som blivit ett årligt projekt: ogräs varje sommar, grus som spred sig till gräsmattan, lerigt till hösten.

De hade fått tre offerter. Vår var inte billigast. Men vid hembesöket visade vi exakt vad som ingick i varje rad, och vad de andra offerterna inte nämnde: djup på schakt, antal lager bärlager, typ av fog.

Arbetet tog 5 dagar. Uppfarten klarade sin första vinter utan att röra sig en millimeter.

Vi gör gärna samma sak för dig. Vi börjar med att titta på din tomt och dina förutsättningar. Kostnadsfritt.

Boka hembesök: ${d.bookingLink}

Eller ring direkt: 073-575 78 97

/ Ramiro
BKS AB`;
}

// ─── STAGE 3: T+7d — Co jest w ofercie, a co nie ───

function stage3Html(d: FollowUpData): string {
  return emailLayout(
    [
      P(`Hej ${d.firstName},`),
      P('En sak som ofta skapar förvirring när man jämför offerter: vad ingår egentligen i priset?'),
      P('<strong>Din offert täcker allt markarbete.</strong> Schakt, bärlager, sättsand, fogning och arbetskostnad. Det som inte ingår är själva stenmaterialet, alltså marksten, betongplattor eller natursten.'),
      P('Varför separerar vi det? För att stenpriset varierar enormt. En enkel betongsten kostar runt 200-400 kr/kvm. Natursten kan ligga på 800-2 000 kr/kvm. Rätt val beror på din tomt, hur ytan ska användas och vad som passar helheten.'),
      P('Vid hembesöket ser vi förutsättningarna på plats och kan ge konkreta tips: vilken typ av sten som passar din mark, var du kan åka och titta på material, och vad som fungerar bäst för just ditt projekt. Efteråt skickar vi en komplett offert med stenpris inkluderat.'),
      P_LAST('Det är också värt att tänka på om du jämför med andra offerter: vissa företag inkluderar sten, andra inte. Vissa räknar med tunnare bärlager för att pressa priset. Fråga alltid vad som ingår i grunden och hur djupt de gräver.'),
    ].join(''),
    d.bookingLink,
    'Boka hembesök',
    'Vad ingår i priset — och vad ingår inte? Så jämför du offerter.'
  );
}

function stage3Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

En sak som ofta skapar förvirring när man jämför offerter: vad ingår egentligen i priset?

Din offert täcker allt markarbete. Schakt, bärlager, sättsand, fogning och arbetskostnad. Det som inte ingår är själva stenmaterialet, alltså marksten, betongplattor eller natursten.

Varför separerar vi det? För att stenpriset varierar enormt. En enkel betongsten kostar runt 200-400 kr/kvm. Natursten kan ligga på 800-2 000 kr/kvm. Rätt val beror på din tomt, hur ytan ska användas och vad som passar helheten.

Vid hembesöket ser vi förutsättningarna på plats och kan ge konkreta tips: vilken typ av sten som passar din mark, var du kan åka och titta på material, och vad som fungerar bäst för just ditt projekt. Efteråt skickar vi en komplett offert med stenpris inkluderat.

Det är också värt att tänka på om du jämför med andra offerter: vissa företag inkluderar sten, andra inte. Vissa räknar med tunnare bärlager för att pressa priset. Fråga alltid vad som ingår i grunden och hur djupt de gräver.

Boka hembesök: ${d.bookingLink}

Eller ring direkt: 073-575 78 97

/ Ramiro
BKS AB`;
}

// ─── STAGE 4: T+14d — Underarbete avgör allt ───

function stage4Html(d: FollowUpData): string {
  return emailLayout(
    [
      P(`Hej ${d.firstName},`),
      P('Det vanligaste jag hör från husägare som anlitat någon annan:'),
      EM('"Det såg perfekt ut. Sen kom vintern."'),
      P('Stockholm har tjäle ner till en och en halv meter. Marken fryser, expanderar, trycker uppåt. Om bärlagret inte är tillräckligt djupt eller inte packats i rätt ordning, rör sig allt ovanpå. Stenar glider isär. Fogar spricker. Vatten samlas.'),
      P('Det knepiga? Dag ett ser resultatet identiskt ut, oavsett vad som ligger under. Du märker skillnaden först efter andra vintern. Och då kostar det mer att åtgärda än att göra rätt från början.'),
      P_LAST('Vid hembesöket visar vi exakt vad ditt projekt kräver och varför. Inga överraskningar.'),
    ].join(''),
    d.bookingLink,
    'Boka kostnadsfritt hembesök',
    'Varför en del stenläggningar ser perfekta ut — tills vintern kommer.'
  );
}

function stage4Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

Det vanligaste jag hör från husägare som anlitat någon annan:

"Det såg perfekt ut. Sen kom vintern."

Stockholm har tjäle ner till en och en halv meter. Marken fryser, expanderar, trycker uppåt. Om bärlagret inte är tillräckligt djupt eller inte packats i rätt ordning, rör sig allt ovanpå. Stenar glider isär. Fogar spricker. Vatten samlas.

Det knepiga? Dag ett ser resultatet identiskt ut, oavsett vad som ligger under. Du märker skillnaden först efter andra vintern. Och då kostar det mer att åtgärda än att göra rätt från början.

Vid hembesöket visar vi exakt vad ditt projekt kräver och varför. Inga överraskningar.

Boka kostnadsfritt hembesök: ${d.bookingLink}

Eller ring direkt: 073-575 78 97

/ Ramiro
BKS AB`;
}

// ─── STAGE 5: T+21d — Urgency + opt-out ───

function stage5Html(d: FollowUpData): string {
  return emailLayout(
    [
      P(`Hej ${d.firstName},`),
      P('Din preliminära offert går ut om 9 dagar.'),
      P('Jag vet att stenläggning är ett stort beslut. Men om du siktar på vår eller sommar vill jag vara ärlig: våra tider fylls snabbt efter påsk. Det gäller hela branschen i Stockholm.'),
      P('Ett hembesök tar 30 minuter och innebär inget åtagande. Vi tittar på förutsättningarna, ger dig rådgivning kring materialval och skickar sedan en komplett offert med tidsplan.'),
      P_LAST('Har planerna ändrats? Helt okej. Svara på detta mail så tar vi bort dig från vår lista.'),
    ].join(''),
    d.bookingLink,
    'Boka hembesök',
    'Din offert gäller i 9 dagar till. Vårtiderna fylls snabbt.'
  );
}

function stage5Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

Din preliminära offert går ut om 9 dagar.

Jag vet att stenläggning är ett stort beslut. Men om du siktar på vår eller sommar vill jag vara ärlig: våra tider fylls snabbt efter påsk. Det gäller hela branschen i Stockholm.

Ett hembesök tar 30 minuter och innebär inget åtagande. Vi tittar på förutsättningarna, ger dig rådgivning kring materialval och skickar sedan en komplett offert med tidsplan.

Har planerna ändrats? Helt okej. Svara på detta mail så tar vi bort dig från vår lista.

Boka hembesök: ${d.bookingLink}

Eller ring direkt: 073-575 78 97

/ Ramiro
BKS AB`;
}

// ─── CONFIG ───

const STAGE_CONFIG = [
  {
    stage: 1,
    subject: 'Har du fått din offert?',
    html: stage1Html,
    hoursAfterLastEmail: 24,
  },
  {
    stage: 2,
    subject: 'Familjen i Bromma som hade en grusplan i 10 år',
    html: stage2Html,
    hoursAfterLastEmail: 72,
  },
  {
    stage: 3,
    subject: 'Vad ingår i din offert — och vad ingår inte',
    html: stage3Html,
    hoursAfterLastEmail: 168,
  },
  {
    stage: 4,
    subject: 'Varför en del stenläggningar spricker efter 2 vintrar',
    html: stage4Html,
    hoursAfterLastEmail: 336,
  },
  {
    stage: 5,
    subject: 'Din offert gäller i 9 dagar till',
    html: stage5Html,
    hoursAfterLastEmail: 504,
  },
] as const;

type StageNumber = 1 | 2 | 3 | 4 | 5;

const textFns: Record<StageNumber, (d: FollowUpData) => string> = {
  1: stage1Text, 2: stage2Text, 3: stage3Text, 4: stage4Text, 5: stage5Text,
};

export function getFollowUpText(stage: StageNumber, data: FollowUpData): string {
  return textFns[stage](data);
}

export { STAGE_CONFIG };

export async function sendFollowUpEmail(
  stage: StageNumber,
  data: FollowUpData
): Promise<{ success: boolean; error?: string }> {
  const config = STAGE_CONFIG.find(s => s.stage === stage);
  if (!config) return { success: false, error: `Unknown stage: ${stage}` };

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER_EMAIL) {
    return { success: false, error: 'SendGrid not configured' };
  }

  try {
    const senderName =
      process.env.SENDGRID_SENDER_NAME?.replace(/\+/g, ' ').trim() ||
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
