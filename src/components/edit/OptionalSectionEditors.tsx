"use client";

import type {
  RegistryLink,
  FaqItem,
  PartyMember,
} from "@/lib/types";
import { DebouncedInput, DebouncedTextarea } from "./DebouncedField";
import { inputClass, textareaClass } from "./FormField";
import ImageUpload from "./ImageUpload";

const MAX_GALLERY_SLOTS = 6;

// ─── Gallery ────────────────────────────────────────────────────────

export function GalleryEditor({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const slots = Array.from({ length: MAX_GALLERY_SLOTS }, (_, i) => images[i]);

  function setSlot(idx: number, url: string | undefined) {
    const next = [...images];
    if (url === undefined) {
      next.splice(idx, 1);
    } else if (idx < next.length) {
      next[idx] = url;
    } else {
      next.push(url);
    }
    onChange(next);
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((url, i) => (
        <ImageUpload
          key={i}
          label=""
          value={url}
          onChange={(u) => setSlot(i, u)}
        />
      ))}
    </div>
  );
}

// ─── Registry ───────────────────────────────────────────────────────

export function RegistryEditor({
  links,
  onChange,
}: {
  links: RegistryLink[];
  onChange: (next: RegistryLink[]) => void;
}) {
  function patch(idx: number, p: Partial<RegistryLink>) {
    onChange(links.map((l, i) => (i === idx ? { ...l, ...p } : l)));
  }
  function remove(idx: number) {
    onChange(links.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...links, { label: "", url: "" }]);
  }

  return (
    <div className="space-y-2">
      {links.map((link, i) => (
        <div
          key={i}
          className="rounded-lg border border-[#EDE8E0] bg-white p-2.5 space-y-2"
        >
          <div className="flex items-start gap-2">
            <DebouncedInput
              type="text"
              value={link.label}
              onCommit={(v) => patch(i, { label: v })}
              placeholder="Registry name"
              className={`${inputClass} flex-1`}
            />
            <RemoveButton onClick={() => remove(i)} />
          </div>
          <DebouncedInput
            type="url"
            value={link.url}
            onCommit={(v) => patch(i, { url: v })}
            placeholder="https://…"
            className={inputClass}
          />
        </div>
      ))}
      <AddRowButton label="+ Add registry link" onClick={add} />
    </div>
  );
}

// ─── FAQ ────────────────────────────────────────────────────────────

export function FaqEditor({
  items,
  onChange,
}: {
  items: FaqItem[];
  onChange: (next: FaqItem[]) => void;
}) {
  function patch(idx: number, p: Partial<FaqItem>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...p } : it)));
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...items, { question: "", answer: "" }]);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-[#EDE8E0] bg-white p-2.5 space-y-2"
        >
          <div className="flex items-start gap-2">
            <DebouncedInput
              type="text"
              value={item.question}
              onCommit={(v) => patch(i, { question: v })}
              placeholder="Question"
              className={`${inputClass} flex-1`}
            />
            <RemoveButton onClick={() => remove(i)} />
          </div>
          <DebouncedTextarea
            rows={2}
            value={item.answer}
            onCommit={(v) => patch(i, { answer: v })}
            placeholder="Answer"
            className={textareaClass}
          />
        </div>
      ))}
      <AddRowButton label="+ Add question" onClick={add} />
    </div>
  );
}

// ─── Wedding Party ──────────────────────────────────────────────────

export function PartyEditor({
  members,
  onChange,
}: {
  members: PartyMember[];
  onChange: (next: PartyMember[]) => void;
}) {
  function patch(idx: number, p: Partial<PartyMember>) {
    onChange(members.map((m, i) => (i === idx ? { ...m, ...p } : m)));
  }
  function remove(idx: number) {
    onChange(members.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...members, { name: "", role: "" }]);
  }

  return (
    <div className="space-y-2">
      {members.map((member, i) => (
        <div key={i} className="flex items-start gap-2">
          <DebouncedInput
            type="text"
            value={member.name}
            onCommit={(v) => patch(i, { name: v })}
            placeholder="Name"
            className={`${inputClass} flex-1`}
          />
          <DebouncedInput
            type="text"
            value={member.role}
            onCommit={(v) => patch(i, { role: v })}
            placeholder="Role"
            className={`${inputClass} flex-1`}
          />
          <RemoveButton onClick={() => remove(i)} />
        </div>
      ))}
      <AddRowButton label="+ Add person" onClick={add} />
    </div>
  );
}

// ─── Shared bits ────────────────────────────────────────────────────

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#A09580] transition-colors hover:bg-[#FAF7F2] hover:text-[#C53030]"
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}

function AddRowButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-dashed border-[#E0D9CE] bg-transparent px-3 py-2 text-[12px] font-medium text-[#5C4F3D] transition-colors hover:border-[#1A1A1A] hover:bg-[#FAF7F2] hover:text-[#1A1A1A]"
    >
      {label}
    </button>
  );
}
