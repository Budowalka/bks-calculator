"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Calculator, FileText, Mail, CheckCircle } from 'lucide-react';

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  duration: number; // milliseconds
  icon: React.ComponentType<{ className?: string }>;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'calculating',
    title: 'Beräknar din offert',
    description: 'Analyserar materialval, yta och arbetskostnader baserat på dina val',
    duration: 2000,
    icon: Calculator
  },
  {
    id: 'materials',
    title: 'Förbereder material och arbetskostnader',
    description: 'Matchar ditt projekt med våra leverantörer och beräknar exakta priser',
    duration: 5000,
    icon: Loader2
  },
  {
    id: 'pdf',
    title: 'Skapar din personliga offert',
    description: 'Genererar en detaljerad PDF med alla specifikationer och priser',
    duration: 10000,
    icon: FileText
  },
  {
    id: 'email',
    title: 'Skickar offert till din e-post',
    description: 'Skickar den kompletta offerten direkt till din inkorg',
    duration: 5000,
    icon: Mail
  },
  {
    id: 'complete',
    title: 'Klart!',
    description: 'Din offert är redo och skickad. Du omdirigeras nu till sammanfattningen.',
    duration: 1000,
    icon: CheckCircle
  }
];

interface QuoteProcessingLoaderProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function QuoteProcessingLoader({ isVisible, onComplete }: QuoteProcessingLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    if (!isVisible) {
      setCurrentStepIndex(0);
      setIsComplete(false);
      return;
    }

    const processSteps = async () => {
      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        setCurrentStepIndex(i);
        
        // Wait for the step duration
        await new Promise(resolve => setTimeout(resolve, PROCESSING_STEPS[i].duration));
        
        // If this is the last step, mark as complete
        if (i === PROCESSING_STEPS.length - 1) {
          setIsComplete(true);
          // Give a moment for the completion animation
          await new Promise(resolve => setTimeout(resolve, 1000));
          onComplete?.();
        }
      }
    };

    processSteps();
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const currentStep = PROCESSING_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / PROCESSING_STEPS.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
      >
        <div className="flex h-full items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg space-y-8 rounded-lg bg-card p-8 shadow-xl border"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-card-foreground">
                Skapar din offert
              </h2>
              <p className="text-sm text-muted-foreground">
                Detta tar ungefär 20-30 sekunder. Vänligen vänta...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Steg {currentStepIndex + 1} av {PROCESSING_STEPS.length}</span>
                <span>{Math.round(progress)}% klart</span>
              </div>
            </div>

            {/* Current Step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {currentStep.icon === CheckCircle ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <currentStep.icon className="w-6 h-6 text-primary animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-card-foreground">
                      {currentStep.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentStep.description}
                    </p>
                  </div>
                </div>

                {/* Step List - Show completed steps */}
                <div className="space-y-2 ml-16">
                  {PROCESSING_STEPS.slice(0, currentStepIndex + 1).map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: index < currentStepIndex ? 0.6 : 1, x: 0 }}
                      className="flex items-center space-x-2 text-xs"
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : index === currentStepIndex ? (
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-3 h-3 border-2 border-muted-foreground/30 rounded-full" />
                      )}
                      <span className={index < currentStepIndex ? "text-green-600" : "text-card-foreground"}>
                        {step.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Vi skapar din personliga offert med exakta priser och materialval
              </p>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-green-600 text-sm font-medium"
                >
                  ✓ Offerten är skickad till din e-post!
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}