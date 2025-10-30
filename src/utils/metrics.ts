// Simple client-side metrics utility. Stores events in-memory and logs to console.
// Can be wired to GA/Pixel later from one place.

type EventPayload = Record<string, any>;

type MetricEvent = {
  name: string;
  payload?: EventPayload;
  ts: number;
};

const listeners: Array<(ev: MetricEvent) => void> = [];
const buffer: MetricEvent[] = [];

export function recordEvent(name: string, payload?: EventPayload) {
  const event: MetricEvent = { name, payload, ts: Date.now() };
  try {
    // Avoid leaking PII; keep payload minimal by convention.
    console.debug('[metrics]', name, payload || {});
    buffer.push(event);
    listeners.forEach((l) => l(event));
  } catch (err) {
    // no-op
  }
}

export function onEvent(cb: (ev: MetricEvent) => void) {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function getBufferedEvents() {
  return [...buffer];
}