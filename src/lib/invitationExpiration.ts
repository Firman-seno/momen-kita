/* ============================================================
   INVITATION EXPIRATION — global, time-based, reusable
   ------------------------------------------------------------
   ONE expiration system shared by EVERY template. It never
   derives its answer from the rendered countdown digits; it
   compares the CURRENT wall-clock instant against the event's
   absolute instant (anchored to Asia/Jakarta by
   eventDateTime.ts). A countdown is only a display of the same
   math, so the two can never disagree.

   Rules:
     - currentTime >= eventDateTime  →  status = 'expired'
     - otherwise                     →  status = 'active'
     - unparseable / empty event     →  status = 'active' but
       valid = false (NEVER auto-expire on broken data).
   ============================================================ */
import { parseEventDateTime, EventDateTime } from './eventDateTime';

export type InvitationExpiryStatus = 'active' | 'expired';

export interface InvitationExpirationResult {
  status: InvitationExpiryStatus;
  /** True when date + time parsed cleanly; false → never auto-expires. */
  valid: boolean;
  /** Parsed event instant (targetMs anchored to WIB/WITA/WIT). */
  event: EventDateTime;
  /** Remaining ms until the event (0 when expired or invalid). */
  remainingMs: number;
}

/**
 * Pure expiration check. `now` defaults to the current instant but can be
 * injected for deterministic tests. Comparison uses timestamps only.
 */
export const computeInvitationExpiration = (
  date: string,
  time: string,
  now: number = Date.now()
): InvitationExpirationResult => {
  const event = parseEventDateTime(date, time);
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

/** Convenience boolean — true when the event instant has been reached. */
export const isInvitationExpired = (
  date: string,
  time: string,
  now: number = Date.now()
): boolean => computeInvitationExpiration(date, time, now).status === 'expired';
