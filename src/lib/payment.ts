// ============================================================================
// MomenKita — Payment configuration
// Bank accounts are displayed to customers during checkout and can be set by
// the admin in Dashboard → Settings → Pembayaran. The bank holder name and
// admin WhatsApp number are configured here.
// ============================================================================

export const PAYMENT_HOLDER = 'FIRMAN SENO SUDIRO';

/** Admin WhatsApp number that receives payment confirmations. */
export const ADMIN_WHATSAPP = '6281911943754';

export interface BankAccount {
  key: string;
  bank: string;
  short: string;
  accountNumber: string;
  holder: string;
}

export interface PaymentSettings {
  bsiAccount: string;
  jagoAccount: string;
}

const STORAGE_KEY = 'momenkita.payment.v1';

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bsiAccount: '',
  jagoAccount: '',
};

export const getPaymentSettings = (): PaymentSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PAYMENT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PaymentSettings>;
    return {
      bsiAccount: typeof parsed.bsiAccount === 'string' ? parsed.bsiAccount : '',
      jagoAccount: typeof parsed.jagoAccount === 'string' ? parsed.jagoAccount : '',
    };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
};

export const setPaymentSettings = (settings: PaymentSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable — keep app working */
  }
};

/** Bank accounts shown to the customer at checkout. */
export const getBankAccounts = (): BankAccount[] => {
  const s = getPaymentSettings();
  return [
    {
      key: 'BSI',
      bank: 'BANK SYARIAH INDONESIA (BSI)',
      short: 'BSI',
      accountNumber: s.bsiAccount || '0000000000000',
      holder: PAYMENT_HOLDER,
    },
    {
      key: 'BANK JAGO SYARIAH',
      bank: 'BANK JAGO SYARIAH',
      short: 'Jago',
      accountNumber: s.jagoAccount || '0000000000000',
      holder: PAYMENT_HOLDER,
    },
  ];
};
