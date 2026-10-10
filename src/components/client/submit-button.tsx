"use client";

import { useFormStatus } from "react-dom";

// Progressive enhancement: without JS the form still submits; with JS this
// button also shows a pending state.
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
