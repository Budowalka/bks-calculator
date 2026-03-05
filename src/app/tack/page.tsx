"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuoteDisplay } from '@/components/quote/QuoteDisplay';
import { ExitIntentModal } from '@/components/quote/ExitIntentModal';
import { QuoteResponse } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { trackQuotePageView, pushEnhancedConversions } from '@/lib/analytics';
import { StickyHeader } from '@/components/landing/StickyHeader';
import { Footer } from '@/components/landing/Footer';

export default function ThankYouPage() {
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('User attempting to leave thank you page - showing CTA modal');
      e.preventDefault();
      setShowExitModal(true);
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const cleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };

    let retryCount = 0;
    const maxRetries = 3;

    const loadQuoteData = () => {
      try {
        console.log(`Thank you page attempt ${retryCount + 1}, checking for quote data...`);
        const storedQuoteData = localStorage.getItem('bks-quote-data');
        console.log('Stored quote data found:', !!storedQuoteData);

        if (storedQuoteData) {
          const parsedData = JSON.parse(storedQuoteData);
          console.log('Quote data parsed successfully:', {
            success: parsedData.success,
            hasQuote: !!parsedData.quote,
            quoteId: parsedData.quote?.quote_id
          });

          if (parsedData.success && parsedData.quote && parsedData.quote.items && Array.isArray(parsedData.quote.items)) {
            setQuoteData(parsedData);
            trackQuotePageView(parsedData.quote.quote_id);
            if (parsedData.customerInfo) {
              pushEnhancedConversions({
                email: parsedData.customerInfo.email,
                phone_number: parsedData.customerInfo.phone,
                first_name: parsedData.customerInfo.first_name,
                last_name: parsedData.customerInfo.last_name,
              });
            }
            localStorage.removeItem('bks-quote-data');
            console.log('Quote data validated, loaded and cleared from localStorage');
            setLoading(false);
            return true;
          } else {
            console.error('Invalid quote data structure:', parsedData);
            localStorage.removeItem('bks-quote-data');
            return false;
          }
        } else {
          console.log('No quote data found in localStorage');
          return false;
        }
      } catch (error) {
        console.error('Error loading quote data:', error);
        return false;
      }
    };

    const attemptLoad = () => {
      const success = loadQuoteData();

      if (success) {
        return;
      }

      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`Retrying in 1 second (attempt ${retryCount + 1}/${maxRetries})...`);
        setTimeout(attemptLoad, 1000);
      } else {
        console.log('Max retries reached, redirecting to /kalkyl');
        setLoading(false);
        setTimeout(() => {
          router.push('/kalkyl');
        }, 3000);
      }
    };

    attemptLoad();

    return cleanup;
  }, [router]);

  const handleCloseModal = () => {
    setShowExitModal(false);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    window.removeEventListener('beforeunload', () => {});
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center font-body">
        <StickyHeader />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-stone-500 font-body">Laddar din offert...</p>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col font-body">
        <StickyHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Ingen offert hittades</div>
              <p className="text-sm">Vänligen fyll i kalkylatorn igen för att få din offert.</p>
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 font-body flex flex-col">
      <StickyHeader />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <QuoteDisplay quoteData={quoteData} />
          </div>
        </div>
      </main>
      <Footer />

      <ExitIntentModal
        isOpen={showExitModal}
        onClose={handleCloseModal}
        onConfirmExit={handleConfirmExit}
        customerInfo={quoteData?.customerInfo}
      />
    </div>
  );
}
