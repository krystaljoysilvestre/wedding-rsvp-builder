import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function FormField({ label, children, action }: FormFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label
          className="block text-[12px] font-medium"
          style={{ color: "#5C4F3D" }}
        >
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-[#E0D9CE] bg-white px-3 py-2.5 text-[14px] text-[#1A1A1A] placeholder:text-[#A09580] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 focus:outline-none transition-all";

export const selectClass =
  "w-full rounded-lg border border-[#E0D9CE] bg-white px-3 py-2.5 text-[14px] text-[#1A1A1A] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 focus:outline-none transition-all appearance-none cursor-pointer";

export const textareaClass =
  "w-full rounded-lg border border-[#E0D9CE] bg-white px-3 py-2.5 text-[14px] text-[#1A1A1A] placeholder:text-[#A09580] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 focus:outline-none transition-all resize-y";
