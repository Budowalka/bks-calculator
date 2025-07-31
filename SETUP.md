# BKS Calculator Setup Guide

This guide will help you set up the BKS Calculator application for development and production.

## Prerequisites

- Node.js 18+ installed
- An Airtable account with access to the BKS Calculator base
- Git (for version control)

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd bks-calculator-app
npm install
```

### 2. Configure Environment Variables

The application requires an Airtable API key to function. Follow these steps:

#### Get Your Airtable API Key

1. Go to [Airtable Account Settings](https://airtable.com/account)
2. Click on "Personal access tokens" in the left sidebar
3. Click "Create new token"
4. Name it "BKS Calculator" 
5. Set the following scopes:
   - `data.records:read`
   - `data.records:write` 
   - `schema.bases:read`
6. Add the base `app0hNMsMj2Luv8Ns` to "Restrict to bases"
7. Click "Create token" and copy the generated token

#### Update .env.local

Replace the placeholder in `.env.local`:

```bash
# Change this line:
AIRTABLE_API_KEY=your_airtable_api_key_here

# To your actual API key:
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Verify Airtable Base Structure

The application expects the following tables in base `app0hNMsMj2Luv8Ns`:

- **Lead_Data**: Customer information from web forms
- **Pricing_Catalog**: Master pricing components  
- **Offer_Components**: Resource breakdown and pricing
- **Resources**: Materials, labor, equipment costs
- **Estimates**: Individual customer estimates
- **Estimate_Items**: Junction table for estimate line items
- **Templates**: Document and estimate templates
- **Template_Items**: Template line item definitions

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 5. Test Form Submission

1. Fill out the complete form (all 9 steps)
2. Submit the form on the final step
3. Check the Airtable base to verify:
   - New record in Lead_Data table
   - New record in Estimates table  
   - New records in Estimate_Items table

## Troubleshooting

### Form Submission Fails

**Error: "Development Error: ..."**
- Check that your Airtable API key is correct
- Verify the base ID matches `app0hNMsMj2Luv8Ns`
- Ensure all required tables exist in the base

**Error: "Missing required field"**
- Make sure all form steps are completed
- Check that form validation passes on each step

### API Key Issues

**Error: "Unauthorized" or "Invalid API key"**
- Generate a new Personal Access Token from Airtable
- Ensure it has the correct scopes (`data.records:read`, `data.records:write`, `schema.bases:read`)
- Verify the base is added to "Restrict to bases"

### Missing Tables

**Error: "Table not found"**
- Contact the administrator to ensure all required tables exist
- Verify you have access to the correct Airtable base
- Check that table names match exactly (case-sensitive)

## Production Deployment

When deploying to production:

1. Set `NEXT_PUBLIC_SITE_URL` to your production domain
2. Use environment variables instead of `.env.local` 
3. Never commit your actual API key to version control
4. Consider using Redis for caching (optional)

## Development Notes

- The form uses a test endpoint at `/api/test-quote` for debugging
- Switch to `/api/calculate-quote` for production functionality
- Form data is stored in Airtable with Swedish language fields
- All pricing is in Swedish Kronor (SEK)

## Support

For technical issues:
- Check the browser console for detailed error messages
- Verify network requests in the dev tools
- Review the server logs for API errors

For Airtable configuration:
- Contact the database administrator
- Refer to the CLAUDE.md file for table relationships