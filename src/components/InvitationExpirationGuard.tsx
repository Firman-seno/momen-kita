import React from 'react';
import { useInvitationExpiration } from '../hooks/useInvitationExpiration';

/* ============================================================
   INVITATION EXPIRATION GUARD — wraps ANY invitation renderer
   ------------------------------------------------------------
   A single reusable gate used by every template:

       <InvitationExpirationGuard date time
           storedExpired serverExpired
           expiredView={<ExpiredInvitation ... />}>
         <InvitationTemplate />
       </InvitationExpirationGuard>

   - While the event is in the future → renders <children />.
   - The moment the event instant is reached (checked live every
     second) → swaps to <expiredView /> automatically.
   - `storedExpired` honours an admin-forced "expired" status.
   - `serverExpired` honours the authoritative server-side check
     made when the invitation was fetched (still recomputed live
     on the client so refresh / direct links / other devices all
     behave identically).
   ============================================================ */

export interface InvitationExpirationGuardProps {
  /** Event date string exactly as stored on the invitation. */
  date: string;
  /** Event time string exactly as stored on the invitation. */
  time: string;
  /** True when the stored status is already 'expired' (admin override). */
  storedExpired?: boolean;
  /** True when the server reported the event as expired at fetch time. */
  serverExpired?: boolean;
  children: React.ReactNode;
  /** Rendered in place of children once the invitation has expired. */
  expiredView: React.ReactNode;
}

export const InvitationExpirationGuard: React.FC<InvitationExpirationGuardProps> = ({
  date,
  time,
  storedExpired = false,
  serverExpired = false,
  children,
  expiredView,
}) => {
  const expiration = useInvitationExpiration(date, time);
  const isExpired =
    storedExpired === true || serverExpired === true || expiration.status === 'expired';
  return <>{isExpired ? expiredView : children}</>;
};
