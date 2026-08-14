import React, { useState } from 'react';
import { Invitation, getInvitationUrl, getInvitationTitle } from '../lib/invitations';
import { buildWaLink, invitationShareMessage, deliveryMessage } from '../lib/whatsapp';
import { UiButton } from './UiButton';
import { Toast } from './Toast';

interface SharePanelProps {
  invitation: Invitation;
  /** Publish a DRAFT invitation (turns it into a shareable link). */
  onPublish?: () => void;
  /** Open the live invitation page. */
  onOpenInvitation?: () => void;
  title?: string;
}

export const SharePanel: React.FC<SharePanelProps> = ({
  invitation,
  onPublish,
  onOpenInvitation,
  title,
}) => {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  const [copiedWa, setCopiedWa] = useState(false);

  const invitationUrl = getInvitationUrl(invitation);
  const invitationTitle = title || getInvitationTitle(invitation);
  const isPublished = invitation.status === 'published';
  const isExpired = invitation.status === 'expired';
  const shareable = isPublished || isExpired;

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall through to legacy method
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyText(invitationUrl);
    if (ok) {
      setCopied(true);
      setToast('Link undangan berhasil disalin!');
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      setToast('Gagal menyalin link. Silakan salin manual.');
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: invitationTitle,
      text: `MomenKita Invitation\n\nAnda diundang ke acara spesial kami.\n\nBuka undangan:\n${invitationUrl}`,
      url: invitationUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or API failed → fall back to copy
      }
    }
    await handleCopyLink();
  };

  const handleWhatsAppShare = () => {
    const waHref = buildWaLink(invitationShareMessage(invitationTitle, invitationUrl, invitation.eventDate), invitation.customerPhone || '');
    window.open(waHref, '_blank', 'noopener,noreferrer');
  };

  const handleCopyWa = async () => {
    const msg = invitationShareMessage(invitationTitle, invitationUrl, invitation.eventDate);
    const ok = await copyText(msg);
    if (ok) {
      setCopiedWa(true);
      setToast('Pesan WhatsApp berhasil disalin.');
      window.setTimeout(() => setCopiedWa(false), 2000);
    } else {
      setToast('Gagal menyalin pesan.');
    }
  };

  const openInvitation = () => {
    if (onOpenInvitation) onOpenInvitation();
    else window.open(invitationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-outline-variant/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            send
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface leading-tight">
            {shareable ? 'Undangan Siap Dibagikan' : 'Undangan Belum Dipublikasikan'}
          </h3>
          <p className="font-body text-[11px] sm:text-xs text-on-surface-variant truncate">
            {invitationTitle}
          </p>
        </div>
      </div>

      <div className="p-5">
        {!shareable && (
          <div className="mb-4">
            <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
              Hanya undangan yang sudah dipublikasikan yang dapat dibagikan kepada tamu.
              Link unik Anda akan dibuat setelah publikasi dan tidak akan berubah meskipun
              data diedit di kemudian hari.
            </p>
            {onPublish && (
              <UiButton
                fullWidth
                size="lg"
                variant="accent"
                icon="public"
                iconFilled
                onClick={onPublish}
              >
                Simpan &amp; Terbitkan
              </UiButton>
            )}
          </div>
        )}

        {shareable && (
          <>
            {/* URL */}
            <div className="mb-4">
              <label className="block font-body text-[10px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Link Undangan (Unik — tidak berubah saat diedit)
              </label>
              <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-3">
                <span className="material-symbols-outlined text-base text-primary shrink-0">link</span>
                <span className="font-mono text-[11px] sm:text-xs text-on-surface truncate break-all min-w-0">
                  {invitationUrl}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <UiButton
                size="md"
                fullWidth
                variant="secondary"
                icon={copied ? 'check' : 'content_copy'}
                iconFilled={copied}
                onClick={handleCopyLink}
              >
                {copied ? 'Link Tersalin' : 'Copy Link'}
              </UiButton>

              <UiButton
                size="md"
                fullWidth
                variant="primary"
                icon="share"
                onClick={handleNativeShare}
              >
                Share
              </UiButton>

              <UiButton
                size="md"
                fullWidth
                variant="whatsapp"
                icon="chat"
                iconFilled
                onClick={handleWhatsAppShare}
              >
                WhatsApp
              </UiButton>

              <UiButton
                size="md"
                fullWidth
                variant="accent"
                icon="open_in_new"
                onClick={openInvitation}
              >
                Open Invitation
              </UiButton>
            </div>

            {/* Copy full WA message */}
            <button
              onClick={handleCopyWa}
              className="mt-3 w-full text-left font-body text-[11px] sm:text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm shrink-0">content_paste</span>
              {copiedWa ? '✓ Pesan tersalin' : 'Salin pesan WhatsApp siap kirim'}
            </button>

            {/* Kirim Link ke Customer (admin) */}
            {invitation.customerPhone && (
              <a
                href={buildWaLink(deliveryMessage(invitation.customerName || 'Customer', invitationUrl), invitation.customerPhone)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full btn-micro min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                Kirim Link ke Customer
              </a>
            )}
          </>
        )}

        <a
          href="/admin/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full font-body text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 cursor-pointer flex items-center justify-center gap-1.5"
          title="Buka dashboard admin di tab baru"
        >
          <span className="material-symbols-outlined text-sm">dashboard</span>
          Kelola Semua Undangan
          <span className="material-symbols-outlined text-sm opacity-60">open_in_new</span>
        </a>
      </div>

      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
};
