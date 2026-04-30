"use client";

import Tooltip from "./Tooltip";

interface OpenEditorButtonProps {
  onOpen: () => void;
}

// Icon-only mirror of the editor's collapse button — appears in the preview
// header when the panel is collapsed. Same 28×28 shape + sidebar icon so
// the two states feel like one toggle, not two unrelated controls.
export default function OpenEditorButton({ onOpen }: OpenEditorButtonProps) {
  return (
    <Tooltip label="Open editor">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open editor"
        className="flex h-7 w-7 items-center justify-center rounded-md text-[#A09580] transition-colors hover:bg-[#F5F3EF] hover:text-[#1A1A1A]"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M9 5v14" />
        </svg>
      </button>
    </Tooltip>
  );
}
