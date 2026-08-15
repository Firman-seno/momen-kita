/* ============================================================
   EVENT DATE & TIME — deterministic parsing + countdown math
   ------------------------------------------------------------
   MomenKita invitations carry Indonesian display strings such as
     date: "Sabtu, 13 Oktober 2026"
     time: "10.00 WIB - Selesai"

   Every parse in this module is deterministic: it NEVER relies on
   the ambiguous `new Date("...")` constructor (which browsers can
   interpret differently). Event instants are anchored to
   Asia/Jakarta (WIB, UTC+7) by construction, so the countdown is
   identical for every guest regardless of device timezone.
   ============================================================ */

export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;
export const MIN_MS = 60 * 1000;

/** Indonesian month names (full + common abbreviations). */
const ID_MONTHS: Record<string, number> = {
  januari: 1,
  februari: 2,
  maret: 3,
  april: 4,
  mei: 5,
  juni: 6,
  juli: 7,
  agustus: 8,
  september: 9,
  oktober: 10,
  november: 11,
  desember: 12,
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  jun: 6,
  jul: 7,
  agu: 8,
  sep: 9,
  okt: 10,
  nov: 11,
  des: 12,
};

/** Optional weekday prefix: "Sabtu," / "Jum'at" / "Ahad" / "Minggu" ... */
const WEEKDAY_PREFIX = /^(senin|selasa|rabu|kamis|jumat|jum'at|sabtu|minggu|ahad),?\s*/i;

export interface ParsedDate {
  y: number;
  m: number;
  d: number;
}

export interface ParsedTime {
  h: number;
  min: number;
  s: number;
}

export interface EventDateTime {
  /** false when the date could not be parsed from the invitation data. */
  valid: boolean;
  /** Absolute instant (epoch ms) of the event in Asia/Jakarta. */
  targetMs: number;
  /** Midnight (00:00) on the event's calendar day in the event timezone. */
  dayStartMs: number;
  /** Timezone offset (hours east of UTC) used to anchor the instant. */
  tzHrs: number;
  date: ParsedDate | null;
  time: ParsedTime | null;
}

/** Validate a calendar day by round-tripping through Date.UTC. */
function checkDay(y: number, m: number, d: number): ParsedDate | null {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (y < 1970 || y > 2200 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const ms = Date.UTC(y, m - 1, d);
  const dt = new Date(ms);
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() + 1 !== m ||
    dt.getUTCDate() !== d
  ) {
    return null; // e.g. 31 February
  }
  return { y, m, d };
}

/**
 * Deterministically parse the date part. Supports:
 *   - "2026-12-15"            (ISO)
 *   - "15-12-2026" / "15/12/2026" / "15.12.2026"
 *   - "15 Desember 2026" / "15 Des 2026"
 *   - "Sabtu, 15 Desember 2026" (optional weekday prefix)
 */
export function parseDay(dateStr: string): ParsedDate | null {
  const s = (dateStr ?? '').trim().replace(WEEKDAY_PREFIX, '');
  if (!s) return null;

  // ISO yyyy-mm-dd
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    return checkDay(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10));
  }

  // d-m-yyyy / d/m/yyyy / d.m.yyyy  (Indonesian order: day first)
  m = s.match(/^(\d{1,2})[\s/.-](\d{1,2})[\s/.-](\d{4})/);
  if (m) {
    return checkDay(parseInt(m[3], 10), parseInt(m[2], 10), parseInt(m[1], 10));
  }

  // "15 Desember 2026" or "15 Des 2026" (+ optional trailing text)
  m = s.match(/^(\d{1,2})\s+([A-Za-z.]+)\s+(\d{4})/);
  if (m) {
    const month = ID_MONTHS[m[2].replace(/\./g, '').toLowerCase()];
    if (!month) return null;
    return checkDay(parseInt(m[3], 10), month, parseInt(m[1], 10));
  }

  return null;
}

/**
 * Deterministically parse the time part. Supports "18:30", "18.30",
 * "18:30:15", "10.00 WIB - Selesai", "7 PM", "08.00 pagi".
 * Returns null when no time token exists.
 */
