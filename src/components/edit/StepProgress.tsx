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
    <div className="flex items-start">
      {steps.map((step, i) => {
        const stepNumber = i + 1;
        const isActive = activeStep === stepNumber;
        const state: "complete" | "active" | "future" = step.complete
          ? "complete"
          : isActive
            ? "active"
            : "future";

        const dotClasses =
          state === "complete"
            ? "border-transparent bg-[#1A1A1A] text-white"
            : state === "active"
              ? "border-transparent bg-[#1A1A1A] text-white ring-2 ring-[#1A1A1A]/10 ring-offset-2 ring-offset-[#FDFBF7]"
              : "border-[#E0D9CE] bg-white text-[#A09580]";

        const labelClasses =
          state === "active"
            ? "text-[#1A1A1A] font-medium"
            : state === "complete"
              ? "text-[#5C4F3D]"
              : "text-[#A09580]";

        const StepInner = (
          <div className="flex flex-col items-center gap-1.5">
            <div
              // The `key` flips when the chip enters "complete", remounting
              // the dot so the `step-dot-pulse` ring animation fires on
              // entry. Other transitions reuse the existing element so the
              // color tween via `transition-all` stays smooth.
              key={state === "complete" ? "complete" : "not-complete"}
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-medium transition-all duration-300 ${dotClasses} ${
                state === "complete" ? "step-dot-pulse" : ""
              }`}
            >
              {state === "complete" ? (
                <svg
                  className="step-check-pop h-2.5 w-2.5"
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
              className={`whitespace-nowrap text-[11px] transition-colors duration-300 ${labelClasses}`}
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
                className={`mx-2 mt-2.5 h-px flex-1 transition-colors duration-300 ${
                  step.complete ? "bg-[#5C4F3D]/30" : "bg-[#E0D9CE]"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
