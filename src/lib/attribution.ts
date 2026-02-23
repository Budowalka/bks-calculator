// Attribution tracking — captures gclid and UTM params from URL

export interface Attribution {
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const STORAGE_KEY = 'bks_attribution';
const PARAMS = [
  'gclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

/**
 * Read gclid/UTM params from the current URL and save to sessionStorage.
 * Call on landing page load.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const attribution: Attribution = {};
  let hasAny = false;

  for (const param of PARAMS) {
    const value = url.searchParams.get(param);
    if (value) {
      attribution[param] = value;
      hasAny = true;
    }
  }

  if (hasAny) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  }
}

/**
 * Retrieve saved attribution data from sessionStorage.
 * Returns empty object if nothing was captured.
 */
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}
