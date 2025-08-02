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

  // BKS Logo as base64
  const bksLogoBase64 = "data:image/png;base64,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";

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
          <img src="${bksLogoBase64}" alt="BKS AB Logo" class="logo" />
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