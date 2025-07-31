import { FormProvider } from '@/components/form/form-context';
import { MultiStepForm } from '@/components/form/multi-step-form';

export default function CalculatorPage() {
  return (
    <FormProvider>
      <MultiStepForm />
    </FormProvider>
  );
}