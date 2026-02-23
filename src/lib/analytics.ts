// GA4 / GTM analytics utilities for BKS Calculator

type FormStepName =
  | 'material_selection'
  | 'area_input'
  | 'preparation'
  | 'usage'
  | 'grouting'
  | 'curb'
  | 'machine_access'
  | 'crane_access'
  | 'contact_info';

const STEP_NAMES: Record<number, FormStepName> = {
  1: 'material_selection',
  2: 'area_input',
  3: 'preparation',
  4: 'usage',
  5: 'grouting',
  6: 'curb',
  7: 'machine_access',
  8: 'crane_access',
  9: 'contact_info',
};

function pushToDataLayer(event: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export function trackFormStart() {
  pushToDataLayer('form_start', {
    form_name: 'bks_calculator',
  });
}

export function trackFormStep(
  stepNumber: number,
  stepValue?: string
) {
  pushToDataLayer('form_step_completed', {
    form_name: 'bks_calculator',
    form_step: stepNumber,
    form_step_name: STEP_NAMES[stepNumber] || `step_${stepNumber}`,
    form_step_value: stepValue || undefined,
  });
}

export function trackQuoteGenerated(quoteValue?: number) {
  pushToDataLayer('generate_lead', {
    form_name: 'bks_calculator',
    currency: 'SEK',
    value: quoteValue || 0,
  });
}

export function trackQuotePageView(quoteId?: string) {
  pushToDataLayer('quote_page_view', {
    form_name: 'bks_calculator',
    quote_id: quoteId || undefined,
  });
}

// Extend Window for dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
