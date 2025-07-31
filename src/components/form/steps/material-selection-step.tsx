"use client";

import { useFormContext } from '../form-context';
import { FormWrapper } from '../form-wrapper';
import { OptionCard } from '@/components/ui/option-card';
import { MATERIAL_OPTIONS, SOCIAL_PROOF } from '@/lib/constants';
import { FormData } from '@/lib/types';

export function MaterialSelectionStep() {
  const { 
    formData, 
    updateFormData, 
    nextStep,
    markStepCompleted 
  } = useFormContext();

  const selectedMaterial = formData.materialval;

  const handleMaterialSelect = (materialval: FormData['materialval']) => {
    updateFormData({ materialval });
    markStepCompleted(1);
    
    // Auto-advance after selection
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  return (
    <FormWrapper
      title="Vilket material önskar du för stenläggningen?"
      description="Välj det material som bäst passar ditt projekt och stil"
      hideNavigation={true} // Auto-advance on selection
    >
      <div className="space-y-6">
        {/* Social proof message */}
        <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium">
            {SOCIAL_PROOF.material}
          </p>
        </div>

        {/* Material grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MATERIAL_OPTIONS.map((material) => (
            <OptionCard
              key={material.value}
              title={material.label}
              description={material.description}
              image={material.image}
              selected={selectedMaterial === material.value}
              onClick={() => handleMaterialSelect(material.value as FormData['materialval'])}
              className="hover:scale-105 transition-transform"
            />
          ))}
        </div>

        {/* Help text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Klicka på det material du föredrar för ditt projekt</p>
        </div>
      </div>
    </FormWrapper>
  );
}