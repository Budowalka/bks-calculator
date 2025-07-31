"use client";

import { useFormContext } from '../form-context';
import { FormWrapper } from '../form-wrapper';
import { SliderInput } from '@/components/ui/slider-input';

export function AreaInputStep() {
  const { 
    formData, 
    updateFormData, 
    markStepCompleted 
  } = useFormContext();

  const area = formData.area || 50;

  const handleAreaChange = (newArea: number) => {
    updateFormData({ area: newArea });
    markStepCompleted(2);
  };

  return (
    <FormWrapper
      title="Hur stor är ytan som ska anläggas?"
      description="Ange ungefärlig storlek - vi mäter exakt vid hembesök"
    >
      <div className="space-y-8">
        <SliderInput
          value={area}
          onChange={handleAreaChange}
          min={10}
          max={500}
          step={5}
          unit="m²"
          helpText="Du kan justera värdet med slidern eller ange exakt siffra"
          className="max-w-md mx-auto"
        />

        {/* Visual size reference */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-sm text-foreground">
            Storleksreferens för {area}m²:
          </h3>
          <div className="text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Ungefär som:</div>
              <div className="font-medium">
                {area < 25 ? 'Liten terrass' :
                 area < 50 ? 'Medelstor uteplats' :
                 area < 100 ? 'Enkel garageuppfart' :
                 area < 200 ? 'Dubbel garageuppfart' :
                 'Stor parkering'}
              </div>
            </div>
          </div>
        </div>

        {/* Area validation message */}
        {area < 10 && (
          <div className="text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm text-destructive">
              Minsta område för professionell stenläggning är 10m²
            </p>
          </div>
        )}

        {area > 300 && (
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700">
              För stora projekt över 300m² rekommenderas platsbesök för exakt offert
            </p>
          </div>
        )}
      </div>
    </FormWrapper>
  );
}