import sgMail from '@sendgrid/mail';
import { generateCalLinkFromLead } from './cal-link-generator';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface LeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  'Lead First Name'?: string;
  'Lead Last Name'?: string;
  'Lead Email'?: string;
  'Lead Phone Number'?: string;
}

interface EstimateData {
  estimate_nr: number;
  total_amount_vat: number;
  estimated_work_days: number;
  lead: LeadData | null;
}

interface EmailData {
  to: string;
  customerName: string;
  estimateNumber: number;
  totalAmount: number;
  workDays: number;
  calLink: string;
  pdfAttachment?: {
    content: string; // base64 encoded PDF
    filename: string;
  };
}

/**
 * Creates the HTML email template for quote emails
 */
function createEmailTemplate(data: EmailData): string {
  const formattedAmount = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(data.totalAmount);

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F5F2ED;font-family:Georgia,Times,serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Din preliminära offert: ${formattedAmount} inkl. moms. Detaljerad PDF bifogad.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F2ED;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:4px;overflow:hidden;max-width:600px;">

          <!-- Gold top bar -->
          <tr><td style="height:4px;background-color:#C8A55C;font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- Logo + Offert nr -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><img src="https://www.smova.se/images/logo-bks.png" alt="BKS AB" width="80" style="display:block;border:0;" /></td>
                  <td align="right" style="font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:13px;color:#8A8579;vertical-align:bottom;">Offert #${data.estimateNumber}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <p style="margin:0 0 18px 0;font-family:Georgia,Times,serif;font-size:17px;line-height:1.7;color:#1E1D1B;">Hej ${data.customerName},</p>
              <p style="margin:0 0 18px 0;font-family:Georgia,Times,serif;font-size:17px;line-height:1.7;color:#1E1D1B;">Tack för att du använde vår kalkylator. Här är din preliminära offert för stenläggning.</p>
            </td>
          </tr>

          <!-- Quote amount box -->
          <tr>
            <td style="padding:8px 40px 18px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;border:1px solid #E8E4DD;border-radius:6px;">
                <tr>
                  <td align="center" style="padding:24px 20px;">
                    <p style="margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:13px;color:#8A8579;text-transform:uppercase;letter-spacing:1px;">Preliminär totalkostnad</p>
                    <p style="margin:0 0 8px 0;font-family:Georgia,Times,serif;font-size:32px;font-weight:bold;color:#1E1D1B;">${formattedAmount}</p>
                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:13px;color:#8A8579;">Inkl. moms &middot; Beräknad arbetstid: ${data.workDays} arbetsdagar</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Disclaimer -->
          <tr>
            <td style="padding:0 40px 18px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDF8EE;border-left:3px solid #C8A55C;border-radius:0 4px 4px 0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#1E1D1B;">Ingår inte i priset:</p>
                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#5A5549;">Stenmaterial (marksten, betongplattor, natursten). Väljs vid hembesök. Om du valde asfalt ingår det i priset.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PDF info -->
          <tr>
            <td style="padding:0 40px 18px 40px;">
              <p style="margin:0;font-family:Georgia,Times,serif;font-size:17px;line-height:1.7;color:#1E1D1B;">En komplett uppdelning av ditt projekt finns i den bifogade PDF-filen.</p>
            </td>
          </tr>

          <!-- Next steps -->
          <tr>
            <td style="padding:0 40px 0 40px;">
              <p style="margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#1E1D1B;">Nästa steg</p>
              <p style="margin:0 0 24px 0;font-family:Georgia,Times,serif;font-size:17px;line-height:1.7;color:#1E1D1B;">Boka ett kostnadsfritt hembesök så tittar vi på din tomt, ger dig rådgivning kring materialval och skickar en komplett offert.</p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 40px 12px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#C8A55C;border-radius:6px;">
                    <a href="${data.calLink}" style="display:inline-block;padding:16px 36px;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#1E1D1B;text-decoration:none;letter-spacing:0.3px;">Boka kostnadsfritt hembesök</a>
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

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#E8E4DD;"></div></td></tr>

          <!-- Signature -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#1E1D1B;font-weight:600;">Ramiro Botero</p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#8A8579;">BKS AB &middot; <a href="tel:+46735757897" style="color:#8A8579;text-decoration:none;">073-575 78 97</a></p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
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

/**
 * Creates the plain text version of the email
 */
function createTextTemplate(data: EmailData): string {
  return `
Din preliminära offert för stenläggning - Offert #${data.estimateNumber}

Hej ${data.customerName},

Tack för att du använde vår onlinekalkylator! Vi har skapat en preliminär offert baserat på dina val och önskemål.

Din preliminära totalkostnad: ${new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(data.totalAmount)}
Inkl. moms • Beräknad arbetstid: ${data.workDays} arbetsdagar

⚠️ VIKTIGT ATT VETA - INGÅR INTE I PRISET:
• Betongplattor och marksten
• Små- och storgatsten  
• Granithällar och skifferplattor

Obs: Om du valde asfalt som slutbeläggning ingår detta i priset. Övriga stenläggnings-material väljs och prissätts vid vårt kostnadsfria hembesök.

DETALJERAD OFFERT BIFOGAD
En komplett uppdelning av ditt projekt med alla kostnader finns i den bifogade PDF-filen.

NÄSTA STEG: KOSTNADSFRI PLATSBESIKTNING
För en bindande offert och för att diskutera materialval behöver vi göra en platsbesiktning. Detta är helt kostnadsfritt och utan förpliktelser.

Boka din platsbesiktning: ${data.calLink}

VAD HÄNDER NU?
• Vi kontaktar dig inom 24 timmar för att bekräfta din bokning
• Hembesöket är kostnadsfritt och utan förpliktelser  
• Vid hembesöket får du en bindande offert med exakta priser
• Vi hjälper dig välja rätt material för ditt projekt

HAR DU FRÅGOR?
Telefon: 073 575 78 97
E-post: info@bksakeri.se
Webb: www.bksakeri.se

Med vänliga hälsningar,
Ramiro Botero
Projektledare, BKS AB
`;
}

/**
 * Sends a quote email with PDF attachment using SendGrid
 */
export async function sendQuoteEmail(
  estimateData: EstimateData,
  pdfBuffer?: Buffer,
  pdfFilename?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is not set');
    }

    if (!process.env.SENDGRID_SENDER_EMAIL) {
      throw new Error('SENDGRID_SENDER_EMAIL environment variable is not set');
    }

    if (!estimateData.lead?.email) {
      throw new Error('No recipient email address found in estimate data');
    }

    // Generate Cal.com booking link
    const calLink = generateCalLinkFromLead({
      'Lead First Name': estimateData.lead['Lead First Name'] || estimateData.lead.first_name,
      'Lead Last Name': estimateData.lead['Lead Last Name'] || estimateData.lead.last_name,
      'Lead Email': estimateData.lead['Lead Email'] || estimateData.lead.email,
      'Lead Phone Number': estimateData.lead['Lead Phone Number'] || estimateData.lead.phone
    });

    // Prepare email data
    const emailData: EmailData = {
      to: estimateData.lead.email,
      customerName: estimateData.lead.first_name || 'Kund',
      estimateNumber: estimateData.estimate_nr,
      totalAmount: estimateData.total_amount_vat,
      workDays: estimateData.estimated_work_days,
      calLink
    };

    // Prepare attachments if PDF is provided
    const attachments = [];
    if (pdfBuffer && pdfFilename) {
      console.log('Preparing PDF attachment:', {
        filename: pdfFilename,
        bufferSize: pdfBuffer.length,
        bufferType: typeof pdfBuffer,
        isBuffer: Buffer.isBuffer(pdfBuffer)
      });
      
      try {
        const base64Content = pdfBuffer.toString('base64');
        console.log('PDF converted to base64, length:', base64Content.length);
        
        attachments.push({
          content: base64Content,
          filename: pdfFilename,
          type: 'application/pdf',
          disposition: 'attachment'
        });
        
        console.log('PDF attachment prepared successfully');
      } catch (conversionError) {
        console.error('Error converting PDF to base64:', conversionError);
        // Continue without attachment if conversion fails
      }
    } else {
      console.log('No PDF attachment - buffer or filename missing:', {
        hasBuffer: !!pdfBuffer,
        hasFilename: !!pdfFilename,
        bufferLength: pdfBuffer?.length || 0
      });
    }

    // Prepare sender info
    const senderName = process.env.SENDGRID_SENDER_NAME?.replace(/\+/g, ' ') || 'Ramiro Botero';
    
    // Prepare email message
    const msg = {
      to: emailData.to,
      from: {
        email: process.env.SENDGRID_SENDER_EMAIL,
        name: senderName
      },
      subject: `Din preliminära offert för stenläggning - Offert #${emailData.estimateNumber}`,
      html: createEmailTemplate(emailData),
      text: createTextTemplate(emailData),
      attachments
    };

    // Send email
    console.log('Sending email with SendGrid:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      attachmentCount: attachments.length,
      hasHtmlContent: !!msg.html,
      hasTextContent: !!msg.text
    });
    
    const response = await sgMail.send(msg);
    
    console.log('Email sent successfully:', {
      messageId: response[0]?.headers?.['x-message-id'],
      statusCode: response[0]?.statusCode,
      attachmentsSent: attachments.length
    });
    
    return {
      success: true,
      messageId: response[0]?.headers?.['x-message-id']
    };

  } catch (error) {
    console.error('Error sending quote email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Validates email configuration
 */
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.SENDGRID_API_KEY) {
    errors.push('SENDGRID_API_KEY environment variable is missing');
  }

  if (!process.env.SENDGRID_SENDER_EMAIL) {
    errors.push('SENDGRID_SENDER_EMAIL environment variable is missing');
  }

  if (!process.env.SENDGRID_SENDER_NAME) {
    errors.push('SENDGRID_SENDER_NAME environment variable is missing');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}