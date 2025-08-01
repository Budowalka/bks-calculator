"use client";

import { useFormContext } from '../form-context';
import { FormWrapper } from '../form-wrapper';
import { OptionCard } from '@/components/ui/option-card';
import { USAGE_OPTIONS } from '@/lib/constants';
import { FormData } from '@/lib/types';

export function UsageStep() {
  const { 
    formData, 
    updateFormData, 
    markStepCompleted,
    nextStep
  } = useFormContext();

  const selectedUsage = formData.anvandning;

  const handleUsageSelect = (anvandning: FormData['anvandning']) => {
    updateFormData({ anvandning });
    markStepCompleted(4);
    
    // Auto-advance after selection
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  return (
    <FormWrapper
      title="Vad är syftet med ytan som ska anläggas?"
      description="Välj användning för att beräkna rätt hållfasthet och specifikationer"
      nextDisabled={!selectedUsage}
      hideNavigation={true}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {USAGE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              title={option.title}
              description={option.description}
              selected={selectedUsage === option.value}
              onClick={() => handleUsageSelect(option.value as FormData['anvandning'])}
              className="text-center"
            />
          ))}
        </div>
      </div>
    </FormWrapper>
  );
}