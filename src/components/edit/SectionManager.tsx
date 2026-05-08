"use client";

import { useState, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SECTION_METADATA,
  SECTION_TIER,
  TIER_META,
  type SectionId,
  type SectionMeta,
  type SectionTier,
} from "@/lib/themes";

// Most universal Customize recommendations — shown by default in the
// collapsed inactive list. Everything else hides behind "Show more".
const PRIMARY_RECOMMENDATIONS: SectionId[] = ["story", "gallery"];

interface SectionManagerProps {
  activeSections: SectionId[];
  onChange: (sections: SectionId[]) => void;
  // Returns the editor JSX for a given section, or null if it has none
  // (Hero / Details / RSVP — those are managed in Steps 1 & 2). Rows whose
  // editor is null render as non-expandable.
  editorFor?: (id: SectionId) => ReactNode | null;
  expandedSections: Set<SectionId>;
  onToggleExpanded: (id: SectionId) => void;
  /** Sections that are essential and cannot be removed. They can still be
   *  reordered (drag handle stays). Removed sections may be added back via
   *  "Add more." */
  lockedSections?: ReadonlySet<SectionId>;
}

const ALL_SECTIONS = Object.keys(SECTION_METADATA) as SectionId[];

export default function SectionManager({
  activeSections,
  onChange,
  editorFor,
  expandedSections,
  onToggleExpanded,
  lockedSections,
}: SectionManagerProps) {
  // Force-pin Hero to slot 0 in the rendered list.
  const heroIdx = activeSections.indexOf("hero");
  const ordered: SectionId[] =
    heroIdx === -1
      ? ["hero", ...activeSections]
      : ["hero", ...activeSections.filter((s) => s !== "hero")];

  // Hero is rendered outside the sortable context — it's pinned and can't
  // be moved. Everything else participates in drag-to-reorder.
  const sortableItems: SectionId[] = ordered.filter((id) => id !== "hero");

  const inactive = ALL_SECTIONS.filter((id) => !ordered.includes(id));

  // Progressive reveal — start collapsed showing only primary recs.
  const [showAll, setShowAll] = useState(false);
  const primaryInactive = PRIMARY_RECOMMENDATIONS.filter((id) =>
    inactive.includes(id),
  );

  // Sensors: PointerSensor for mouse, TouchSensor for mobile/tablet,
  // KeyboardSensor for accessibility (Tab to focus, Space to grab,
  // arrows to move, Space to drop).
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 8px movement threshold so simple clicks (e.g. on the remove ✕)
      // don't initialize a drag.
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      // 200ms hold + 8px tolerance — long-press to start drag, prevents
      // accidental drags during scroll on mobile.
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = sortableItems.indexOf(active.id as SectionId);
    const toIdx = sortableItems.indexOf(over.id as SectionId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = arrayMove(sortableItems, fromIdx, toIdx);
    onChange(["hero", ...reordered]);
  }

  function addSection(id: SectionId) {
    if (ordered.includes(id)) return;
    onChange([...ordered, id]);
  }

  function removeSection(id: SectionId) {
    if (id === "hero") return;
    onChange(ordered.filter((s) => s !== id));
  }

  return (
    <div className="space-y-5">
      {/* Active sections */}
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[#A09580]">
          On your site ({ordered.length})
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-1.5">
            {/* Pinned Hero — rendered outside SortableContext */}
            <PinnedRow meta={SECTION_METADATA.hero} />

            {/* Sortable rows */}
            <SortableContext
              items={sortableItems}
              strategy={verticalListSortingStrategy}
            >
              {sortableItems.map((id) => {
                const editor = editorFor?.(id) ?? null;
                const locked = lockedSections?.has(id) ?? false;
                return (
                  <SortableRow
                    key={id}
                    id={id}
                    meta={SECTION_METADATA[id]}
                    editor={editor}
                    isExpanded={expandedSections.has(id)}
                    onToggleExpand={() => onToggleExpanded(id)}
                    onRemove={() => removeSection(id)}
                    locked={locked}
                  />
                );
              })}
            </SortableContext>
          </div>
        </DndContext>
      </div>

      {/* Available to add — collapsed by default, full tier-grouped on demand */}
      {inactive.length > 0 && (
        <div className="space-y-5">
          {/* Divider with a small "Add more" label so users know the row
              of sections below is the available-to-add list, not part of
              the active list above. */}
          <div className="flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-[#EDE8E0]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#A09580]">
              Add more
            </span>
            <span className="h-px flex-1 bg-[#EDE8E0]" />
          </div>

          {!showAll && primaryInactive.length > 0 && (
            <div className="space-y-1.5">
              {primaryInactive.map((id) => (
                <InactiveRow
                  key={id}
                  meta={SECTION_METADATA[id]}
                  onAdd={() => addSection(id)}
                />
              ))}
            </div>
          )}

          {showAll &&
            (["personal", "guests", "extras"] as SectionTier[]).map((tier) => {
              const tierSections = inactive.filter(
                (id) =>
                  id !== "hero" &&
                  SECTION_TIER[id as Exclude<SectionId, "hero">] === tier,
              );
              if (tierSections.length === 0) return null;
              const meta = TIER_META[tier];
              return (
                <div key={tier}>
                  <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-[#A09580]">
                    <TierIcon tier={tier} />
                    {meta.label}
                  </p>
                  <div className="space-y-1.5">
                    {tierSections.map((id) => (
                      <InactiveRow
                        key={id}
                        meta={SECTION_METADATA[id]}
                        onAdd={() => addSection(id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Show more / fewer toggle — only renders when there's something to reveal */}
          {(showAll || inactive.length > primaryInactive.length) && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#5C4F3D] underline decoration-transparent underline-offset-2 transition-all hover:text-[#1A1A1A] hover:decoration-[#1A1A1A]"
            >
              {showAll ? "Show fewer options" : "Show more options"}
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
                style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sortable row (drag-enabled) ────────────────────────────────────

function SortableRow({
  id,
  meta,
  editor,
  isExpanded,
  onToggleExpand,
  onRemove,
  locked = false,
}: {
  id: SectionId;
  meta: SectionMeta;
  editor: ReactNode | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  locked?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const hasEditor = editor !== null && editor !== undefined;
  const expanded = hasEditor && isExpanded;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-lg border bg-white transition-shadow ${
        isDragging
          ? "border-[#1A1A1A] shadow-lg"
          : "border-[#EDE8E0]"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle — only this element triggers the drag (so the rest
            of the row remains scrollable / clickable on touch). */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${meta.label}`}
          className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-[#C4B8A4] hover:text-[#5C4F3D] active:cursor-grabbing"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>

        {hasEditor ? (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            className="min-w-0 flex-1 text-left"
          >
            <SectionInfo meta={meta} />
          </button>
        ) : (
          <SectionInfo meta={meta} />
        )}

        {/* Right cluster: price (top) + action buttons (below). */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          {(meta.priceCents ?? 0) > 0 && (
            <PriceLabel priceCents={meta.priceCents!} />
          )}
          <div className="flex items-center">
            {hasEditor && (
              <button
                type="button"
                onClick={onToggleExpand}
                aria-label={expanded ? `Collapse ${meta.label}` : `Expand ${meta.label}`}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#A09580] transition-colors hover:bg-[#FAF7F2] hover:text-[#1A1A1A]"
              >
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                  style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            )}

            {!locked && (
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${meta.label}`}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#A09580] transition-colors hover:bg-[#FAF7F2] hover:text-[#C53030]"
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
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-[#EDE8E0] bg-[#FDFBF7] px-3 py-3">
          {editor}
        </div>
      )}
    </div>
  );
}

// ─── Pinned row (Hero — always at top, can't drag, can't remove) ────

function PinnedRow({ meta }: { meta: SectionMeta }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#EDE8E0] bg-[#FAF7F2] px-3 py-2.5">
      {/* Pin icon sits where the drag handle lives on sortable rows —
          fills the alignment slot AND signals the row is pinned. */}
      <span
        aria-label="Pinned"
        title="Pinned"
        className="flex h-7 w-5 shrink-0 items-center justify-center text-[#C4917B]"
      >
        <PinIcon />
      </span>
      <SectionInfo meta={meta} />
    </div>
  );
}

// ─── Inactive row (in "Add more" list) ──────────────────────────────

function InactiveRow({
  meta,
  onAdd,
}: {
  meta: SectionMeta;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#EDE8E0] bg-[#FAF7F2] px-3 py-2.5">
      <SectionInfo meta={meta} />
      <div className="flex shrink-0 flex-col items-center gap-1">
        {(meta.priceCents ?? 0) > 0 && (
          <PriceLabel priceCents={meta.priceCents!} />
        )}
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full bg-[#1A1A1A] px-3 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#2C2C2C]"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

// ─── Shared section label/description block ─────────────────────────

function SectionInfo({ meta }: { meta: SectionMeta }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span className="text-[13px] font-medium text-[#1A1A1A]">
          {meta.label}
        </span>
        {(meta.priceCents ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#D4A943]/30 bg-[#FFF8E7] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-widest text-[#8B6914]">
            <svg
              className="h-2.5 w-2.5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4z" />
            </svg>
            Premium
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[11px] text-[#8B7355]">{meta.description}</p>
    </div>
  );
}

// Pin icon — replaces the "· Pinned" text on the Hero row. Stylized
// thumbtack: a head sitting on top of a vertical needle.
// Small dark-gold price label rendered above the action cluster on premium
// rows (`+₱199` above the chevron+× on active rows; above the +Add button
// on inactive rows). No background pill — it lives in a column with the
// action button(s) below, so the column itself groups the elements.
function PriceLabel({ priceCents }: { priceCents: number }) {
  return (
    <span
      aria-label={`Adds ₱${priceCents / 100} at publish`}
      className="text-[10px] text-[#1A1A1A]"
    >
      ₱{priceCents / 100}
    </span>
  );
}

function PinIcon() {
  return (
    <svg
      className="h-4 w-4 -rotate-18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* head: top bar + tapered shoulders */}
      <path d="M9 4h6" />
      <path d="M9 4v3l-3 3v2h12v-2l-3-3V4" />
      {/* needle */}
      <path d="M12 12v8" />
    </svg>
  );
}

// ─── Tier icons (small heroicons-style outline SVGs) ────────────────

function TierIcon({ tier }: { tier: SectionTier }) {
  const path =
    tier === "personal"
      ? // Sparkle
        "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
      : tier === "guests"
        ? // Envelope
          "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        : // Gift
          "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z";
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}
