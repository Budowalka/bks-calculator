"use client";

import { useFormContext } from '../form-context';
import { FormWrapper } from '../form-wrapper';
import { OptionCard } from '@/components/ui/option-card';
import { GROUTING_OPTIONS } from '@/lib/constants';
import { FormData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export function GroutingStep() {
  const { 
    formData, 
    updateFormData, 
    markStepCompleted,
    nextStep
  } = useFormContext();

  const selectedGrouting = formData.fog;

  const handleGroutingSelect = (fog: FormData['fog']) => {
    updateFormData({ fog });
    markStepCompleted(5);
    
    // Auto-advance after selection
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  return (
    <FormWrapper
      title="Vilken typ av fogsand föredrar du?"
      description="Ditt val påverkar hållbarheten och underhållsbehovet av stenläggningen"
      nextDisabled={!selectedGrouting}
      hideNavigation={true}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {GROUTING_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              title={option.title}
              description={option.description}
              selected={selectedGrouting === option.value}
              onClick={() => handleGroutingSelect(option.value as FormData['fog'])}
              className="text-left"
            >
              {option.popular && (
                <Badge variant="secondary" className="mt-2">
                  🔥 Populärt val
                </Badge>
              )}
            </OptionCard>
          ))}
        </div>
      </div>
    </FormWrapper>
  );
}