export function parseTime(timeStr: string): ParsedTime | null {
  const s = (timeStr ?? '').trim();
  if (!s) return null;

  const m = s.match(/(\d{1,2})[:.](\d{1,2})(?::(\d{1,2}))?/);
  if (!m) return null;

  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const sec = m[3] ? parseInt(m[3], 10) : 0;
  if (h > 23 || min > 59 || sec > 59) return null;

  // Optional 12-hour disambiguation from the surrounding text.
  if (/pm|petang|sore|malam/i.test(s)) {
    if (h >= 1 && h <= 11) h += 12;
  } else if (/am|pagi/i.test(s) && h === 12) {
    h = 0;
  }

  return { h, min, s: sec };
}

/**
 * Timezone offset (hours east of UTC) hinted by the time string.
 * Defaults to WIB (UTC+7) per MomenKita's Indonesian audience.
 * "WITA" → +8, "WIT" → +9.
 */
export function tzOffsetHrs(timeStr: string): number {
  const s = (timeStr ?? '').toUpperCase();
  if (s.includes('WITA')) return 8;
  if (s.includes('WIT')) return 9;
  return 7; // WIB
}

/** Combine the parsed date + time into an absolute instant in Asia/Jakarta. */
export function parseEventDateTime(dateStr: string, timeStr: string): EventDateTime {
  const date = parseDay(dateStr);
  if (!date) {
    return { valid: false, targetMs: 0, dayStartMs: 0, tzHrs: 7, date: null, time: null };
  }

  // Missing / unparseable time → target the end of the event day (23:59:59)
  // so the countdown never produces NaN or a wrong hour.
  const time = parseTime(timeStr) ?? { h: 23, min: 59, s: 59 };
  const tz = tzOffsetHrs(timeStr);

  const dayStartMs = Date.UTC(date.y, date.m - 1, date.d, -tz, 0, 0);
  const targetMs = Date.UTC(date.y, date.m - 1, date.d, time.h - tz, time.min, time.s);

  return { valid: true, targetMs, dayStartMs, tzHrs: tz, date, time };
}

export type CountdownStatus = 'running' | 'ongoing' | 'finished' | 'invalid';

export interface CountdownParts {
  status: CountdownStatus;
  days: number;
  hours: number;
  mins: number;
  secs: number;
  /** Remaining time until the event (ms), 0 when not running. */
  totalMs: number;
}

/**
 * True when `now` falls on the same calendar day as the event day,
 * evaluated in the event's own timezone (WIB/WITA/WIT).
 */
function isSameEventDay(ev: EventDateTime, now: number): boolean {
  const d = new Date(now + ev.tzHrs * HOUR_MS);
  const nowDayStartMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), -ev.tzHrs, 0, 0);
  return nowDayStartMs === ev.dayStartMs;
}

/**
 * Compute the live countdown parts from an event instant.
 * Negative remainders are never surfaced: a passed target yields
 * a status ('ongoing' on the event day, 'finished' afterwards).
 */
export function computeCountdown(ev: EventDateTime, now: number = Date.now()): CountdownParts {
  if (!ev.valid) {
    return { status: 'invalid', days: 0, hours: 0, mins: 0, secs: 0, totalMs: 0 };
  }

  const remaining = ev.targetMs - now;
  if (remaining <= 0) {
    const ongoing = isSameEventDay(ev, now);
    return {
      status: ongoing ? 'ongoing' : 'finished',
      days: 0,
      hours: 0,
      mins: 0,
      secs: 0,
      totalMs: 0,
    };
  }

  return {
    status: 'running',
    days: Math.floor(remaining / DAY_MS),
    hours: Math.floor((remaining % DAY_MS) / HOUR_MS),
    mins: Math.floor((remaining % HOUR_MS) / MIN_MS),
    secs: Math.floor((remaining % MIN_MS) / 1000),
    totalMs: remaining,
  };
}

/** Zero-pad single-digit counts ("6" → "06"); keeps larger values as-is. */
export const pad2 = (n: number): string => String(Math.max(0, Math.floor(n))).padStart(2, '0');
