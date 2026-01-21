# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The BKS Calculator is a **Next.js application** that generates automatic preliminary quotes for paving/construction projects. The system provides instant estimates through a high-converting multi-step form and integrates with Airtable for data storage and CRM pipeline management.

### Tech Stack
- **Frontend**: Next.js 16.1.4 with React 19.2.3 and TypeScript 5.x
- **UI Components**: shadcn/ui with Tailwind CSS v4 (professional, consistent design)
- **Forms**: react-hook-form with Zod validation and Radix UI components
- **Animation**: Framer Motion for smooth transitions
- **Backend**: Next.js API routes (serverless)
- **Database**: Airtable (existing base app0hNMsMj2Luv8Ns)
- **Deployment**: Vercel-ready configuration

### Design System Requirements
- **Professional layout** with muted, stonework-appropriate colors
- **Reusable components** - consistent buttons, inputs, cards across app
- **Mobile-first responsive design** with clean typography
- **shadcn/ui integration** for professional, accessible components

### Core Features
- **Multi-step form** (9 steps) for high conversion rates
- **Visual material selection** with professional imagery
- **Real-time quote calculation** based on decision tree logic
- **Progress indicators** and smooth step transitions
- **Automatic lead capture** and Airtable CRM integration
- **Automated email system** with PDF attachments and Cal.com integration
- **SMS confirmation** via 46elks API with booking link
- **URL shortener** for Cal.com booking links (`/b/[estimateId]`)

## Airtable Architecture

The system consists of several interconnected Airtable tables:

Airtable Base ID: app0hNMsMj2Luv8Ns

### Core Tables
- **Lead_Data**: Customer information and project details from web forms
- **Pricing Catalog**: Master list of services/components with unit pricing
- **Offer Components**: Detailed resource breakdown linking pricing to resources
- **Resources**: Materials, labor, equipment with costs and margins
- **Estimates**: Individual estimates/quotes for customers
- **Estimate_Items**: Junction table connecting estimates to pricing components
- **Templates**: Document and estimate templates
- **Template_Items**: Junction table for estimate template line items

### Key Relationships
- Lead_Data → Estimates (one-to-many)
- Estimates → Estimate_Items → Pricing Catalog (many-to-many through junction)
- Templates → Template_Items → Pricing Catalog (template structure)

## Environment Configuration

### Current Environment Variables (.env.local)
```env
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=app0hNMsMj2Luv8Ns

# Application Configuration  
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=info@bksakeri.se
SENDGRID_FROM_NAME=BKS AB

# SMS Configuration (46elks) - Optional
# If not configured, SMS is gracefully skipped
ELKS_API_USERNAME=your_46elks_username
ELKS_API_PASSWORD=your_46elks_password
ELKS_SENDER_ID=BKS

# Optional - for caching (not currently used)
# REDIS_URL=your_redis_url_here
```

### Airtable Integration
- **Primary Database**: app0hNMsMj2Luv8Ns (configured and connected)
- **API Access**: Direct Airtable REST API integration via airtable npm package
- **Caching Strategy**: In-memory cache for pricing data (1 hour TTL)
- **Lead Storage**: Automatically creates Lead_Data and Estimates records
- **Table IDs**: Hard-coded in `/src/lib/airtable.ts`

### Actual Table Structure (from airtable.ts)
- **PRICING_CATALOG**: `tblljFfeR14VehcrS`
- **LEAD_DATA**: `tbljQFgvpPqYK3S8O` 
- **ESTIMATES**: `tbl8DsoZbTVbSMLTb`
- **ESTIMATE_ITEMS**: `tblH45FhG3zGfHg8p`

## Available MCP Operations

The repository is configured with Airtable MCP permissions for:
- Reading and listing tables, records, and bases
- Creating tables, fields, and records  
- Updating existing records
- Describing table structures

## Development Guidelines

### Code Structure
- **Simple, clean code** - prioritize readability over clever solutions
- **Reusable components** - create a consistent component library
- **TypeScript** - use for type safety and better developer experience
- **shadcn/ui patterns** - follow established design system conventions

### Component Architecture
```
/components
  /ui (shadcn components - button, input, card, progress, etc.)
  /form (multi-step form components and form context)
    /steps (9 individual form steps)
  /quote (quote display, summary, items table)
  /calculator (calculator logic - not yet implemented)
  /layout (layout components - not yet implemented)
```

### Styling Guidelines
- **Professional color palette** - muted grays, stone colors, accent blues
- **Consistent spacing** - use Tailwind spacing scale
- **Typography hierarchy** - clear heading levels and text sizes
- **Interactive states** - hover, focus, loading states for all controls

