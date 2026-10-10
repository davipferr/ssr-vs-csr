"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};

/**
 * Important nuance: in Next.js even "use client" components are pre-rendered
 * to HTML on the server. To simulate a PURE single-page app (Vite, Create
 * React App…) the CSR pages wrap themselves in this, which renders the
 * fallback on the server and the real children only in the browser.
 */
export function ClientOnly({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true, // in the browser
    () => false, // on the server
  );
  return isClient ? children : fallback;
}
