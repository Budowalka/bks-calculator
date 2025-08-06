"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuoteDisplay } from '@/components/quote/QuoteDisplay';
import { ExitIntentModal } from '@/components/quote/ExitIntentModal';
import { QuoteResponse } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function ThankYouPage() {
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Exit intent handler - show custom CTA modal instead of browser dialog
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('User attempting to leave thank you page - showing CTA modal');
      e.preventDefault();
      setShowExitModal(true);
      return ''; // Required for some browsers
    };

    // Add exit intent listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    const cleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };

    // Main quote loading logic
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
          
          // Validate the data structure before using it
          if (parsedData.success && parsedData.quote && parsedData.quote.items && Array.isArray(parsedData.quote.items)) {
            setQuoteData(parsedData);
            // Clear the data after loading to prevent reuse
            localStorage.removeItem('bks-quote-data');
            console.log('Quote data validated, loaded and cleared from localStorage');
            setLoading(false);
            return true; // Successfully loaded
          } else {
            console.error('Invalid quote data structure:', parsedData);
            localStorage.removeItem('bks-quote-data'); // Clear invalid data
            return false; // Failed validation
          }
        } else {
          console.log('No quote data found in localStorage');
          return false; // No data found
        }
      } catch (error) {
        console.error('Error loading quote data:', error);
        return false; // Error occurred
      }
    };
    
    const attemptLoad = () => {
      const success = loadQuoteData();
      
      if (success) {
        return; // Successfully loaded, exit
      }
      
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`Retrying in 1 second (attempt ${retryCount + 1}/${maxRetries})...`);
        setTimeout(attemptLoad, 1000);
      } else {
        console.log('Max retries reached, redirecting to /kalkyl');
        setLoading(false);
        // Show error state for 3 seconds before redirecting
        setTimeout(() => {
          router.push('/kalkyl');
        }, 3000);
      }
    };
    
    // Start the loading process
    attemptLoad();

    // Return cleanup function
    return cleanup;
  }, [router]);

  // Modal handlers
  const handleCloseModal = () => {
    setShowExitModal(false);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    // Allow the user to leave by removing the beforeunload listener temporarily
    window.removeEventListener('beforeunload', () => {});
    window.close(); // Try to close the window/tab
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laddar din offert...</p>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Ingen offert hittades</div>
            <p className="text-sm">Vänligen fyll i kalkylatorn igen för att få din offert.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <QuoteDisplay quoteData={quoteData} />
        </div>
      </div>
      
      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={showExitModal}
        onClose={handleCloseModal}
        onConfirmExit={handleConfirmExit}
        customerInfo={quoteData?.customerInfo}
      />
    </div>
  );
}