"use client";

import { useFormContext } from '../form-context';
import { FormWrapper } from '../form-wrapper';
import { OptionCard } from '@/components/ui/option-card';
import { PREPARATION_OPTIONS } from '@/lib/constants';
import { FormData } from '@/lib/types';

export function PreparationStep() {
  const { 
    formData, 
    updateFormData, 
    markStepCompleted,
    nextStep
  } = useFormContext();

  const selectedPreparation = formData.forberedelse;

  const handlePreparationSelect = (forberedelse: FormData['forberedelse']) => {
    updateFormData({ forberedelse });
    markStepCompleted(3);
    
    // Auto-advance after selection
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  return (
    <FormWrapper
      title="Hur ser området ut idag?"
      description="Berätta om områdets nuvarande skick så vi kan beräkna rätt förberedelsearbeten"
      nextDisabled={!selectedPreparation}
      hideNavigation={true}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {PREPARATION_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              title={option.title}
              description={option.description}
              selected={selectedPreparation === option.value}
              onClick={() => handlePreparationSelect(option.value as FormData['forberedelse'])}
              className="text-left"
            />
          ))}
        </div>

        {/* Additional info based on selection */}
        {selectedPreparation === 'Området har inte förberetts än' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">ℹ️ Detta inkluderar:</div>
              <ul className="space-y-1 text-xs">
                <li>• Schaktarbeten (grävning)</li>
                <li>• Bortforsling av schaktmassor</li>
                <li>• Anläggning av bärlager</li>
                <li>• Packning och nivellering</li>
              </ul>
            </div>
          </div>
        )}

        {selectedPreparation === 'Området kräver lätt nivellering' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">⚡ Snabbare start:</div>
              <p className="text-xs">
                Med lätt nivellering kan vi börja snabbare och hålla kostnaderna nere.
              </p>
            </div>
          </div>
        )}

        {selectedPreparation === 'Området är utgrävt och klart för stenläggning' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">✅ Perfekt förberedelse:</div>
              <p className="text-xs">
                Vi kan börja direkt med stenläggningen vilket minskar både tid och kostnad.
              </p>
            </div>
          </div>
        )}
      </div>
    </FormWrapper>
  );
}