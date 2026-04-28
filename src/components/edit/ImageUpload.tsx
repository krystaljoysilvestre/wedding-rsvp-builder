"use client";

import { useState, useRef, useCallback } from "react";
import { processImage, validateFile } from "@/lib/image";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
}

export default function ImageUpload({
  label,
  value,
  onChange,
}: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      setLoading(true);
      try {
        const url = await processImage(file);
        onChange(url);
      } catch {
        setError("Failed to process image.");
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  if (value) {
    return (
      <div>
        <p
          className="mb-2 text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{ color: "#8B7355" }}
        >
          {label}
        </p>
        <div className="group relative overflow-hidden rounded-xl border border-[#EDE8E0]/60">
          <div
            className="h-36 bg-cover bg-center"
            style={{ backgroundImage: `url('${value}')` }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-white/90 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A] backdrop-blur-sm hover:bg-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="rounded-full bg-white/90 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-red-500 backdrop-blur-sm hover:bg-white"
            >
              Remove
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      {label && (
        <p
          className="mb-1.5 text-[12px] font-medium"
          style={{ color: "#5C4F3D" }}
        >
          {label}
        </p>
      )}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-300"
        style={{
          borderColor: dragging ? "#B8A48E" : "#E0D9CE",
          background: dragging ? "#FAF7F2" : "#FDFBF7",
        }}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#B8A48E] border-t-transparent" />
            <span className="text-[11px] text-[#8B7355]">Processing...</span>
          </div>
        ) : (
          <>
            <svg
              className="mb-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#B8A48E"
              strokeWidth={1.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
            <p className="text-[11px] font-medium text-[#8B7355]">
              {dragging ? "Drop your image here" : "Click or drag to upload"}
            </p>
            <p className="mt-0.5 text-[10px] text-[#C4B8A4]">
              JPG, PNG — max 5MB
            </p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] text-red-500">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
