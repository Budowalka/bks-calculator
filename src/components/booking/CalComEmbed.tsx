'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getAttribution } from '@/lib/attribution';
import { trackCalendarLoaded, trackPhoneClick } from '@/lib/analytics';
import { Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CAL_LINK = 'bksentreprenad/platsbesok';
const CAL_ORIGIN = 'https://app.cal.com';
const FALLBACK_URL = `https://cal.com/${CAL_LINK}`;
const FALLBACK_TIMEOUT_MS = 12000;

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & {
      q?: unknown[];
      ns?: Record<string, unknown>;
      loaded?: boolean;
    };
  }
}

export function CalComEmbed() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const initedRef = useRef(false);

  const configureEmbed = useCallback(() => {
    const Cal = window.Cal;
    if (!Cal) return;

    const attribution = getAttribution();
    const config: Record<string, string> = { theme: 'light' };

    if (attribution.utm_source) config['utm_source'] = attribution.utm_source;
    if (attribution.utm_medium) config['utm_medium'] = attribution.utm_medium;
    if (attribution.utm_campaign) config['utm_campaign'] = attribution.utm_campaign;
    if (attribution.gclid) config['metadata[gclid]'] = attribution.gclid;

    Cal('inline', {
      elementOrSelector: '#cal-inline-embed',
      calLink: CAL_LINK,
      layout: 'month_view',
      config,
    });

    Cal('ui', {
      styles: { branding: { brandColor: '#2563eb' } },
      hideEventTypeDetails: false,
    });
  }, []);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    // Cal.com bootstrap: create queue function BEFORE loading embed.js
    (function (C: Window, A: string, L: string) {
      const p = function (a: { q: unknown[] }, ar: unknown) { a.q.push(ar); };
      const d = C.document;
      C.Cal = C.Cal || function (..._args: unknown[]) {
        const cal = C.Cal!;
        const ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          const s = d.createElement('script');
          s.src = A;
          s.async = true;
          d.head.appendChild(s);
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function (..._innerArgs: unknown[]) {
            p(api as unknown as { q: unknown[] }, arguments);
          } as unknown as { q: unknown[] };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            (cal.ns as Record<string, unknown>)[namespace] = (cal.ns as Record<string, unknown>)[namespace] || api;
            p((cal.ns as Record<string, { q: unknown[] }>)[namespace], ar);
            p(cal as unknown as { q: unknown[] }, ['initNamespace', namespace]);
          } else {
            p(cal as unknown as { q: unknown[] }, ar);
          }
          return;
        }
        p(cal as unknown as { q: unknown[] }, ar);
      } as Window['Cal'];
    })(window, `${CAL_ORIGIN}/embed/embed.js`, 'init');

    // Now queue the init + inline calls (processed when embed.js loads)
    window.Cal!('init', { origin: CAL_ORIGIN });
    configureEmbed();

    // Watch for the embed iframe to appear → mark as ready
    const observer = new MutationObserver(() => {
      const iframe = document.querySelector('#cal-inline-embed iframe');
      if (iframe) {
        setStatus('ready');
        trackCalendarLoaded();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        observer.disconnect();
      }
    });
    observer.observe(document.getElementById('cal-inline-embed') || document.body, {
      childList: true,
      subtree: true,
    });

    // Fallback timeout
    timeoutRef.current = setTimeout(() => {
      setStatus((prev) => (prev === 'loading' ? 'error' : prev));
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [configureEmbed]);

  return (
    <section id="boka" className="scroll-mt-24">
      <div className="mx-auto max-w-4xl">
        {/* Loading skeleton */}
        {status === 'loading' && (
          <div className="space-y-4 rounded-xl border bg-white p-8">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Laddar kalendern...
            </p>
          </div>
        )}

        {/* Cal.com inline embed container */}
        <div
          id="cal-inline-embed"
          className={status === 'loading' ? 'h-0 overflow-hidden' : ''}
          style={{ minHeight: status === 'ready' ? '500px' : undefined }}
        />

        {/* Fallback when embed fails */}
        {status === 'error' && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center space-y-4">
            <p className="text-lg font-medium text-gray-900">
              Boka direkt via Cal.com eller ring oss
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <a href={FALLBACK_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Boka på Cal.com
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                onClick={() => trackPhoneClick('calendar_fallback')}
              >
                <a href="tel:+46735757897">
                  <Phone className="h-4 w-4" />
                  073-575 78 97
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
