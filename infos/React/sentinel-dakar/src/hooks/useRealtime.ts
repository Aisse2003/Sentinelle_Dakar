import { useEffect, useRef, useState } from "react";

export type RealtimeEvent = {
  type: "alert" | "report" | "metric";
  payload: any;
  ts: string;
};

export function useRealtime(url?: string) {
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Try SSE if url provided; otherwise fallback to mock timer
    if (url) {
      try {
        const es = new EventSource(url);
        esRef.current = es;
        es.onopen = () => setConnected(true);
        es.onerror = () => setConnected(false);
        es.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            setLastEvent({ type: data.type || "metric", payload: data.payload, ts: data.ts || new Date().toISOString() });
          } catch {
            // ignore
          }
        };
      } catch {
        setConnected(false);
      }
    }

    if (!url) {
      // Mock: push a metric every 5s
      timerRef.current = window.setInterval(() => {
        const value = Math.max(0, Math.round(10 + Math.random() * 10));
        setLastEvent({ type: "metric", payload: { value }, ts: new Date().toISOString() });
      }, 5000) as unknown as number;
    }

    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [url]);

  return { lastEvent, connected };
}





