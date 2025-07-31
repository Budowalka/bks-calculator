"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuoteDisplay } from '@/components/quote/QuoteDisplay';
import { QuoteResponse } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function ThankYouPage() {
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Try to get quote data from localStorage
    try {
      const storedQuoteData = localStorage.getItem('bks-quote-data');
      if (storedQuoteData) {
        const parsedData = JSON.parse(storedQuoteData);
        setQuoteData(parsedData);
        // Clear the data after loading to prevent reuse
        localStorage.removeItem('bks-quote-data');
      } else {
        // No quote data found, redirect back to calculator
        router.push('/kalkyl');
        return;
      }
    } catch (error) {
      console.error('Error loading quote data:', error);
      router.push('/kalkyl');
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

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
    </div>
  );
}