## API Implementation

### Automatic Quote Generation & Email Workflow
1. **Form submission** triggers `/api/calculate-quote` endpoint
2. **Decision tree logic** processes form data to select appropriate components
3. **Pricing calculation** fetches rates from Airtable Pricing Catalog
4. **Lead creation** stores customer data in Lead_Data table
5. **Estimate record** created with itemized quote in Estimates/Estimate_Items
6. **Automated workflow** triggers PDF generation and email sending:
   - **Preview PDF generation** (`/api/generate-preview-pdf`) for automatic quotes
   - **Email delivery** (`/api/send-quote-email`) with PDF attachment via SendGrid
   - **Cal.com integration** with pre-filled customer booking links

### Business Logic Flow
- **Fixed components** always included (transport, measurement, etc.)
- **Conditional components** based on decision tree (material, preparation, etc.)
- **Quantity calculations** using area and material-specific formulas
- **Total calculation** with VAT and delivery timeline estimation

### Template Categories
Standard work categories for Swedish construction projects:
- **Maskinflytt**: Machine transport and setup
- **Schakt**: Excavation work
- **Underarbete**: Foundation/base work  
- **Stenläggning**: Paving/stone laying
- **Fogning**: Grouting/joint filling
- **Bortforsling**: Waste removal/cleanup

## Data Structure Notes

- All pricing is stored in SEK (Swedish Kronor)
- Quantities support decimal precision for accurate calculations
- Template items can use quantity formulas (e.g., "area", "kantsten_length")
- Required vs optional items are tracked for template flexibility
- Sort orders maintain proper display sequence within categories

## Email & PDF System

### Automated Email Features
- **Professional Swedish content** with BKS branding and logo
- **SendGrid integration** for reliable email delivery
- **PDF attachments** with complete quote details
- **Cal.com booking links** pre-filled with customer contact information
- **Hybrid workflow architecture**:
  - **Email delivery**: Synchronous (guarantees delivery)
  - **PDF generation**: Asynchronous (optimizes performance)
- **Two-tier PDF system**:
  - **Preview PDFs**: Simplified format for automatic quotes (status="Automat")
  - **Full PDFs**: Complete detailed quotes for manual estimates
- **Serverless environment optimized** for Vercel deployment
- **UX optimized**: 5-10s wait time vs 30s previously

