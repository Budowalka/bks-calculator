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
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Din preliminära offert från BKS AB</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 10px;
        }
        .quote-summary {
            background-color: #e8f5e8;
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .quote-amount {
            font-size: 24px;
            font-weight: bold;
            color: #155724;
            margin: 10px 0;
        }
        .disclaimer-box {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .disclaimer-title {
            color: #856404;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .cta-button {
            display: inline-block;
            background-color: #28a745;
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
        }
        .contact-info {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Din preliminära offert för stenläggning</h1>
        <p>Offert #${data.estimateNumber}</p>
    </div>

    <p>Hej ${data.customerName},</p>

    <p>Tack för att du använde vår onlinekalkylator! Vi har skapat en preliminär offert baserat på dina val och önskemål.</p>

    <div class="quote-summary">
        <h3>Din preliminära totalkostnad:</h3>
        <div class="quote-amount">${new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(data.totalAmount)}</div>
        <p><small>Inkl. moms • Beräknad arbetstid: ${data.workDays} arbetsdagar</small></p>
    </div>

    <div class="disclaimer-box">
        <div class="disclaimer-title">⚠️ Viktigt att veta - Ingår INTE i priset:</div>
        <ul>
            <li><strong>Betongplattor och marksten</strong></li>
            <li><strong>Små- och storgatsten</strong></li>
            <li><strong>Granithällar och skifferplattor</strong></li>
        </ul>
        <p><small><strong>Obs:</strong> Om du valde asfalt som slutbeläggning ingår detta i priset. Övriga stenläggnings-material väljs och prissätts vid vårt kostnadsfria hembesök.</small></p>
    </div>

    <h3>📋 Detaljerad offert bifogad</h3>
    <p>En komplett uppdelning av ditt projekt med alla kostnader finns i den bifogade PDF-filen. Där ser du exakt vad som ingår i varje del av arbetet.</p>

    <div style="text-align: center; margin: 30px 0;">
        <h3>🏠 Nästa steg: Kostnadsfri platsbesiktning</h3>
        <p>För en bindande offert och för att diskutera materialval behöver vi göra en platsbesiktning. Detta är helt kostnadsfritt och utan förpliktelser.</p>
        <a href="${data.calLink}" class="cta-button">Boka din platsbesiktning nu</a>
    </div>

    <h3>Vad händer nu?</h3>
    <ul>
        <li>Vi kontaktar dig inom 24 timmar för att bekräfta din bokning</li>
        <li>Hembesöket är kostnadsfritt och utan förpliktelser</li>
        <li>Vid hembesöket får du en bindande offert med exakta priser</li>
        <li>Vi hjälper dig välja rätt material för ditt projekt</li>
    </ul>

    <div class="contact-info">
        <h4>Har du frågor?</h4>
        <p><strong>Kontakta oss gärna:</strong><br>
        📞 073 575 78 97<br>
        ✉️ info@bksakeri.se<br>
        🌐 www.bksakeri.se</p>
        
        <p style="margin-top: 20px;">
        <strong>Med vänliga hälsningar,<br>
        Ramiro Botero<br>
        Projektledare, BKS AB</strong>
        </p>
    </div>
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