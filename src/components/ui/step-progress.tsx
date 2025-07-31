"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function StepProgress({ currentStep, totalSteps, className }: StepProgressProps) {
  const progressValue = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Steg {currentStep} av {totalSteps}</span>
        <span>{Math.round(progressValue)}% klart</span>
      </div>
      <Progress 
        value={progressValue} 
        className="h-2"
      />
    </div>
  );
}