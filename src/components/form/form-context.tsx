"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, CustomerInfo, FormStep, QuoteResponse } from '@/lib/types';
import { trackFormStart, trackFormStep, trackQuoteGenerated } from '@/lib/analytics';
import { getAttribution } from '@/lib/attribution';

interface FormContextType {
  // Form data
  formData: Partial<FormData>;
  customerInfo: Partial<CustomerInfo>;
  
  // Navigation
  currentStep: FormStep;
  totalSteps: number;
  
  // Actions
  updateFormData: (data: Partial<FormData>) => void;
  updateCustomerInfo: (data: Partial<CustomerInfo>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: FormStep) => void;
  
  // State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Validation
  stepErrors: Record<FormStep, string[]>;
  setStepErrors: (step: FormStep, errors: string[]) => void;
  
  // Progress tracking
  completedSteps: Set<FormStep>;
  markStepCompleted: (step: FormStep) => void;
  
  // Form submission with enhanced processing
  submitForm: () => Promise<void>;
  isSubmitting: boolean;
  isProcessingQuote: boolean;
  submissionError: string | null;
  submissionSuccess: boolean;
  quoteData: QuoteResponse | null;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
  children: React.ReactNode;
}

export function FormProvider({ children }: FormProviderProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<FormData>>({
    // Set some sensible defaults
    area: 50,
    fog: 'Ögreshämande fogsand',
    kantsten_need: 'Nej',
    plats_kranbil: 'Ja'
  });
  
  const [customerInfo, setCustomerInfo] = useState<Partial<CustomerInfo>>({});
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stepErrors, setStepErrorsState] = useState<Record<FormStep, string[]>>({} as Record<FormStep, string[]>);
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set());
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingQuote, setIsProcessingQuote] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  
  const totalSteps = 9;

  // Track form start on mount (once)
  const hasTrackedStart = useRef(false);
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackFormStart();
      hasTrackedStart.current = true;
    }
  }, []);

  const updateFormData = useCallback((data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const updateCustomerInfo = useCallback((data: Partial<CustomerInfo>) => {
    setCustomerInfo(prev => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      // Track the completed step with the selected value
      const stepKey = ['materialval', 'area', 'forberedelse', 'anvandning', 'fog', 'kantsten_need', 'plats_maskin', 'plats_kranbil', 'name'][currentStep - 1];
      const stepValue = stepKey ? String(formData[stepKey as keyof FormData] ?? '') : '';
      trackFormStep(currentStep, stepValue);

      setCurrentStep(prev => (prev + 1) as FormStep);
    }
  }, [currentStep, totalSteps, formData]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as FormStep);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: FormStep) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const setStepErrors = useCallback((step: FormStep, errors: string[]) => {
    setStepErrorsState(prev => ({
      ...prev,
      [step]: errors
    }));
  }, []);

  const markStepCompleted = useCallback((step: FormStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  }, []);

  const submitForm = useCallback(async () => {
    setIsSubmitting(true);
    setIsProcessingQuote(true);
    setSubmissionError(null);
    
    try {
      console.log('Starting quote submission...');
      
      const response = await fetch('/api/calculate-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData, attribution: getAttribution() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ett fel uppstod när offerten skulle skapas');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Quote processing completed successfully:', result);
        trackFormStep(9, formData.email || '');
        trackQuoteGenerated(result.quote?.total_sek_with_vat);
        setSubmissionSuccess(true);
        setQuoteData(result);
        
        // Store quote data in localStorage for thank you page
        localStorage.setItem('bks-quote-data', JSON.stringify(result));
        console.log('Quote data stored in localStorage:', localStorage.getItem('bks-quote-data') ? 'success' : 'failed');
        
        // Small delay to allow processing loader to complete its animation
        setTimeout(() => {
          // Double-check localStorage is set before redirecting
          const storedData = localStorage.getItem('bks-quote-data');
          if (storedData) {
            console.log('Redirecting to /tack page... localStorage confirmed');
            router.push('/tack');
          } else {
            console.error('localStorage not set properly, retrying...');
            localStorage.setItem('bks-quote-data', JSON.stringify(result));
            setTimeout(() => {
              console.log('Retrying redirect to /tack page...');
              router.push('/tack');
            }, 200);
          }
        }, 500);
      } else {
        throw new Error(result.error || 'Ett fel uppstod när offerten skulle skapas');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Ett okänt fel uppstod');
      setIsProcessingQuote(false); // Stop processing on error
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  const value: FormContextType = {
    formData,
    customerInfo,
    currentStep,
    totalSteps,
    updateFormData,
    updateCustomerInfo,
    nextStep,
    prevStep,
    goToStep,
    isLoading,
    setIsLoading,
    stepErrors,
    setStepErrors,
    completedSteps,
    markStepCompleted,
    submitForm,
    isSubmitting,
    isProcessingQuote,
    submissionError,
    submissionSuccess,
    quoteData
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}