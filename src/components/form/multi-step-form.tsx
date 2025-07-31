"use client";

import { useFormContext } from './form-context';

// Import form steps
import { MaterialSelectionStep } from './steps/material-selection-step';
import { AreaInputStep } from './steps/area-input-step';
import { PreparationStep } from './steps/preparation-step';
import { UsageStep } from './steps/usage-step';
import { GroutingStep } from './steps/grouting-step';
import { CurbStep } from './steps/curb-step';
import { MachineAccessStep } from './steps/machine-access-step';
import { CraneAccessStep } from './steps/crane-access-step';
import { ContactInfoStep } from './steps/contact-info-step';

export function MultiStepForm() {
  const { currentStep } = useFormContext();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <MaterialSelectionStep />;
      case 2:
        return <AreaInputStep />;
      case 3:
        return <PreparationStep />;
      case 4:
        return <UsageStep />;
      case 5:
        return <GroutingStep />;
      case 6:
        return <CurbStep />;
      case 7:
        return <MachineAccessStep />;
      case 8:
        return <CraneAccessStep />;
      case 9:
        return <ContactInfoStep />;
      default:
        return <MaterialSelectionStep />;
    }
  };

  return renderCurrentStep();
}