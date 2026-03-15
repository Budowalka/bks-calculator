// Follow-up email sequences for BKS Calculator leads
//
// 5-mailowa sekwencja post-quote. Cel: booking hembesök.
// Głos: Ramiro jako rzemieślnik, nie sprzedawca. Peer-to-peer.
// Konkretne liczby, zero guru language, jeden CTA per mail.
//
// Stage 1 (T+24h): Reminder + co hembesök daje ponad kalkulator
// Stage 2 (T+3d):  Social proof — realizacja z Bromma
// Stage 3 (T+7d):  Edukacja — 3 pytania do każdego stenläggare
// Stage 4 (T+14d): Underarbete — dlaczego to decyduje o wszystkim
// Stage 5 (T+21d): Urgency + opt-out

import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface FollowUpData {
  to: string;
  firstName: string;
  bookingLink: string;
}

const emailBodyStyle = 'font-family:Arial,sans-serif;line-height:1.7;color:#333;max-width:600px;margin:0 auto;padding:20px;';
const ctaStyle = 'display:inline-block;background-color:#28a745;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;';

// ─── STAGE 1: T+24h — Reminder + hembesökets värde ───

function stage1Html(d: FollowUpData): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="${emailBodyStyle}">
  <p>Hej ${d.firstName},</p>
  <p>Igår skickade vi din preliminära offert. Jag vill bara kolla att allt kommit fram.</p>
  <p>Offerten ger dig en bra bild av kostnaden. Men det finns saker som kalkylatorn inte kan bedöma på distans: markförhållanden, tillgänglighet för maskiner, och inte minst val av sten, som påverkar både pris och slutresultat.</p>
  <p>Det är därför vi erbjuder ett kostnadsfritt hembesök. Inga förpliktelser, ca 30 minuter. Vi tittar på din tomt, diskuterar dina önskemål och ger dig en bindande offert.</p>
  <p>Om ni är två som bestämmer hemma, ta gärna med din partner. Det brukar göra det enklare att komma vidare.</p>
  <p style="text-align:center;margin:30px 0;">
    <a href="${d.bookingLink}" style="${ctaStyle}">Boka hembesök</a>
  </p>
  <p>Eller ring direkt: <strong>073-575 78 97</strong></p>
  <p>/ Ramiro<br>BKS AB</p>
</body>
</html>`;
}

function stage1Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

Igår skickade vi din preliminära offert. Jag vill bara kolla att allt kommit fram.

Offerten ger dig en bra bild av kostnaden. Men det finns saker som kalkylatorn inte kan bedöma på distans: markförhållanden, tillgänglighet för maskiner, och inte minst val av sten, som påverkar både pris och slutresultat.

Det är därför vi erbjuder ett kostnadsfritt hembesök. Inga förpliktelser, ca 30 minuter. Vi tittar på din tomt, diskuterar dina önskemål och ger dig en bindande offert.

Om ni är två som bestämmer hemma, ta gärna med din partner. Det brukar göra det enklare att komma vidare.

Boka hembesök: ${d.bookingLink}

Eller ring direkt: 073-575 78 97

/ Ramiro
BKS AB`;
}

// ─── STAGE 2: T+3d — Social proof ───

function stage2Html(d: FollowUpData): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="${emailBodyStyle}">
  <p>Hej ${d.firstName},</p>
  <p>En familj i Bromma kontaktade oss förra året. De hade en grusuppfart som blivit ett årligt projekt: ogräs varje sommar, grus som spred sig till gräsmattan, lerigt till hösten.</p>
  <p>De hade fått tre offerter. Vår var inte billigast. Men vid hembesöket visade vi exakt vad som ingick i varje rad, och vad de andra offerterna inte nämnde: djup på schakt, antal lager bärlager, typ av fog.</p>
  <p>Arbetet tog 5 dagar. Uppfarten klarade sin första vinter utan att röra sig en millimeter.</p>
  <p>Vi gör gärna samma sak för dig. Vi börjar med att titta på din tomt och dina förutsättningar. Kostnadsfritt.</p>
  <p style="text-align:center;margin:30px 0;">
    <a href="${d.bookingLink}" style="${ctaStyle}">Boka hembesök</a>
  </p>
  <p>/ Ramiro<br>BKS AB — 073-575 78 97</p>
