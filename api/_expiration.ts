/* ============================================================
   Server-side invitation expiration
   ------------------------------------------------------------
   Mirrors src/lib/eventDateTime.ts so the SERVER computes the
   SAME WIB-anchored event instant as the client. The server check
   is authoritative: direct API calls (RSVP / wishes) and /i/:slug
   rendering must never accept an invitation whose event time has
   passed, no matter what a crafted client claims.

   KEEP THIS FILE IN SYNC with src/lib/eventDateTime.ts parsing.
   Deliberately self-contained (no imports outside api/) so Vercel
   functions always bundle it standalone.
   ============================================================ */

export interface ServerExpiration {
  /** True when the event date parsed cleanly; false → never auto-expire. */
  valid: boolean;
  /** Absolute event instant (epoch ms) anchored to WIB/WITA/WIT. */
  targetMs: number;
  /** True when the current instant has reached the event instant. */
  expired: boolean;
}

const ID_MONTHS: Record<string, number> = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, agu: 8, sep: 9,
  okt: 10, nov: 11, des: 12,
};

const WEEKDAY_PREFIX = /^(senin|selasa|rabu|kamis|jumat|jum'at|sabtu|minggu|ahad),?\s*/i;

interface ParsedDate { y: number; m: number; d: number }
interface ParsedTime { h: number; min: number; s: number }

function checkDay(y: number, m: number, d: number): ParsedDate | null {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (y < 1970 || y > 2200 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const ms = Date.UTC(y, m - 1, d);
  const dt = new Date(ms);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== m || dt.getUTCDate() !== d) {
    return null; // e.g. 31 February
  }
  return { y, m, d };
}

function parseDay(dateStr: string): ParsedDate | null {
  const s = (dateStr ?? '').trim().replace(WEEKDAY_PREFIX, '');
  if (!s) return null;

  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    return checkDay(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10));
  }

  m = s.match(/^(\d{1,2})[\s/.-](\d{1,2})[\s/.-](\d{4})/);
  if (m) {
    return checkDay(parseInt(m[3], 10), parseInt(m[2], 10), parseInt(m[1], 10));
  }

  m = s.match(/^(\d{1,2})\s+([A-Za-z.]+)\s+(\d{4})/);
  if (m) {
    const month = ID_MONTHS[m[2].replace(/\./g, '').toLowerCase()];
    if (!month) return null;
    return checkDay(parseInt(m[3], 10), month, parseInt(m[1], 10));
  }

  return null;
}

function parseTime(timeStr: string): ParsedTime | null {
  const s = (timeStr ?? '').trim();
  if (!s) return null;

  const m = s.match(/(\d{1,2})[:.](\d{1,2})(?::(\d{1,2}))?/);
  if (!m) return null;

  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const sec = m[3] ? parseInt(m[3], 10) : 0;
  if (h > 23 || min > 59 || sec > 59) return null;

  if (/pm|petang|sore|malam/i.test(s)) {
    if (h >= 1 && h <= 11) h += 12;
  } else if (/am|pagi/i.test(s) && h === 12) {
    h = 0;
  }

  return { h, min, s: sec };
}

/** Defaults to WIB (UTC+7); "WITA" → +8, "WIT" → +9. */
function tzOffsetHrs(timeStr: string): number {
  const s = (timeStr ?? '').toUpperCase();
  if (s.includes('WITA')) return 8;
  if (s.includes('WIT')) return 9;
  return 7;
}

/**
 * Expiration check for an invitation's stored eventDate + eventTime.
 * `now` is injectable for deterministic tests (defaults to the server clock).
 * Unparseable data NEVER auto-expires (valid=false).
 */
export function computeInvitationExpiration(
  dateStr: string,
  timeStr: string,
  now: number = Date.now()
): ServerExpiration {
  const date = parseDay(dateStr);
  if (!date) {
    return { valid: false, targetMs: 0, expired: false };
  }

  const time = parseTime(timeStr) ?? { h: 23, min: 59, s: 59 };
  const tz = tzOffsetHrs(timeStr);
  const targetMs = Date.UTC(date.y, date.m - 1, date.d, time.h - tz, time.min, time.s);

  return { valid: true, targetMs, expired: now >= targetMs };
}
