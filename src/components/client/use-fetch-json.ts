"use client";

import { useEffect, useState } from "react";

type Result<T> = { url: string; data?: T; error?: string; ms: number; bytes: number };

/**
 * The classic SPA data-fetching pattern: render first, THEN fetch in an
 * effect, then render again with the data. Also measures time and payload.
 */
export function useFetchJson<T>(url: string | null) {
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    const started = performance.now();
    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        const text = await res.text();
        const ms = Math.round(performance.now() - started);
        const bytes = new TextEncoder().encode(text).length;
        if (!res.ok) throw new Error(JSON.parse(text).error ?? res.statusText);
        setResult({ url, data: JSON.parse(text) as T, ms, bytes });
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setResult({ url, error: err.message, ms: 0, bytes: 0 });
      });
    return () => controller.abort();
  }, [url]);

  return {
    data: result?.data,
    error: result?.error,
    ms: result?.ms,
    bytes: result?.bytes,
    /** true while the data for the CURRENT url hasn't arrived (old data may still be shown) */
    loading: result?.url !== url,
    setData: (data: T) => url && setResult((r) => ({ url, data, ms: r?.ms ?? 0, bytes: r?.bytes ?? 0 })),
  };
}
