import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { EstimateData, EstimateItem, LeadData } from './pdf-generator';
import { generateCalLinkFromLead } from './cal-link-generator';

/**
 * Generate HTML content for preview PDF from estimate data
 */
function generatePreviewHTMLContent(estimate: EstimateData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  // Function to clean category names by removing sort numbers
  const cleanCategoryName = (category: string): string => {
    return category.replace(/^\d+\s*-\s*/, '');
  };

  // Group items by arbetsmoment (work category)
  const groupedItems = estimate.items.reduce((groups, item) => {
    const category = cleanCategoryName(item.arbetsmoment || 'Övriga arbeten');
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, EstimateItem[]>);

  // Calculate totals by category
  const categoryTotals = Object.entries(groupedItems).map(([category, items]) => ({
    category,
    total: items.reduce((sum, item) => sum + item.line_total, 0),
    items
  }));

  const clientName = estimate.lead 
    ? `${estimate.lead.first_name} ${estimate.lead.last_name}`
    : 'Kund';

  const clientAddress = estimate.lead?.full_address || 'Adress';
  const clientPhone = estimate.lead?.phone || 'Telefon';
  const clientEmail = estimate.lead?.email || 'E-post';

  // Generate Cal.com booking link
  const calLink = estimate.lead ? generateCalLinkFromLead({
    'Lead First Name': estimate.lead.first_name,
    'Lead Last Name': estimate.lead.last_name,
    'Lead Email': estimate.lead.email,
    'Lead Phone Number': estimate.lead.phone
  }) : 'https://cal.com/bksentreprenad/platsbesok';

  // Generate estimate table HTML
  const estimateTableHTML = categoryTotals.map(({ category, items, total }) => `
    <tr class="category-header">
      <td colspan="5">${category}</td>
    </tr>
    ${items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td class="text-right">${item.quantity}</td>
        <td>${item.unit}</td>
        <td class="text-right">${formatCurrency(item.unit_price)}</td>
        <td class="text-right">${formatCurrency(item.line_total)}</td>
      </tr>
    `).join('')}
    <tr class="category-total">
      <td colspan="4"><strong>Summa ${category}</strong></td>
      <td class="text-right"><strong>${formatCurrency(total)}</strong></td>
    </tr>
  `).join('');

  // BKS Logo - use public URL for consistency with full PDF
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bks-calculator.vercel.app';
  const bksLogoUrl = `${baseUrl}/images/logo-bks.png`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>BKS AB - Preliminär Offert #${estimate.estimate_nr}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .header-table td {
            padding: 15px;
            border: 1px solid #ddd;
            vertical-align: top;
          }
          
          .header-table td:first-child {
            width: 50%;
          }
          
          h1 {
            color: #2c5530;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          h2 {
            color: #2c5530;
            font-size: 18px;
            margin: 25px 0 15px 0;
            border-bottom: 2px solid #2c5530;
            padding-bottom: 5px;
          }
          
          .estimate-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .estimate-table th,
          .estimate-table td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          
          .estimate-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .category-header {
            background-color: transparent;
            color: #333;
            font-weight: bold;
            font-size: 16px;
          }
          
          .category-total {
            background-color: #e5e5e5;
            font-weight: bold;
          }
          
          .final-totals {
            background-color: #e8f5e8;
            font-weight: bold;
          }
          
          .text-right {
            text-align: right;
          }
          
          .greeting {
            margin: 20px 0;
            font-size: 16px;
          }
          
          p {
            margin-bottom: 15px;
            text-align: justify;
          }
          
          ul {
            margin: 15px 0;
            padding-left: 25px;
          }
          
          li {
            margin-bottom: 8px;
          }
          
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .logo {
            max-width: 150px;
            height: auto;
          }
          
          .disclaimer-box {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          
          .disclaimer-title {
            color: #856404;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          
          .disclaimer-content {
            color: #856404;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .cta-box {
            background-color: #e8f5e8;
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
          }
          
          .cta-title {
            color: #155724;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          
          .cta-link {
            background-color: #28a745;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            display: inline-block;
            margin: 10px 0;
          }
          
          .contact-info {
            margin-top: 40px;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #2c5530;
          }
        </style>
      </head>
      <body>
        <div class="logo-container">
          <img src="${bksLogoUrl}" alt="BKS AB Logo" class="logo" />
        </div>
        
        <h1>Preliminär Offert - Stenläggning</h1>
        
        <table class="header-table">
          <tr>
            <td>
              <strong>Beställare:</strong><br />
              ${clientName}<br />
              ${clientAddress}<br />
              ${clientPhone}<br />
              ${clientEmail}
            </td>
            <td>
              <strong>Entreprenör:</strong><br />
              BKS AB<br />
              Kungsgatan 29, 111 56 Stockholm<br />
              Org.nr: 559179-6700<br />
              0735757897<br />
              info@bksakeri.se
            </td>
          </tr>
        </table>

        <div class="greeting">
          Hej ${estimate.lead?.first_name || 'Kund'},
        </div>

        <p><strong>Tack för att du använde vår kalkylator!</strong></p>

        <p>Baserat på dina val har vi skapat denna preliminära offert för ditt stenläggningsprojekt. Detta är en automatiskt genererad uppskattning som ger dig en bra överblick över kostnaderna.</p>

        <h2>Din preliminära offert</h2>

        <table class="estimate-table">
          <thead>
            <tr>
              <th>Beskrivning</th>
              <th>Kvantitet</th>
              <th>Enhet</th>
              <th>Pris/enhet</th>
              <th class="text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            ${estimateTableHTML}
            <tr>
              <td colspan="5"></td>
            </tr>
            <tr class="final-totals">
              <td colspan="4"><strong>Summa exkl. moms</strong></td>
              <td class="text-right"><strong>${formatCurrency(estimate.total_amount)}</strong></td>
            </tr>
            <tr class="final-totals">
              <td colspan="4"><strong>Moms (25%)</strong></td>
              <td class="text-right"><strong>${formatCurrency(estimate.vat_amount)}</strong></td>
            </tr>
            <tr class="final-totals">
              <td colspan="4"><strong>Totalt inkl. moms</strong></td>
              <td class="text-right"><strong>${formatCurrency(estimate.total_amount_vat)}</strong></td>
            </tr>
          </tbody>
        </table>

        <p><strong>Beräknad arbetstid:</strong> ${estimate.estimated_work_days} arbetsdagar</p>
        <p><strong>Offerten gäller till:</strong> ${formatDate(estimate.valid_until)}</p>

        <div class="disclaimer-box">
          <div class="disclaimer-title">⚠️ Viktigt att veta - Ingår INTE i priset:</div>
          <div class="disclaimer-content">
            <ul>
              <li><strong>Betongplattor och marksten</strong></li>
              <li><strong>Små- och storgatsten</strong></li>
              <li><strong>Granithällar och skifferplattor</strong></li>
              <li><strong>Eventuellt extra grävarbete vid djupare markförberedelse</strong></li>
            </ul>
            <p><strong>Obs:</strong> Om du valde asfalt som slutbeläggning ingår detta i priset. Övriga stenläggnings-material väljs och prissätts vid vårt kostnadsfria hembesök baserat på typ, färg och tillverkare.</p>
          </div>
        </div>

        <div class="cta-box">
          <div class="cta-title">🏠 Boka kostnadsfri platsbesiktning</div>
          <p>För en bindande offert och för att diskutera materialval behöver vi göra en platsbesiktning. Detta är helt kostnadsfritt och utan förpliktelser.</p>
          <a href="${calLink}" class="cta-link">Boka din platsbesiktning nu</a>
          <p><small>Eller ring oss på 0735757897</small></p>
        </div>

        <h2>Vad händer nu?</h2>
        <ul>
          <li>Du får en kopia av denna offert via e-post</li>
          <li>Vi kontaktar dig inom 24 timmar för att boka hembesök</li>
          <li>Hembesöket är kostnadsfritt och utan förpliktelser</li>
          <li>Vid hembesöket får du en bindande offert med exakta priser</li>
          <li>Vi hjälper dig välja rätt material för ditt projekt</li>
        </ul>

        <div class="contact-info">
          <p><strong>Kontaktperson:</strong><br />
          Ramiro Botero, projektledare<br />
          Tel: 073 575 78 97<br />
          E-post: info@bksakeri.se<br />
          https://www.bksakeri.se</p>

          <p><strong>Med vänliga hälsningar,<br />
          Teamet på BKS AB</strong></p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate preview PDF from estimate data using Puppeteer and HTML string
 */
export async function generatePreviewPDF(estimate: EstimateData): Promise<Buffer> {
  let browser;
  
  try {
    // Configure for Vercel serverless environment
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('Preview PDF Generation environment:', { isProduction, nodeEnv: process.env.NODE_ENV });
    
    if (isProduction) {
      // Use @sparticuz/chromium for Vercel deployment
      console.log('Using @sparticuz/chromium for production');
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--hide-scrollbars',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // Local development
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }

    const page = await browser.newPage();

    // Set longer timeout for image loading
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Generate HTML content
    console.log('Generating preview HTML content...');
    const htmlContent = generatePreviewHTMLContent(estimate);

    console.log('Setting page content...');
    // Set page content and wait for all resources to load
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait a bit more for images to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Page content set, generating preview PDF...');

    // Generate PDF with options optimized for preview (shorter document)
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          <span>BKS AB - Preliminär Offert #${estimate.estimate_nr}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          <span>Sida <span class="pageNumber"></span> av <span class="totalPages"></span></span>
        </div>
      `,
      preferCSSPageSize: false
    });

    console.log('Preview PDF generated successfully');
    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('Error generating preview PDF:', error);
    throw new Error(`Failed to generate preview PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

/**
 * Generate filename for the preview PDF
 */
export function generatePreviewPDFFilename(estimate: EstimateData): string {
  const clientName = estimate.lead 
    ? `${estimate.lead.first_name}_${estimate.lead.last_name}`.replace(/\s+/g, '_')
    : 'kund';
  
  const date = new Date().toISOString().split('T')[0];
  const timestamp = Date.now(); // Add timestamp to ensure unique filenames
  
  return `BKS_Preliminar_Offert_${estimate.estimate_nr}_${clientName}_${date}_${timestamp}.pdf`;
}