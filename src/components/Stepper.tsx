import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isCompleted && "border-success bg-success text-success-foreground",
                  isCurrent && "border-accent bg-accent text-accent-foreground",
                  !isCompleted && !isCurrent && "border-border bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium transition-colors",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-12 sm:w-20 transition-colors",
                  step.id < currentStep ? "bg-success" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
