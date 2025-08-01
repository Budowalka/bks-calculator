import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  arbetsmoment: string;
}

export interface LeadData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  full_address: string;
  street_address: string;
  postal_code: string;
  city: string;
}

export interface EstimateData {
  id: string;
  estimate_nr: number;
  status: string;
  created: string;
  valid_until: string;
  notes: string;
  total_amount: number;
  total_amount_vat: number;
  vat_amount: number;
  estimated_work_days: number;
  items: EstimateItem[];
  lead: LeadData | null;
}

/**
 * Generate HTML content for PDF from estimate data
 */
function generateHTMLContent(estimate: EstimateData): string {
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
    // Remove pattern like "10 - ", "20 - ", "99 - " etc.
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

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>BKS AB - Offert #${estimate.estimate_nr}</title>
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
          
          h3 {
            color: #2c5530;
            font-size: 16px;
            margin: 20px 0 10px 0;
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
          
          ul, ol {
            margin: 15px 0;
            padding-left: 25px;
          }
          
          li {
            margin-bottom: 8px;
          }
          
          .contact-info {
            margin-top: 40px;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #2c5530;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .signature-section {
            margin-top: 50px;
            text-align: center;
          }
          
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .logo {
            max-width: 120px;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div class="logo-container">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAIABJREFUeF7tXQd4VEXXPpOzSQgJNSE0QYpKE0GwIkUQRUSwIYgNASmKKNbfCkIQFREFCwgWQGxY+BRQQVERC4iAFOktCSVAQiBl27z/e2Z3N5ts3yQBgsl93+fdt5l75507c+ac22Ys/xDPR4A9At7gxfkYHwF2sPAE59MgAmwgbCZsIMxGQNRWtkN8CK4fEcEGomXn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbAREI8IGonHn2EAsP4lsBEQjwgaicefYQCw/iWwERCPCBqJx59hALD+JbARE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" alt="BKS AB Logo" class="logo" />
        </div>
        
        <h1>Vackra och hållbara uteplatser</h1>
        
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
              info@bksakeri.se<br />
              <br />
              Företaget innehar F-skattsedel samt allrisk- och ansvarsförsäkring i Gjensidige Försäkring
            </td>
          </tr>
        </table>

        <div class="greeting">
          Hej ${estimate.lead?.first_name || 'Kund'},
        </div>

        <p><strong>Välkommen till ditt nya stenprojekt med BKS AB!</strong></p>

        <p>I denna offert presenterar vi vårt sätt för att förverkliga din vision om en vacker och funktionell stenlagd uteplats. Baserat på vårt inledande samtal och platsbesök har vi skräddarsytt en lösning som möter dina specifika önskemål och behov.</p>

        <p>Här beskriver vi ingående vår arbetsprocess, från noggrann planering och materialval till grundarbete och hantverksmässig stenläggning. Du får också en detaljerad specifikation av valda produkter, en transparent prisbild samt information om garantier.</p>

        <p>Vårt mål är att du ska känna dig trygg och välinformerad genom hela processen. Vi hoppas att denna offert ger dig en tydlig bild av hur vi på BKS AB kan hjälpa dig att skapa uteplatsen du drömmer om. Tveka inte att höra av dig med frågor!</p>

        <p><strong>Låt oss tillsammans ta första steget mot förverkligandet av ditt stenprojekt!</strong></p>

        <h2>Arbetsprocess - från idé till färdigt resultat</h2>

        <h3>Detaljerad offert baserad på dina önskemål</h3>
        <p>Baserat på den kostnadsfria konsultationen och platsbesöket, där vi lyssnade på dina tankar och önskemål samt inspekterade ytan, har våra experter tagit fram denna detaljerade offert. Här presenterar vi våra rekommendationer kring lämpliga material och designlösningar, skräddarsydda för ditt projekt. Offerten har ett fastpris, så du slipper överraskningar längre fram.</p>

        <h3>Noggrann planering och materialval</h3>
        <p>När du accepterat offerten går vi vidare med noggrann planering. Vi stämmer av dina val av plattor, färg och mönster och beställer hem högkvalitativt material från välrenommerade leverantörer. Allt för att förverkliga din vision.</p>

        <h3>Grundarbete med fokus på hållbarhet</h3>
        <p>På utsatt datum börjar vårt team arbetet. Beroende på ytans beskaffenhet och förutsättningar anpassar vi grundarbetet:</p>

        <p><strong>Scenario 1: Ytan är förberedd för stenläggning</strong><br />
        Om ytan redan är förberedd kontrollerar vi först att lutningen är korrekt för god vattenavrinning. Vid behov justerar vi fallet med hjälp av laser och vattenpass. Därefter lägger vi ut ett lager av stenflis eller stenmjöl som ytskikt, för optimal dränering och bärighet.</p>

        <p><strong>Scenario 2: Ytan kräver fullständig preparation</strong><br />
        Om ytan däremot inte är förberedd, börjar vi med att gräva ut till rätt djup. Detta görs för hand, med kranbil eller grävmaskin, beroende på ytans storlek och åtkomlighet. Vi lägger sedan en fiberduk som separerar underlaget och förhindrar ogräs. Ovanpå detta fyller vi på med bergkross i lämplig fraktion som bärlager. Varje lager packas noggrant med vibroplatta för att skapa en stabil grund. Slutligen adderar vi ett ytskikt av stenflis, och på så sätt förbereder vi för stenläggning.</p>

        <p>Oavsett utgångsläge utför vi grundarbetet med omsorg och expertis. Vi använder alltid ändamålsenlig utrustning och beprövade metoder för att skapa bästa möjliga förutsättningar för din nya stenläggning. Detta grundarbete är avgörande för ett hållbart och långvarigt resultat.</p>

        <h3>Stenläggning med känsla för detaljer</h3>
        <p>Med en stabil grund på plats är det dags för våra hantverkare att lägga stenarna enligt det överenskomna mönstret. Detta görs med största precision och känsla för detaljer. Stenar tilldelas och ytterkanterna anpassas genom kapning för ett prydligt intryck. Plattorna sätts med distanser för jämna fogar som sedan fylls med specialanpassat fogmaterial. Vi använder moderna hjälpmedel men traditionell hantverksskicklighet är avgörande för ett gediget slutresultat.</p>

        <h3>Avslutande finish och kvalitetskontroll</h3>
        <p>I slutfasen finputsar vi ytan genom att sopa rent och tvätta bort eventuella fogrester. Vårt mål är att lämna över en fin stenläggning som överträffar dina förväntningar. Som ett sista steg gör vi en grundlig kvalitetsgenomgång tillsammans med dig som kund, för att säkerställa att allt är enligt önskemål.</p>

        <p>Genom hela processen, från offertförfrågan till avslutad stenläggning, sätter vi dina önskemål i centrum. Med gedigen erfarenhet, kvalitetsmaterial och beprövade metoder ser vi till att leverera resultat som överträffar förväntningarna. Låt BKS AB förverkliga visionen om din nya uteplats!</p>

        <div class="page-break"></div>

        <h2>Arbetets omfattning med pris</h2>

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

        <h2>Dokumentation och kommunikation under projektets gång</h2>

        <p>På BKS AB tror vi på vikten av öppen kommunikation och transparens genom hela projektet. Från start till mål är du som kund involverad och informerad. Detta ger dig trygghet och insyn i hur arbetet fortskrider.</p>

        <p><strong>Innan projektstart:</strong></p>
        <ul>
          <li>Detaljerad offert med specifikationer och prisbild</li>
          <li>Tydlig tidplan</li>
          <li>Kontaktinformation till ansvarig projektledare</li>
        </ul>

        <p><strong>Under stenläggningen:</strong></p>
        <ul>
          <li>Regelbundna uppdateringar från projektledaren via telefon eller e-post</li>
          <li>Bilduppdateringar som visar arbetets framsteg, skickade till dig digitalt</li>
        </ul>

        <p><strong>Efter avslutat projekt:</strong></p>
        <ul>
          <li>Slutdokumentation med bilder på den färdiga stenläggningen</li>
          <li>Skötselråd och instruktioner för att bevara ytan i toppskick</li>
          <li>Garantibevis och information om vår eftermarknadsservice</li>
        </ul>

        <p><strong>Utöver detta dokumenterar vi även arbetet internt för kvalitetssäkring:</strong></p>

        <ul>
          <li>Dagliga checklistor för utfört arbete och använda material</li>
          <li>Egenkontroller enligt branschstandard</li>
          <li>Fotodokumentation av kritiska moment, t.ex. grundarbete och avvattningslösningar</li>
        </ul>

        <p>All denna dokumentation arkiveras digitalt och är tillgänglig för dig som kund även efter avslutat projekt. Du ska känna dig trygg i att arbetet är utfört enligt konstens alla regler och att du har full insyn i processen.</p>

        <p>Vi värdesätter kommunikation och är alltid bara ett telefonsamtal bort om du har frågor eller funderingar. Med BKS AB kan du känna dig trygg genom hela resan från idé till färdig stenläggning. Transparens är en av hörnstenarna i vår verksamhet.</p>

        <div class="page-break"></div>

        <h2>Övriga bestämmelser</h2>

        <h3>Förberedelse:</h3>
        <p>För att säkerställa en smidig start på ditt stenläggningsprojekt behöver vi att du som kund ser till att arbetsytan är fri från hinder. Detta innebär att flytta möbler, krukor eller andra föremål som kan stå i vägen. Vi behöver också tillgång till el och vatten i närheten av arbetsområdet. Om det finns särskilda önskemål eller förutsättningar att ta hänsyn till, ber vi dig att informera oss om detta i god tid före projektstart.</p>

        <h3>Verktyg:</h3>
        <p>För att säkerställa effektivitet och precision i vårt arbete använder vi specialanpassade verktyg och maskiner avsedda för stenläggning. Detta inkluderar plattlyft för ergonomisk hantering samt markvibrator och stampar för kompaktering av underlag. Våra hantverkare har tillgång till den utrustning som krävs för att utföra ett professionellt arbete och är väl förtrogen med dess användning.</p>

        <h3>Avfallshantering:</h3>
        <p>Vi på BKS AB strävar efter att minimera vårt miljöavtryck och hanterar allt avfall från projektet på ett ansvarsfullt sätt. Överblivet material som plattor, bergkross och stenmjöl återanvänds i mån av möjlighet i framtida projekt. Annat avfall som plast, kartong och övrigt byggmaterial sorteras och återvinns enligt gällande miljöföreskrifter. Som kund behöver du inte oroa dig för bortforsling av avfall då detta ingår i vårt åtagande.</p>

        <h3>Arbetsmiljö:</h3>
        <p>Säkerhet och trivsel på arbetsplatsen är viktigt för oss. Våra hantverkare följer gällande arbetsmiljöregler och använder föreskriven skyddsutrustning som hjälm, skyddsglasögon och handskar. Vi tillämpar ergonomiska arbetsmetoder för att minimera risken för förslitningsskador. Regelbundna arbetsplatsträffar hålls för att diskutera säkerhet och komma med förbättringsförslag. Vi tror på en öppen dialog och uppmuntrar både personal och kunder att påtala eventuella brister.</p>

        <h3>Transporter och lyft:</h3>
        <p>Allt material som krävs för ditt stenläggningsprojekt, inklusive plattor, bärlager och fogsand, transporteras till arbetsplatsen med företagets egna fordon. Våra fordon är anpassade för ändamålet och uppfüller gällande säkerhets- och utsläppskrav. Vid lossning använder vi kran eller truck beroende på förutsättningarna på plats. Lyft och förflyttning av tunga material sker med största försiktighet för att undvika skador.</p>

        <h3>Försäkring:</h3>
        <p>BKS AB har en heltäckande ansvarsförsäkring hos Gjensidige Försäkring som skyddar både oss och dig som kund vid eventuella skador eller olyckor i samband med vårt arbete. Försäkringen gäller för skador på personer, egendom och utfört arbete och ger dig som kund ett extra skydd vid oförutsedda händelser.</p>

        <h2>Hantering av oförutsedda problem eller hinder</h2>

        <p>Trots noggrann planering kan oförutsedda situationer uppstå under arbetets gång, t.ex:</p>
        <ul>
          <li>Upptäckt av sättningsskador eller andra problem med underlaget</li>
          <li>Extrema väderförhållanden som försenas eller hindrar arbetet</li>
          <li>Förseningar i materialleveranser från tredje part</li>
        </ul>

        <p>Om sådana omständigheter inträffar kommer vi omgående att kommunicera detta till dig som kund. Tillsammans finner vi den bästa lösningen för att komma vidare i projektet på ett smidigt sätt. Eventuella merkostnader till följd av oförutsedda hinder hanteras som tilläggsarbete efter godkännande från dig.</p>

        <h2>Ändringar och tilläggsarbeten</h2>

        <p>Vi strävar alltid efter att uppfylla dina önskemål och är flexibla för ändringar under projektets gång. Om du kommer på nya idéer eller vill göra tillägg utöver grundofferten har vi rutiner för att hantera detta:</p>
        <ul>
          <li>Meddela önskemålen till ansvarig projektledare.</li>
          <li>Vi tar fram en specifikation och prissättning för tilläggsarbetet.</li>
          <li>Efter ditt godkännande planerar vi in arbetet på lämpligaste sätt.</li>
          <li>Tilläggsarbetet faktureras separat efter utförande.</li>
        </ul>

        <p>Genom att ha en tydlig och transparent hantering av vad som ingår och inte ingår i offerten, samt hur vi hanterar avvikelser, skapar vi trygghet för dig som kund. Du ska veta vad du kan förvänta dig och inte behöva oroa dig för dolda kostnader.</p>

        <h2>Referenser</h2>

        <p>Våra tidigare kunder är de bästa ambassadörerna för vårt arbete. De har upplevt vår stenläggningsprocess från start till mål och kan ge dig en ärlig inblick i hur det är att samarbeta med oss. Genom att höra deras berättelser får du en god uppfattning om vår kompetens, service och kvalitet.</p>

        <p>Tveka inte att kontakta några av våra tidigare kunder för att höra deras omdömen. De kan ge dig värdefulla insikter och svar på frågor du kanske har inför ditt eget stenprojekt. Att höra någon annans positiva upplevelse kan ge extra trygghet när du fattar ditt beslut.</p>

        <p>Nedan finner du kontaktuppgifter till ett urval av våra tidigare kunder. Känn dig fri att kontakta dem!</p>

        <ol>
          <li><strong>Abbe</strong> - Bygg och Miljö - 0737280744</li>
          <li><strong>Rajaa</strong> - Söderby - 0737768162</li>
          <li><strong>Hadil</strong> - Uppsala - 0760062967</li>
          <li><strong>Maria</strong> - Farsta - 0737868856</li>
          <li><strong>Razvan</strong> - Asielbygg - 07320550031</li>
        </ol>

        <h2>Betalning</h2>

        <p><strong>Fakturering:</strong><br />
        Vi tillämpar följande faktureringsprocess för att göra det smidigt för dig som kund:</p>
        <ul>
          <li>30% av totalsumman faktureras vid projektstart och betalas innan arbetet påbörjas.</li>
          <li>30% faktureras när grundarbetet är slutfört och betalas inom 10 dagar.</li>
          <li>Resterande 40% faktureras vid godkänd slutbesiktning och betalas inom 10 dagar.</li>
        </ul>

        <p>Eventuella tilläggsarbeten faktureras separat efter utförande med 10 dagars betalningstid.</p>

        <h3>Betalningsvillkor:</h3>
        <ul>
          <li>Fakturor betalas inom 10 dagar från fakturadatum.</li>
          <li>Vid försenad betalning utgår dröjsmålsränta enligt gällande referensränta + 8%.</li>
          <li>BKS AB förbehåller sig äganderätten av allt material tills full betalning erlagts.</li>
        </ul>

        <h2>Garanti</h2>

        <p><strong>Garantitid:</strong></p>
        <ul>
          <li>På utfört arbete lämnar vi 2 års garanti.</li>
          <li>På material gäller respektive tillverkares garantier, generellt 2-5 år.</li>
        </ul>

        <p><strong>Garantivillkor:</strong></p>
        <ul>
          <li>Garantin omfattar arbetsutförande och materialkvalitet enligt branschstandard.</li>
          <li>Undantag från garantin är skador orsakade av yttre påverkan, bristande underhåll, onormalt slitage eller ändringar utförda av tredje part.</li>
          <li>För att garantin ska gälla skall skötselinstruktioner följas.</li>
        </ul>

        <h2>Försäkring</h2>

        <p>BKS AB har en ansvarsförsäkring hos Gjensidige Försäkring som täcker eventuella skador orsakade av vårt arbete upp till 10 Mkr. Vi är också fullt försäkrade om olyckor och skador på vår egen personal och utrustning. Du är trygg med oss!</p>

        <h2>Vi friskriver oss från</h2>

        <p><strong>Berg som kan förekomma vid grävning:</strong> Går det inte att gräva ner till den nivå som vi behöver på grund av att vi hittar berg så blir det en extra kostnad för det jobbet.</p>

        <p><strong>Ledningar:</strong> Du som kund är ansvarig för att visa var ledningar som är nedgrävda finns. Gräver vi bort något som inte har visats för oss kommer vi inte kunna återställa det utan kostnad.</p>

        <p><strong>Föroreningar i mark:</strong> Skulle det vara så att tippen gör ett stickprov på schaktmassorna och visar det att det är förorenat kommer vi att debitera extra för det.</p>

        <h2>Nästa steg</h2>

        <p>För att boka tjänsten och komma igång med ditt stenprojekt gör du så här:</p>
        <ul>
          <li>Acceptera offerten genom att svara på e-post eller ringa oss direkt.</li>
          <li>Välj önskat startdatum för projektet i samråd med vår projektledare.</li>
          <li>Projektering och materialleverans planeras in utifrån önskat startdatum.</li>
          <li>Underteckna och returnera Hantverkarformuläret som vårt kontrakt innan projektstart.</li>
          <li>Vi ses på plats för uppstartsgenomgång på utsatt datum!</li>
        </ul>

        <p>Denna offert är giltig i 30 dagar från dagens datum. Tveka inte att höra av dig om du har några frågor!</p>

        <div class="contact-info">
          <p><strong>Kontaktperson:</strong><br />
          Ramiro Botero, projektledare<br />
          Tel: 073 575 78 97<br />
          E-post: info@bksakeri.se<br />
          https://www.bksakeri.se</p>

          <div class="signature-section">
            <p>Vi ser fram emot att förverkliga ditt stenprojekt!</p>
            <p><strong>Med vänliga hälsningar,<br />
            Teamet på BKS AB</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate PDF from estimate data using Puppeteer
 */
export async function generateEstimatePDF(estimate: EstimateData): Promise<Buffer> {
  let browser;
  
  try {
    // Configure for Vercel serverless environment
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('PDF Generation environment:', { isProduction, nodeEnv: process.env.NODE_ENV });
    
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

    // Generate HTML content
    const htmlContent = generateHTMLContent(estimate);

    // Set page content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF with options
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          <span>BKS AB - Offert #${estimate.estimate_nr}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          <span>Sida <span class="pageNumber"></span> av <span class="totalPages"></span></span>
        </div>
      `,
      preferCSSPageSize: false
    });

    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate filename for the PDF
 */
export function generatePDFFilename(estimate: EstimateData): string {
  const clientName = estimate.lead 
    ? `${estimate.lead.first_name}_${estimate.lead.last_name}`.replace(/\s+/g, '_')
    : 'kund';
  
  const date = new Date().toISOString().split('T')[0];
  
  return `BKS_Offert_${estimate.estimate_nr}_${clientName}_${date}.pdf`;
}