</body>
</html>`;
}

function stage2Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

En familj i Bromma kontaktade oss förra året. De hade en grusuppfart som blivit ett årligt projekt: ogräs varje sommar, grus som spred sig till gräsmattan, lerigt till hösten.

De hade fått tre offerter. Vår var inte billigast. Men vid hembesöket visade vi exakt vad som ingick i varje rad, och vad de andra offerterna inte nämnde: djup på schakt, antal lager bärlager, typ av fog.

Arbetet tog 5 dagar. Uppfarten klarade sin första vinter utan att röra sig en millimeter.

Vi gör gärna samma sak för dig. Vi börjar med att titta på din tomt och dina förutsättningar. Kostnadsfritt.

Boka hembesök: ${d.bookingLink}

/ Ramiro
BKS AB — 073-575 78 97`;
}

// ─── STAGE 3: T+7d — Co jest w ofercie, a co nie ───

function stage3Html(d: FollowUpData): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="${emailBodyStyle}">
  <p>Hej ${d.firstName},</p>
  <p>En sak som ofta skapar förvirring när man jämför offerter: vad ingår egentligen i priset?</p>
  <p><strong>Din offert täcker allt markarbete.</strong> Schakt, bärlager, sättsand, fogning och arbetskostnad. Det som inte ingår är själva stenmaterialet, alltså marksten, betongplattor eller natursten.</p>
  <p>Varför separerar vi det? För att stenpriset varierar enormt. En enkel betongsten kostar runt 200-400 kr/kvm. Natursten kan ligga på 800-2 000 kr/kvm. Rätt val beror på din tomt, hur ytan ska användas och vad som passar helheten.</p>
  <p>Vid hembesöket ser vi förutsättningarna på plats och kan ge konkreta tips: vilken typ av sten som passar din mark, var du kan åka och titta på material, och vad som fungerar bäst för just ditt projekt. Efteråt skickar vi en komplett offert med stenpris inkluderat.</p>
  <p>Det är också värt att tänka på om du jämför med andra offerter: vissa företag inkluderar sten, andra inte. Vissa räknar med tunnare bärlager för att pressa priset. Fråga alltid vad som ingår i grunden och hur djupt de gräver.</p>
  <p style="text-align:center;margin:30px 0;">
    <a href="${d.bookingLink}" style="${ctaStyle}">Boka hembesök</a>
  </p>
  <p>/ Ramiro<br>BKS AB — 073-575 78 97</p>
</body>
</html>`;
}

function stage3Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

En sak som ofta skapar förvirring när man jämför offerter: vad ingår egentligen i priset?

Din offert täcker allt markarbete. Schakt, bärlager, sättsand, fogning och arbetskostnad. Det som inte ingår är själva stenmaterialet, alltså marksten, betongplattor eller natursten.

Varför separerar vi det? För att stenpriset varierar enormt. En enkel betongsten kostar runt 200-400 kr/kvm. Natursten kan ligga på 800-2 000 kr/kvm. Rätt val beror på din tomt, hur ytan ska användas och vad som passar helheten.

Vid hembesöket ser vi förutsättningarna på plats och kan ge konkreta tips: vilken typ av sten som passar din mark, var du kan åka och titta på material, och vad som fungerar bäst för just ditt projekt. Efteråt skickar vi en komplett offert med stenpris inkluderat.

Det är också värt att tänka på om du jämför med andra offerter: vissa företag inkluderar sten, andra inte. Vissa räknar med tunnare bärlager för att pressa priset. Fråga alltid vad som ingår i grunden och hur djupt de gräver.

Boka hembesök: ${d.bookingLink}

/ Ramiro
BKS AB — 073-575 78 97`;
}

// ─── STAGE 4: T+14d — Underarbete avgör allt ───

