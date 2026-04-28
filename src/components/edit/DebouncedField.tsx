"use client";

import {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const DEFAULT_DEBOUNCE_MS = 250;

interface DebouncedInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onCommit: (value: string) => void;
  debounceMs?: number;
}

export function DebouncedInput({
  value,
  onCommit,
  onBlur,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  ...props
}: DebouncedInputProps) {
  const [local, setLocal] = useState(value);
  const timeoutRef = useRef<number | null>(null);

  // Sync from external value changes (AI generate, programmatic updates).
  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function scheduleCommit(next: string) {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      if (next !== value) onCommit(next);
    }, debounceMs);
  }

  function flushCommit() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (local !== value) onCommit(local);
  }

  return (
    <input
      {...props}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        scheduleCommit(e.target.value);
      }}
      onBlur={(e) => {
        flushCommit();
        onBlur?.(e);
      }}
    />
  );
}

interface DebouncedTextareaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
  > {
  value: string;
  onCommit: (value: string) => void;
  debounceMs?: number;
}

export function DebouncedTextarea({
  value,
  onCommit,
  onBlur,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  ...props
}: DebouncedTextareaProps) {
  const [local, setLocal] = useState(value);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function scheduleCommit(next: string) {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      if (next !== value) onCommit(next);
    }, debounceMs);
  }

  function flushCommit() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (local !== value) onCommit(local);
  }

  return (
    <textarea
      {...props}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        scheduleCommit(e.target.value);
      }}
      onBlur={(e) => {
        flushCommit();
        onBlur?.(e);
      }}
    />
  );
}
