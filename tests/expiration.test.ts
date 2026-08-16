/* ============================================================
   Expiration system tests — deterministic, no network, no clock.
   Run with: npx tsx tests/expiration.test.ts
   ============================================================ */
import { computeInvitationExpiration, isInvitationExpired } from '../src/lib/invitationExpiration';
import { parseEventDateTime } from '../src/lib/eventDateTime';
import { computeInvitationExpiration as serverExpiration } from '../api/_expiration';

const DATE = 'Sabtu, 13 Oktober 2026';
const TIME = '10.00 WIB - Selesai';
// 10:00 Asia/Jakarta (WIB, UTC+7) = 03:00 UTC
const TARGET = Date.UTC(2026, 9, 13, 3, 0, 0);
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

let failed = 0;
const check = (cond: boolean, name: string): void => {
  if (cond) {
    console.log(`PASS  ${name}`);
  } else {
    console.error(`FAIL  ${name}`);
    failed += 1;
  }
};

/* Sanity: client + server parse to the same WIB-anchored instant. */
check(parseEventDateTime(DATE, TIME).valid && parseEventDateTime(DATE, TIME).targetMs === TARGET, 'sanity: client target === 10:00 WIB epoch');
check(serverExpiration(DATE, TIME, TARGET).valid && serverExpiration(DATE, TIME, TARGET).targetMs === TARGET, 'sanity: server target === client target');

/* TEST 1 — event days away → invitation active. */
check(computeInvitationExpiration(DATE, TIME, TARGET - 3 * DAY).status === 'active', 'TEST 1: days-away → active');

/* TEST 2 — event seconds away → active, countdown still running. */
{
  const near = computeInvitationExpiration(DATE, TIME, TARGET - 5000);
  check(near.status === 'active' && near.remainingMs === 5000, 'TEST 2: seconds-away → active, countdown running (remainingMs=5000)');
}

/* TEST 3 — exactly at the event instant → expired. */
check(computeInvitationExpiration(DATE, TIME, TARGET).status === 'expired', 'TEST 3: at event time → expired');

/* TEST 4 — refresh AFTER the event → stays expired. */
check(isInvitationExpired(DATE, TIME, TARGET + 60 * 1000), 'TEST 4: refresh after event → still expired');

/* TEST 5 — direct URL after the event → stays expired (no stored status needed). */
check(isInvitationExpired(DATE, TIME, TARGET + HOUR), 'TEST 5: direct link after event → expired');

/* TEST 6 — RSVP after the event → the server gate (used by /api/rsvp) says expired. */
check(serverExpiration(DATE, TIME, TARGET + 5000).expired, 'TEST 6: server RSVP gate after event → expired');

/* TEST 7 — different devices/timezones: the decision depends ONLY on the epoch
   instant, never on the device's local clock, so any guest at the same
   physical moment gets the same result. */
check(
  computeInvitationExpiration(DATE, TIME, TARGET - 2 * HOUR).status ===
    computeInvitationExpiration(DATE, TIME, TARGET - 2 * HOUR).status,
  'TEST 7: same instant → same status on any device (epoch-based)'
);
check(computeInvitationExpiration(DATE, TIME, TARGET + 1).status === 'expired', 'TEST 7: post-event on another device → expired');

/* Anti-bug: invalid/empty date/time must NEVER auto-expire silently. */
check(computeInvitationExpiration('', '').valid === false && computeInvitationExpiration('', '').status === 'active', 'A1: empty date/time → valid=false, active');
check(computeInvitationExpiration('Bukan Tanggal', '10.00 WIB').status === 'active', 'A2: garbage date → active (never auto-expire)');
check(serverExpiration('', '').valid === false && serverExpiration('', '').expired === false, 'A3: server empty date/time → never auto-expired');

/* Anti-bug: event today, before start → active. */
check(computeInvitationExpiration(DATE, TIME, TARGET - 30 * 60 * 1000).status === 'active', 'A4: event today, before start → active');

/* Anti-bug: missing time falls back to end-of-day 23:59:59 WIB (=16:59:59 UTC). */
check(parseEventDateTime(DATE, '').targetMs === Date.UTC(2026, 9, 13, 16, 59, 59), 'A5: blank time → end-of-day fallback');

/* Anti-bug: WITA/WIB timezone anchors are honored. */
check(
  parseEventDateTime('13 Oktober 2026', '10.00 WITA - Selesai').targetMs ===
    parseEventDateTime('13 Oktober 2026', '10.00 WIB - Selesai').targetMs - HOUR,
  'A6: WITA anchors 1h earlier (UTC) than WIB'
);

if (failed > 0) {
  console.error(`\n${failed} test(s) FAILED`);
  process.exit(1);
}
console.log('\nAll expiration tests passed.');
