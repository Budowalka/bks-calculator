'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Phone, ArrowLeft, Clock, FileText, Home } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackBookingConfirmed, pushEnhancedConversions } from '@/lib/analytics';

export function BookingConfirmation() {
  const searchParams = useSearchParams();

  useEffect(() => {
    trackBookingConfirmed();

    // Enhanced Conversions — push user data from Cal.com redirect params
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    if (email || name) {
      const nameParts = name?.split(' ') || [];
      pushEnhancedConversions({
        email: email || undefined,
        first_name: nameParts[0] || undefined,
        last_name: nameParts.slice(1).join(' ') || undefined,
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success banner */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <AlertDescription>
              <div className="font-bold text-green-800 text-lg mb-1">
                Tack! Ditt hembesök är bokat
              </div>
              <p className="text-sm text-green-700">
                Du får en bekräftelse till din e-post inom kort.
              </p>
            </AlertDescription>
          </Alert>

          {/* What happens next */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Vad händer nu?
              </h2>
              <div className="space-y-4">
                <Step
                  icon={<Clock className="w-5 h-5 text-blue-600" />}
                  title="Hembesök (45–60 min)"
                  description="Vi besöker dig på avtalad tid, mäter upp ytan och diskuterar dina önskemål."
                />
                <Step
                  icon={<FileText className="w-5 h-5 text-blue-600" />}
                  title="Offert inom 48 timmar"
                  description="Efter besöket får du en detaljerad offert med exakta priser anpassade för ditt projekt."
                />
                <Step
                  icon={<Home className="w-5 h-5 text-blue-600" />}
                  title="Arbete påbörjas"
                  description="Om du godkänner offerten bokar vi in arbetet. De flesta projekt startar inom 2–4 veckor."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact info */}
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-3">
                Behöver du ändra din bokning eller har frågor?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="outline">
                  <a href="tel:+46735757897" className="gap-2">
                    <Phone className="w-4 h-4" />
                    073-575 78 97
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="mailto:ramiro@bksakeri.se">
                    ramiro@bksakeri.se
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Back to calculator */}
          <div className="text-center">
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href="/kalkyl" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Tillbaka till kalkylatorn
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
