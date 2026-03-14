import {
  RiCheckLine,
  RiBankLine,
  RiMegaphoneLine,
  RiFocus2Line,
  RiBrushLine,
  RiTaskLine,
} from "@remixicon/react";
import type { ComponentType } from "react";

interface Step {
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { label: "Conta", icon: RiBankLine },
  { label: "Campanha", icon: RiMegaphoneLine },
  { label: "Conjunto", icon: RiFocus2Line },
  { label: "Anúncios", icon: RiBrushLine },
  { label: "Revisão", icon: RiTaskLine },
];

interface StepperNavProps {
  currentStep: number;
  /** O step mais alto que o usuário já completou/pode acessar */
  maxReachedStep: number;
  onStepClick: (step: number) => void;
}

export function StepperNav({ currentStep, maxReachedStep, onStepClick }: StepperNavProps) {
  return (
    <div className="flex items-center gap-1 w-full">
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isDisabled = index > maxReachedStep;
        const Icon = step.icon;

        return (
          <div key={step.label} className="flex items-center flex-1">
            <button
              onClick={() => !isDisabled && onStepClick(index)}
              disabled={isDisabled}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 w-full justify-center
                ${isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : isCompleted
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : isDisabled
                      ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }
              `}
            >
              {isCompleted ? (
                <RiCheckLine className="size-4" />
              ) : (
                <Icon className="size-4" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`h-px w-4 mx-1 shrink-0 ${
                  isCompleted ? "bg-primary/40" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
