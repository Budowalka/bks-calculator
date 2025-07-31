"use client";

import { useFormContext } from './form-context';
import { StepProgress } from '@/components/ui/step-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  nextDisabled?: boolean;
  nextText?: string;
  nextButtonText?: string; // New prop for custom next button text
  prevText?: string;
  hideNavigation?: boolean;
  showProgress?: boolean;
  showFinishButton?: boolean; // New prop to show finish button
}

export function FormWrapper({
  title,
  description,
  children,
  onNext,
  onPrev,
  nextDisabled = false,
  nextText = "Nästa",
  nextButtonText,
  prevText = "Tillbaka", 
  hideNavigation = false,
  showProgress = true,
  showFinishButton = false
}: FormWrapperProps) {
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep,
    isLoading 
  } = useFormContext();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else {
      prevStep();
    }
  };

  const canGoBack = currentStep > 1;
  const canGoNext = currentStep < totalSteps;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar - fixed at top */}
      {showProgress && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
          <div className="max-w-2xl mx-auto">
            <StepProgress 
              currentStep={currentStep} 
              totalSteps={totalSteps}
            />
          </div>
        </div>
      )}

      {/* Main content - scrollable */}
      <div className="flex-1 flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="shadow-lg">
                <CardHeader className="pb-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-foreground">
                      {title}
                    </h1>
                    {description && (
                      <p className="text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Step content */}
                  <div className="min-h-[200px]">
                    {children}
                  </div>

                  {/* Navigation buttons */}
                  {!hideNavigation && (
                    <div className="flex justify-between items-center pt-6 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={!canGoBack || isLoading}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {prevText}
                      </Button>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Steg {currentStep} av {totalSteps}</span>
                      </div>

                      <Button
                        onClick={handleNext}
                        disabled={(!canGoNext && !showFinishButton) || nextDisabled || isLoading}
                        className="flex items-center gap-2"
                        size={showFinishButton ? "lg" : "default"}
                      >
                        {isLoading ? (
                          "Laddar..."
                        ) : (
                          <>
                            {nextButtonText || nextText}
                            {!showFinishButton && <ArrowRight className="w-4 h-4" />}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}