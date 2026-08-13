/* ============================================================
   MomenKita — Admin Authentication (client-side gate)
   ------------------------------------------------------------
   This static site has no backend, so the admin gate is enforced
   at the ROUTE level in App.tsx: /admin*, /admin/editor/* and the
   legacy /editor*, /dashboard paths all check isAdminAuthenticated().
   A non-admin never sees the editor/dashboard render — they get the
   "Akses Tidak Diizinkan" page instead.

   NOTE: Client-side auth protects the UI only. Real deployments
   must move invitation/order storage to a server and protect these
   routes server-side. The default PIN is overridable in Settings.
   ============================================================ */

const SESSION_KEY = 'momenkita.admin.session.v1';
const PIN_KEY = 'momenkita.admin.pin.v1';
const EMAIL_KEY = 'momenkita.admin.email.v1';
const PASSWORD_KEY = 'momenkita.admin.password.v1';
export const DEFAULT_ADMIN_PIN = 'MK-2026';
export const DEFAULT_ADMIN_EMAIL = 'admin@momenkita.id';
export const DEFAULT_ADMIN_PASSWORD = 'MK-2026';

// Legacy PIN helpers (kept for compatibility — Dashboard settings now manage
// email + password instead). The PIN still works as a password fallback so
// existing installs that only ever configured a PIN keep working.
export const getAdminPin = (): string => {
  try {
    return localStorage.getItem(PIN_KEY) || DEFAULT_ADMIN_PIN;
  } catch {
    return DEFAULT_ADMIN_PIN;
  }
};

export const setAdminPin = (pin: string): void => {
  try {
    localStorage.setItem(PIN_KEY, pin);
  } catch {
    /* storage unavailable — ignore */
  }
};

export const getAdminEmail = (): string => {
  try {
    return localStorage.getItem(EMAIL_KEY) || DEFAULT_ADMIN_EMAIL;
  } catch {
    return DEFAULT_ADMIN_EMAIL;
  }
};

export const setAdminEmail = (email: string): void => {
  try {
    localStorage.setItem(EMAIL_KEY, email.trim() || DEFAULT_ADMIN_EMAIL);
  } catch {
    /* storage unavailable — ignore */
  }
};

export const getAdminPassword = (): string => {
  try {
    return localStorage.getItem(PASSWORD_KEY) || getAdminPin();
  } catch {
    return getAdminPin();
  }
};

export const setAdminPassword = (password: string): void => {
  try {
    localStorage.setItem(PASSWORD_KEY, password.trim() || DEFAULT_ADMIN_PASSWORD);
  } catch {
    /* storage unavailable — ignore */
  }
};

export const isAdminAuthenticated = (): boolean => {
  try {
    return localStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

export const loginAsAdmin = (email: string, password: string): boolean => {
  const emailOk =
    email.trim().toLowerCase() === getAdminEmail().toLowerCase();
  const passwordOk = password.trim() === getAdminPassword();
  if (!emailOk || !passwordOk) return false;
  try {
    localStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
  return true;
};

export const logoutAdmin = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};
