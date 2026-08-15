import { useEffect, useMemo, useState } from 'react';
import {
  computeCountdown,
  CountdownParts,
  parseEventDateTime,
} from '../lib/eventDateTime';

export interface UseCountdownOptions {
  date: string;
  time: string;
  refreshMs?: number;
}

/**
 * Live countdown for an invitation event.
 *
 * - The target instant is derived from the SAME `eventDetails.date` +
 *   `eventDetails.time` used by the Date & Time card, so the two can
 *   never disagree. Editing the invitation data automatically re-targets
 *   the countdown with zero code changes.
 * - Uses exactly ONE `setInterval` that is always cleared on unmount and
 *   whenever the event data changes (no leaks, no overlapping timers).
 * - Values are recomputed from `Date.now()` on every tick instead of being
 *   decremented, so the countdown stays accurate even after tab throttling.
 */
export const useCountdown = ({ date, time, refreshMs = 1000 }: UseCountdownOptions): CountdownParts => {
  const event = useMemo(() => parseEventDateTime(date, time), [date, time]);

  const [parts, setParts] = useState<CountdownParts>(() => computeCountdown(event));

  useEffect(() => {
    // Re-target immediately when the invitation data changes.
    setParts(computeCountdown(event));
    const timer = window.setInterval(() => setParts(computeCountdown(event)), refreshMs);
    return () => window.clearInterval(timer);
  }, [event, refreshMs]);

  return parts;
};
