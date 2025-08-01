"use client";

import { useFormContext } from '../form-context';
import { FormWrapper } from '../form-wrapper';
import { OptionCard } from '@/components/ui/option-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CRANE_ACCESS_OPTIONS } from '@/lib/constants';
import { FormData } from '@/lib/types';

export function CraneAccessStep() {
  const { 
    formData, 
    updateFormData, 
    markStepCompleted,
    nextStep
  } = useFormContext();

  const selectedAccess = formData.plats_kranbil;

  const handleAccessSelect = (plats_kranbil: FormData['plats_kranbil']) => {
    updateFormData({ plats_kranbil });
    markStepCompleted(8);
    
    // Auto-advance after selection
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  return (
    <FormWrapper
      title="Plats för lastning och lossning"
      description="Finns det plats för kranbil framför fastigheten?"
      nextDisabled={!selectedAccess}
      hideNavigation={true}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            En kranbil behöver ca 10 meter framför fastigheten för att kunna lossa material effektivt. 
            Om det inte finns plats transporteras materialet för hand, vilket påverkar priset.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRANE_ACCESS_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                title={option.title}
                description={option.description}
                selected={selectedAccess === option.value}
                onClick={() => handleAccessSelect(option.value as FormData['plats_kranbil'])}
              />
            ))}
          </div>
        </div>

        {selectedAccess && (
          <Alert className={
            selectedAccess === 'Ja' 
              ? 'border-green-200 bg-green-50' 
              : 'border-orange-200 bg-orange-50'
          }>
            <AlertDescription>
              <div className={`font-medium mb-1 ${
                selectedAccess === 'Ja' ? 'text-green-800' : 'text-orange-800'
              }`}>
                {selectedAccess === 'Ja' ? 'Perfekt!' : 'OBS:'}
              </div>
              <p className={`text-sm ${
                selectedAccess === 'Ja' ? 'text-green-700' : 'text-orange-700'
              }`}>
                {selectedAccess === 'Ja' 
                  ? 'Med kranbil kan vi lossa materialet direkt där det behövs, vilket ger lägst kostnad och snabbast genomförande.'
                  : 'Utan kranbiltillgång behöver materialet transporteras för hand från gatan. Detta tar längre tid och medför extra kostnad för handpåläggning.'
                }
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription>
            <div className="font-medium mb-1 text-blue-800">Kranbil specifikationer:</div>
            <ul className="text-sm space-y-1 mt-2 text-blue-700">
              <li>• Behöver ca 10 meter fri yta framför fastigheten</li>
              <li>• Kan lyfta material upp till 15 meter från lastbilen</li>
              <li>• Sparar tid och minskar risken för skador på material</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </FormWrapper>
  );
}