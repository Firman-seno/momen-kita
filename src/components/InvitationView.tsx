import React, { useEffect, useMemo, useState } from 'react';
import { Template } from '../types';
import { getTemplateByUid } from '../data/templates';
import {
  Invitation,
  getInvitationBySlug,
  upsertInvitationFromServer,
  getEventDetailsForInvitation,
  getInvitationTitle,
  getInvitationUrl,
} from '../lib/invitations';
import { fetchPublicInvitation } from '../lib/serverApi';
import { buildWaLink, changeRequestMessage, WHATSAPP_PRIMARY } from '../lib/whatsapp';
import { applyInvitationMeta, applyExpiredMeta, resetSocialMeta } from '../lib/socialMeta';
import { TemplateDemoView } from './TemplateDemoView';
import { InvitationExpirationGuard } from './InvitationExpirationGuard';
import { ExpiredInvitation } from './ExpiredInvitation';
import { LoadingScreen } from './LoadingScreen';
import { InvitationNotFound } from './InvitationNotFound';
import { UiButton } from './UiButton';

interface InvitationViewProps {
  slug: string;
  onGoHome: () => void;
}

export const InvitationView: React.FC<InvitationViewProps> = ({ slug, onGoHome }) => {
  const [local, setLocal] = useState<Invitation | undefined>(() => getInvitationBySlug(slug) || undefined);
  // Only show the loading screen when there is NO cached copy (fresh device).
  // When the invitation is already in localStorage it renders instantly and the
  // server copy is refreshed silently in the background — no artificial delay.
  const [showLoading, setShowLoading] = useState(() => !getInvitationBySlug(slug));
  // Authoritative server-side expiration result captured when the invitation
  // was fetched. Expiration is monotonic, so this never "un-expires".
  const [serverExpired, setServerExpired] = useState(false);

  // Try localStorage first (fast, offline-capable), then fall back to the
  // server so the link also opens on devices without the admin's data.
  useEffect(() => {
    let cancelled = false;
    setLocal(getInvitationBySlug(slug) || undefined);

    fetchPublicInvitation(slug)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setServerExpired(data.expired);
          upsertInvitationFromServer(data.invitation);
          const fresh = getInvitationBySlug(slug);
          if (fresh) setLocal(fresh);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setShowLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const invitation = local;
  const template: Template | undefined = useMemo(
    () => (invitation ? getTemplateByUid(invitation.templateUid) : undefined),
    [invitation]
  );

  // Dynamic social metadata for this invitation
  useEffect(() => {
    if (invitation && template) {
      const isExpired = invitation.status === 'expired' || serverExpired;
      if (isExpired) {
        applyExpiredMeta(window.location.href);
      } else {
        applyInvitationMeta(invitation, template, window.location.href);
      }
    } else {
      resetSocialMeta();
    }
    return () => resetSocialMeta();
  }, [invitation, template, serverExpired]);

  if (showLoading) {
    return <LoadingScreen label="Menyiapkan undangan..." />;
  }

  if (!invitation || !template) {
    return <InvitationNotFound onGoHome={onGoHome} />;
  }

  const invitationUrl = getInvitationUrl(invitation);

  if (invitation.status === 'draft') {
    return (
      <div className="flex-grow w-full min-h-screen flex items-center justify-center px-4 py-16 pt-28 bg-background">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              visibility_off
            </span>
          </div>
          <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tight">
            Undangan belum dipublikasikan
          </h1>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            Pemilik undangan belum menerbitkan undangan ini. Silakan coba kembali nanti.
          </p>
          <UiButton size="lg" fullWidth variant="primary" icon="auto_awesome" iconFilled onClick={onGoHome}>
            Kembali ke MomenKita
          </UiButton>
          <a
            href={buildWaLink(changeRequestMessage(invitationUrl), WHATSAPP_PRIMARY)}
            target="_blank"
            rel="noreferrer"
            className="font-body text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            Butuh Perubahan? Hubungi Admin
          </a>
        </div>
      </div>
    );
  }

  const eventDetails = getEventDetailsForInvitation(template, invitation);
  const invitationTitle = getInvitationTitle(invitation, template);

  return (
    <div className="relative">
      <InvitationExpirationGuard
        date={invitation.eventDate}
        time={invitation.eventTime}
        storedExpired={invitation.status === 'expired'}
        serverExpired={serverExpired}
        expiredView={
          <ExpiredInvitation
            template={template}
            date={invitation.eventDate}
            time={invitation.eventTime}
            onGoHome={onGoHome}
          />
        }
      >
        <TemplateDemoView
          key={invitation.slug}
          template={template}
          isInvitation
          invitationSlug={invitation.slug}
          invitationTitle={invitationTitle}
          invitationPhone={invitation.customerPhone || null}
          eventDetailsOverride={eventDetails}
          wishesOverride={template.sampleWishes}
          musicOverride={invitation.music ? { title: invitation.music.title, url: invitation.music.url, startTime: invitation.music.startTime } : null}
          disableMusic={invitation.musicEnabled === false}
          videoOverride={
            invitation.videoUrl
              ? { url: invitation.videoUrl, type: invitation.videoType, name: invitation.videoName }
              : null
          }
          onOpenWhatsApp={() => undefined}
          onBackToCatalog={onGoHome}
        />
      </InvitationExpirationGuard>
    </div>
  );
};
