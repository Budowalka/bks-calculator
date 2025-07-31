"use client";

import { useFormContext } from '../form-context';
import { FormWrapper } from '../form-wrapper';
import { OptionCard } from '@/components/ui/option-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MACHINE_ACCESS_OPTIONS } from '@/lib/constants';
import { FormData } from '@/lib/types';

export function MachineAccessStep() {
  const { 
    formData, 
    updateFormData, 
    markStepCompleted 
  } = useFormContext();

  const selectedAccess = formData.plats_maskin;

  const handleAccessSelect = (plats_maskin: FormData['plats_maskin']) => {
    updateFormData({ plats_maskin });
    markStepCompleted(7);
  };

  return (
    <FormWrapper
      title="Tillgänglighet för maskiner"
      description="Vilken typ av maskin kan komma fram till arbetsområdet?"
      nextDisabled={!selectedAccess}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            För att optimera arbetets genomförande behöver vi veta vilken typ av maskin som kan komma fram till området. 
            Större maskiner gör jobbet snabbare och mer kostnadseffektivt.
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {MACHINE_ACCESS_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                title={option.title}
                description={option.description}
                selected={selectedAccess === option.value}
                onClick={() => handleAccessSelect(option.value as FormData['plats_maskin'])}
                className="text-left"
              >
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span className="bg-primary/10 px-2 py-1 rounded">
                    Bredd: {option.width}
                  </span>
                  <span className="bg-secondary/50 px-2 py-1 rounded">
                    Vikt: {option.weight}
                  </span>
                </div>
              </OptionCard>
            ))}
          </div>
        </div>

        {selectedAccess && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription>
              <div className="font-medium mb-1 text-blue-800">Tips:</div>
              <p className="text-sm text-blue-700">
                {selectedAccess.includes('6 ton') && 
                  'Stor maskin ger lägst kostnad per kvadratmeter och snabbast genomförande.'
                }
                {selectedAccess.includes('3 ton') && 
                  'Medium maskin ger bra balans mellan kostnad och tillgänglighet för de flesta projekt.'
                }
                {selectedAccess.includes('1,5 ton') && 
                  'Liten maskin tar längre tid men är nödvändig för trånga utrymmen. Något högre kostnad per kvadratmeter.'
                }
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription>
            <div className="font-medium mb-1 text-amber-800">Mätning vid hembesök:</div>
            <p className="text-sm text-amber-700">
              Vi kontrollerar alltid tillgängligheten vid hembesöket för att säkerställa att rätt maskin används.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </FormWrapper>
  );
}