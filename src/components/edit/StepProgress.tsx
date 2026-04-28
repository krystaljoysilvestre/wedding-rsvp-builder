"use client";

import { Fragment } from "react";

interface Step {
  label: string;
  complete: boolean;
}

interface StepProgressProps {
  steps: Step[];
  activeStep?: number;
  onStepClick?: (step: number) => void;
}

export default function StepProgress({
  steps,
  activeStep,
  onStepClick,
}: StepProgressProps) {
  return (
    <div className="mb-7 flex items-start">
      {steps.map((step, i) => {
        const stepNumber = i + 1;
        const isActive = activeStep === stepNumber;
        const state: "complete" | "active" | "future" = step.complete
          ? "complete"
          : isActive
            ? "active"
            : "future";

        const circleClasses =
          state === "complete"
            ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
            : state === "active"
              ? "border-[#1A1A1A] bg-[#1A1A1A] text-white ring-2 ring-[#1A1A1A]/15 ring-offset-2 ring-offset-[#FDFBF7]"
              : "border-[#E0D9CE] bg-white text-[#A09580]";

        const labelClasses =
          state === "active"
            ? "text-[#1A1A1A] font-semibold"
            : state === "complete"
              ? "text-[#5C4F3D] font-medium"
              : "text-[#A09580] font-medium";

        const StepInner = (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium transition-all duration-300 ${circleClasses}`}
            >
              {state === "complete" ? (
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3 6l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            <span
              className={`whitespace-nowrap text-[10px] uppercase tracking-[0.15em] transition-colors duration-300 ${labelClasses}`}
            >
              {step.label}
            </span>
          </div>
        );

        return (
          <Fragment key={i}>
            {onStepClick ? (
              <button
                type="button"
                onClick={() => onStepClick(stepNumber)}
                aria-current={isActive ? "step" : undefined}
                className="cursor-pointer"
              >
                {StepInner}
              </button>
            ) : (
              StepInner
            )}
            {i < steps.length - 1 && (
              <div
                className={`mx-2 mt-3 h-px flex-1 transition-colors duration-300 ${
                  step.complete ? "bg-[#1A1A1A]" : "bg-[#E0D9CE]"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
