import { useEffect, useMemo, useState } from 'react';
import { parseEventDateTime } from '../lib/eventDateTime';
import { InvitationExpirationResult } from '../lib/invitationExpiration';

/**
 * Live invitation expiration hook.
 *
 * - Re-derives the event instant from the SAME `date` + `time` strings used
 *   everywhere else (countdown, event card, server), so no single renderer
 *   can disagree with the others.
 * - Ticks once per second and recomputes from `Date.now()` (never from a
 *   decremented value), so it stays correct across tab throttling, device
 *   timezone differences, and browser refresh.
 * - Flips ACTIVE → EXPIRED automatically the moment the event instant is
 *   reached — no manual refresh required.
 */
export const useInvitationExpiration = (
  date: string,
  time: string
): InvitationExpirationResult => {
  const event = useMemo(() => parseEventDateTime(date, time), [date, time]);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!event.valid) {
    return { status: 'active', valid: false, event, remainingMs: 0 };
  }

  const remainingMs = event.targetMs - now;
  return {
    status: remainingMs <= 0 ? 'expired' : 'active',
    valid: true,
    event,
    remainingMs: Math.max(0, remainingMs),
  };
};
