// Core types for the BKS Calculator application

export interface FormData {
  // Material and project specifications
  materialval: 'Asfalt' | 'Marksten' | 'Betongplattor' | 'Smågatsten' | 'Storgatsten' | 'Granithällar' | 'Skiffer';
  area: number;
  forberedelse: 'Området har inte förberetts än' | 'Området kräver lätt nivellering' | 'Området är utgrävt och klart för stenläggning';
  anvandning: 'Trafikyta' | 'Gångyta';
  fog: 'Ögreshämande fogsand' | 'Flexibel hårdfog';
  
  // Curb specifications
  kantsten_need: 'Ja' | 'Nej';
  kantsten_langd?: number;
  materialval_kantsten?: 'Betongkantsten' | 'Granitkantsten';
  
  // Site access
  plats_maskin?: 'Plats för att köra in med 1,5 ton maskin ca 1 m bredd' | 'Plats för att köra in med 3 ton maskin ca 1,5 m bredd' | 'Plats för att köra in med 6 ton maskin ca 2 m bredd';
  plats_kranbil?: 'Ja' | 'Nej';
  
  // Contact information
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CustomerInfo {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address?: string;
  marketing_consent?: boolean;
}

// Helper interface for form submission
export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface QuoteItem {
  id?: string;
  name: string;
  category: 'Maskinflytt' | 'Schakt' | 'Underarbete' | 'Stenläggning' | 'Fogning' | 'Bortforsling';
  quantity: number;
  unit: string;
  unit_price_sek: number;
  total_sek: number;
  labor_max?: number;
  description?: string;
}

export interface Quote {
  quote_id: string;
  items: QuoteItem[];
  categories_summary: Record<string, number>;
  total_sek: number;
  total_sek_with_vat: number;
  estimated_days: number;
  valid_until: string;
}

export interface QuoteResponse {
  success: boolean;
  quote?: Quote;
  customerInfo?: CustomerInfo;
  disclaimer: {
    title: string;
    content: string;
  };
  next_steps: {
    title: string;
    content: string;
    cta_text: string;
    cta_url: string;
  };
  error?: string;
}

export interface PricingComponent {
  id: string;
  'Component Name': string;
  Unit: string;
  'Unit Price': number;
  'Used in Automatic Calculator': boolean;
  Stage?: string;
  labor_rate?: number;
  labor_max?: number;
}

export interface MaterialOption {
  value: string;
  label: string;
  image: string;
  description: string;
}

// Form step types
export type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface StepProps {
  formData: Partial<FormData>;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: FormStep;
  totalSteps: number;
}