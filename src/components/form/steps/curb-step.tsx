"use client";

import { useState } from 'react';
import { useFormContext } from '../form-context';
import { FormWrapper } from '../form-wrapper';
import { OptionCard } from '@/components/ui/option-card';
import { SliderInput } from '@/components/ui/slider-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CURB_MATERIAL_OPTIONS } from '@/lib/constants';
import { FormData } from '@/lib/types';

export function CurbStep() {
  const { 
    formData, 
    updateFormData, 
    markStepCompleted 
  } = useFormContext();

  const [showSubSteps, setShowSubSteps] = useState(false);
  const kantstenNeed = formData.kantsten_need;
  const kantstenLength = formData.kantsten_langd || 10;
  const kantstenMaterial = formData.materialval_kantsten;

  const handleNeedSelect = (kantsten_need: FormData['kantsten_need']) => {
    updateFormData({ kantsten_need });
    
    if (kantsten_need === 'Nej') {
      // Clear conditional fields and mark complete
      updateFormData({ 
        kantsten_langd: undefined, 
        materialval_kantsten: undefined 
      });
      markStepCompleted(6);
      setShowSubSteps(false);
    } else {
      setShowSubSteps(true);
    }
  };

  const handleLengthChange = (kantsten_langd: number) => {
    updateFormData({ kantsten_langd });
    checkCompletion();
  };

  const handleMaterialSelect = (materialval_kantsten: FormData['materialval_kantsten']) => {
    updateFormData({ materialval_kantsten });
    checkCompletion();
  };

  const checkCompletion = () => {
    if (kantstenNeed === 'Ja' && kantstenLength && kantstenMaterial) {
      markStepCompleted(6);
    }
  };

  const isNextDisabled = kantstenNeed === 'Ja' && (!kantstenLength || !kantstenMaterial);

  return (
    <FormWrapper
      title="Behov av kantsten"
      description="Kommer ditt projekt att kräva kantsten?"
      nextDisabled={isNextDisabled}
    >
      <div className="space-y-8">
        {/* Step 1: Yes/No Selection */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Behöver du kantsten?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptionCard
              title="Ja, behöver kantsten"
              description="Perfekt för att avgränsa och stabilisera stenläggningen"
              selected={kantstenNeed === 'Ja'}
              onClick={() => handleNeedSelect('Ja')}
            />
            <OptionCard
              title="Nej, ingen kantsten"
              description="Stenläggningen går direkt mot befintlig kant eller gräs"
              selected={kantstenNeed === 'Nej'}
              onClick={() => handleNeedSelect('Nej')}
            />
          </div>
        </div>

        {/* Conditional Steps - only show if "Ja" is selected */}
        {showSubSteps && kantstenNeed === 'Ja' && (
          <div className="space-y-8 border-t border-border pt-8">
            {/* Step 2: Length Input */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Längd på kantsten</h3>
              <p className="text-sm text-muted-foreground">
                Ange längden på kantsten som behövs för projektet i löpmeter (lpm).
              </p>
              <SliderInput
                value={kantstenLength}
                onChange={handleLengthChange}
                min={1}
                max={100}
                step={1}
                unit=" lpm"
                helpText="Ungefärlig längd - vi mäter exakt vid hembesök"
                className="max-w-md"
              />
            </div>

            {/* Step 3: Material Selection */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Typ av kantsten</h3>
              <p className="text-sm text-muted-foreground">
                Vilken typ av kantsten önskar du använda?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CURB_MATERIAL_OPTIONS.map((material) => (
                  <OptionCard
                    key={material.value}
                    title={material.label}
                    description={material.description}
                    image={material.image}
                    selected={kantstenMaterial === material.value}
                    onClick={() => handleMaterialSelect(material.value as FormData['materialval_kantsten'])}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            {kantstenLength && kantstenMaterial && (
              <Alert className="border-primary/20 bg-primary/5">
                <AlertDescription>
                  <div className="font-medium text-primary mb-1">Kantsten sammanfattning</div>
                  <p className="text-primary/80">
                    {kantstenLength} lpm {kantstenMaterial.toLowerCase()}
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Info for "Nej" selection */}
        {kantstenNeed === 'Nej' && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription>
              <div className="font-medium mb-1 text-green-800">Kostnadsbesparande val</div>
              <p className="text-sm text-green-700">
                Utan kantsten minskar både material- och installationskostnader.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </FormWrapper>
  );
}