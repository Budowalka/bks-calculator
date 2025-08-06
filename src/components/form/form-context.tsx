"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, CustomerInfo, FormStep, QuoteResponse } from '@/lib/types';

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
  
  // Form submission
  submitForm: () => Promise<void>;
  isSubmitting: boolean;
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
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  
  const totalSteps = 9;

  const updateFormData = useCallback((data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const updateCustomerInfo = useCallback((data: Partial<CustomerInfo>) => {
    setCustomerInfo(prev => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => (prev + 1) as FormStep);
    }
  }, [currentStep, totalSteps]);

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
    setSubmissionError(null);
    
    try {
      const response = await fetch('/api/calculate-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ett fel uppstod när offerten skulle skapas');
      }

      const result = await response.json();
      
      if (result.success) {
        setSubmissionSuccess(true);
        setQuoteData(result);
        console.log('Quote submitted successfully:', result);
        
        // Store quote data in localStorage and redirect to thank you page
        localStorage.setItem('bks-quote-data', JSON.stringify(result));
        console.log('Quote data stored in localStorage:', localStorage.getItem('bks-quote-data') ? 'success' : 'failed');
        
        // Add delay to ensure localStorage is set before redirect
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
        }, 200);
      } else {
        throw new Error(result.error || 'Ett fel uppstod när offerten skulle skapas');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Ett okänt fel uppstod');
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