function stage4Html(d: FollowUpData): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="${emailBodyStyle}">
  <p>Hej ${d.firstName},</p>
  <p>Det vanligaste jag hör från husägare som anlitat någon annan:</p>
  <p><em>"Det såg perfekt ut. Sen kom vintern."</em></p>
  <p>Stockholm har tjäle ner till en och en halv meter. Marken fryser, expanderar, trycker uppåt. Om bärlagret inte är tillräckligt djupt eller inte packats i rätt ordning, rör sig allt ovanpå. Stenar glider isär. Fogar spricker. Vatten samlas.</p>
  <p>Det knepiga? Dag ett ser resultatet identiskt ut, oavsett vad som ligger under. Du märker skillnaden först efter andra vintern. Och då kostar det mer att åtgärda än att göra rätt från början.</p>
  <p>Vid hembesöket visar vi exakt vad ditt projekt kräver och varför. Inga överraskningar.</p>
  <p style="text-align:center;margin:30px 0;">
    <a href="${d.bookingLink}" style="${ctaStyle}">Boka kostnadsfritt hembesök</a>
  </p>
  <p>Frågor? Ring: <strong>073-575 78 97</strong></p>
  <p>/ Ramiro<br>BKS AB</p>
</body>
</html>`;
}

function stage4Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

Det vanligaste jag hör från husägare som anlitat någon annan:

"Det såg perfekt ut. Sen kom vintern."

Stockholm har tjäle ner till en och en halv meter. Marken fryser, expanderar, trycker uppåt. Om bärlagret inte är tillräckligt djupt eller inte packats i rätt ordning, rör sig allt ovanpå. Stenar glider isär. Fogar spricker. Vatten samlas.

Det knepiga? Dag ett ser resultatet identiskt ut, oavsett vad som ligger under. Du märker skillnaden först efter andra vintern. Och då kostar det mer att åtgärda än att göra rätt från början.

Vid hembesöket visar vi exakt vad ditt projekt kräver och varför. Inga överraskningar.

Boka kostnadsfritt hembesök: ${d.bookingLink}

Frågor? Ring: 073-575 78 97

/ Ramiro
BKS AB`;
}

// ─── STAGE 5: T+21d — Urgency + opt-out ───

function stage5Html(d: FollowUpData): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="${emailBodyStyle}">
  <p>Hej ${d.firstName},</p>
  <p>Din preliminära offert går ut om 9 dagar.</p>
  <p>Jag vet att stenläggning är ett stort beslut. Men om du siktar på vår eller sommar vill jag vara ärlig: våra tider fylls snabbt efter påsk. Det gäller hela branschen i Stockholm.</p>
  <p>Ett hembesök tar 30 minuter och innebär inget åtagande. Vi tittar på förutsättningarna, ger dig rådgivning kring materialval och skickar sedan en komplett offert med tidsplan.</p>
  <p>Har planerna ändrats? Helt okej. Svara på detta mail så tar vi bort dig från vår lista.</p>
  <p style="text-align:center;margin:30px 0;">
    <a href="${d.bookingLink}" style="${ctaStyle}">Boka hembesök</a>
  </p>
  <p>Eller ring: <strong>073-575 78 97</strong></p>
  <p>/ Ramiro<br>BKS AB</p>
</body>
</html>`;
}

function stage5Text(d: FollowUpData): string {
  return `Hej ${d.firstName},

Din preliminära offert går ut om 9 dagar.

Jag vet att stenläggning är ett stort beslut. Men om du siktar på vår eller sommar vill jag vara ärlig: våra tider fylls snabbt efter påsk. Det gäller hela branschen i Stockholm.

Ett hembesök tar 30 minuter och innebär inget åtagande. Vi tittar på förutsättningarna, ger dig rådgivning kring materialval och skickar sedan en komplett offert med tidsplan.

Har planerna ändrats? Helt okej. Svara på detta mail så tar vi bort dig från vår lista.

Boka hembesök: ${d.bookingLink}

Eller ring: 073-575 78 97

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
