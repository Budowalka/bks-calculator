"use client";

import { useState, useEffect } from 'react';
import { useFormContext } from '../form-context';
import { FormWrapper } from '../form-wrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormData } from '@/lib/types';
import { ContactFormSchema } from '@/lib/validations';
import { QuoteProcessingLoader } from '@/components/ui/quote-processing-loader';

export function ContactInfoStep() {
  const { 
    formData, 
    updateFormData, 
    markStepCompleted,
    submitForm,
    isSubmitting,
    isProcessingQuote,
    submissionError,
    submissionSuccess
  } = useFormContext();

  const [localData, setLocalData] = useState({
    name: formData.name || '',
    email: formData.email || '',
    phone: formData.phone || '',
    address: formData.address || ''
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof localData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setLocalData(prev => ({ ...prev, [field]: value }));
    updateFormData({ [field]: value } as Partial<FormData>);
    // Clear error on edit
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Check if form is complete (basic non-empty check for button state)
  useEffect(() => {
    const isComplete = localData.name.trim() &&
                      localData.email.trim() &&
                      localData.phone.trim() &&
                      localData.address.trim();

    if (isComplete) {
      markStepCompleted(9);
    }
  }, [localData, markStepCompleted]);

  const isNextDisabled = !localData.name.trim() ||
                        !localData.email.trim() ||
                        !localData.phone.trim() ||
                        !localData.address.trim() ||
                        isSubmitting;

  const handleSubmit = async () => {
    // Validate with Zod before submitting
    const result = ContactFormSchema.safeParse(localData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    await submitForm();
  };

  const handleProcessingComplete = () => {
    // This callback is called when the processing loader completes its animation
    // The actual redirection is handled by the form context
    console.log('Processing loader animation completed');
  };

  return (
    <>
      {/* Processing Loader Overlay */}
      <QuoteProcessingLoader 
        isVisible={isProcessingQuote} 
        onComplete={handleProcessingComplete}
      />
    <FormWrapper
      title="Dina kontaktuppgifter"
      description="Ange dina uppgifter för att få din personliga offert"
      nextDisabled={isNextDisabled}
      nextButtonText={isSubmitting ? "Skickar..." : "Få min offert"}
      showFinishButton={true}
      onNext={handleSubmit}
    >
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            <div className="font-medium mb-1">Nästan klart!</div>
            <p className="text-sm">
              Fyll i dina uppgifter så skickar vi en detaljerad offert direkt till din e-post. 
              Vi kontaktar dig inom 24 timmar för att boka hembesök.
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Fullständigt namn *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="T.ex. Anna Andersson"
              value={localData.name}
              onChange={handleInputChange('name')}
              className={`h-11 ${fieldErrors.name ? 'border-red-500' : ''}`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefonnummer *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="T.ex. 070-123 45 67"
              value={localData.phone}
              onChange={handleInputChange('phone')}
              className={`h-11 ${fieldErrors.phone ? 'border-red-500' : ''}`}
            />
            {fieldErrors.phone && (
              <p className="text-xs text-red-500">{fieldErrors.phone}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            E-postadress *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="T.ex. anna@exempel.se"
            value={localData.email}
            onChange={handleInputChange('email')}
            className={`h-11 ${fieldErrors.email ? 'border-red-500' : ''}`}
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">
            Projektadress *
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="T.ex. Storgatan 123, 123 45 Stockholm"
            value={localData.address}
            onChange={handleInputChange('address')}
            className={`h-11 ${fieldErrors.address ? 'border-red-500' : ''}`}
          />
          {fieldErrors.address && (
            <p className="text-xs text-red-500">{fieldErrors.address}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Adressen där stenläggningen ska utföras
          </p>
        </div>

        {/* Error Display */}
        {submissionError && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="font-medium mb-1">Ett fel uppstod:</div>
              <p className="text-sm">{submissionError}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message - Show after successful submission */}
        {submissionSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              <div className="font-medium mb-1">Tack för din förfrågan!</div>
              <p className="text-sm">Du omdirigeras nu till din offert...</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Privacy Info - Show only if not submitted */}
        {!submissionSuccess && (
          <>
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <div className="font-medium mb-2">Vad händer nu?</div>
                <ul className="text-sm space-y-1">
                  <li>• Du får en detaljerad offert via e-post inom 5 minuter</li>
                  <li>• Vi kontaktar dig inom 24 timmar för att boka hembesök</li>
                  <li>• Hembesöket är kostnadsfritt och utan förpliktelser</li>
                  <li>• Vid hembesöket får du en exakt offert baserad på noggrann mätning</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Alert variant="secondary">
              <AlertDescription>
                <p className="font-medium mb-1">Integritetsskydd:</p>
                <p className="text-sm">
                  Vi använder dina uppgifter endast för att ta fram din offert och kontakta dig. 
                  Vi delar aldrig dina uppgifter med tredje part. 
                </p>
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </FormWrapper>
    </>
  );
}