### Email Workflow (Hybrid Approach)
1. **Lead & Estimate Creation**: Saves customer data and quote to Airtable
2. **PDF Generation**: Asynchronous background process (doesn't block UX)
3. **Email Delivery**: Synchronous process (guarantees delivery)
4. **User Experience**: ~5-10 second wait time (vs 30s previously)
5. **PDF Attachment**: Generated on-demand if background PDF isn't ready
6. **Cal.com Integration**: Pre-filled booking links in email and Thank You page
7. **Airtable Storage**: PDF saved to estimate record (field ID: fldj1yYgAFldG0VmQ)
8. **Serverless Optimized**: Works reliably in Vercel/Next.js environment

### Cal.com Integration
- **Base URL**: `https://cal.com/bksentreprenad/platsbesok`
- **Pre-filled fields**: firstName, lastName, email, phone
- **URL encoding** handles Swedish phone number formats
- **Multiple touchpoints**: Email attachment + Thank You page CTA button
- **Consistent styling**: Green button matching PDF design
- **Fallback**: Default booking link if customer data incomplete

### Technical Architecture
- **Quote Calculation**: `/api/calculate-quote` with hybrid workflow
- **PDF Generation**: `/api/generate-preview-pdf` (background process)
- **Email Delivery**: `/api/send-quote-email` (synchronous)
- **Data Flow**: FormData → Airtable → PDF + Email → Thank You Page
- **Error Handling**: Graceful degradation, email continues if PDF fails
- **Environment**: Optimized for serverless deployment (Vercel/Next.js)

## SMS & URL Shortener System

### SMS Confirmation (46elks)
- **Provider**: 46elks Swedish SMS API
- **Trigger**: Sent after successful quote generation
- **Graceful skip**: If credentials not configured, SMS is skipped (logs `[SMS] Skipped`)
- **Phone validation**: Only Swedish mobile numbers (+46 7xx)
- **Cost**: ~0.35 SEK per SMS

### SMS Message Template
```
Hej! Tack för din förfrågan. Din offert är skickad till {email}. Boka platsbesök: smova.se/b/{estimateId}

MVh,
Ramiro Botero
BKS AB
```
- **Length**: ~150 characters (within 160 char single SMS limit)
- **Email truncation**: Emails >25 chars shortened to 22 + "..."

### URL Shortener
- **Route**: `/b/[estimateId]` → redirects to Cal.com with pre-filled data
- **Domain**: `smova.se/b/[id]`
- **Flow**:
  1. Receives Estimate ID
  2. Fetches linked Lead_Data from Airtable
  3. Generates Cal.com link with firstName, lastName, email, phone
  4. Returns 307 redirect
- **Fallback**: If no lead data, redirects to base Cal.com booking link

### SMS Technical Details
- **Files**: `/src/lib/sms/` directory
  - `46elks-client.ts` - API client with graceful credential skip
  - `sms-service.ts` - Quote confirmation SMS logic
  - `phone-formatter.ts` - Swedish phone number formatting
  - `index.ts` - Module exports
- **Environment variables**:
  - `ELKS_API_USERNAME` - 46elks API username
  - `ELKS_API_PASSWORD` - 46elks API password
  - `ELKS_SENDER_ID` - Sender name (default: "BKS")

### Recent Email System Improvements (2025-08-03)
- **Fixed PDF attachment issue**: Enhanced buffer validation and error handling in sync email workflow
- **Sent Messages Tracking**: 
  - Automatic logging of all sent emails in Lead_Data table (field: `fldu5Zr2sxaqWgK2R`)
  - Updates both "Sent Messages" (rich text) and "Last Email Sent" (timestamp) fields
  - Includes email subject, recipient, timestamp, PDF attachment status, and SendGrid message ID
  - Non-blocking implementation - email sending continues even if tracking fails
- **Enhanced debugging**: Comprehensive logging for PDF attachment handling and email delivery
- **Improved reliability**: Better validation of PDF buffers before email attachment

## Current Implementation Status

### ✅ Completed Features
- **Multi-step form** with 9 steps and form context
- **Material selection** with visual cards and images
- **Form validation** using react-hook-form and Zod
- **Progress indicators** and smooth step transitions
- **Quote calculation API** (`/api/calculate-quote`)
- **Airtable integration** for leads and estimates
- **Quote display** components with itemized breakdown
- **Professional UI** using shadcn/ui components
- **Automated email system** with SendGrid integration
- **Hybrid workflow** (async PDF + sync email for optimal UX)
- **Preview PDF generation** for automatic quotes (status="Automat") 
- **Cal.com booking integration** with pre-filled customer data
- **Two-tier PDF system** (preview vs full quotes)
- **Serverless optimization** for reliable deployment
- **Customer data management** including full address saving
- **Sent messages tracking** - automatic logging of all emails in Lead_Data table
- **Enhanced PDF attachment handling** with improved validation and debugging
- **SMS confirmation system** via 46elks API (graceful skip if no credentials)
- **URL shortener** for Cal.com booking links (`/b/[estimateId]`)

### 🚧 Form Steps Implemented
1. Material selection (7 material types)
2. Area input with slider
3. Preparation work selection
4. Usage type (traffic/pedestrian)
5. Grouting type selection
6. Curb stone requirements
7. Machine access requirements
8. Crane access requirements  
9. Contact information capture

### 📁 Key Files and Locations
- **Main app**: `/bks-calculator-app/src/app/page.tsx`
- **Form components**: `/bks-calculator-app/src/components/form/`
- **API endpoints**: `/bks-calculator-app/src/app/api/`
- **Types**: `/bks-calculator-app/src/lib/types.ts`
- **Airtable integration**: `/bks-calculator-app/src/lib/airtable.ts`
- **Business logic**: `/bks-calculator-app/src/lib/calculator.ts`
- **Email service**: `/bks-calculator-app/src/lib/email-service.ts`
- **Preview PDF generator**: `/bks-calculator-app/src/lib/preview-pdf-generator.ts`
- **Cal.com integration**: `/bks-calculator-app/src/lib/cal-link-generator.ts`
- **Email API**: `/bks-calculator-app/src/app/api/send-quote-email/`
- **Preview PDF API**: `/bks-calculator-app/src/app/api/generate-preview-pdf/`
- **SMS service**: `/bks-calculator-app/src/lib/sms/`
- **URL shortener**: `/bks-calculator-app/src/app/b/[id]/route.ts`

### 🔧 Development Commands
- **Dev server**: `npm run dev --turbopack`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Start**: `npm start`

## Claude Workspace Memories

### Development Best Practices
- **ALWAYS use Context7 for documentation lookup**: Before implementing any new features, fixing bugs, or adding dependencies, use the Context7 MCP tool to fetch the latest documentation for libraries/frameworks. This ensures you're using current APIs, following best practices, and avoiding deprecated patterns. Especially critical when debugging errors or implementing complex features.