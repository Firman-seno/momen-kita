import React from 'react';
import { Template } from '../types';
import { formatRupiah } from '../data/templates';
import { WHATSAPP_PRIMARY, WHATSAPP_ALTERNATE, buildWaLink, templateOrderMessage } from '../lib/whatsapp';
import { UiButton } from './UiButton';

interface WhatsAppOrderModalProps {
  template?: Template | null;
  onClose: () => void;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({ template, onClose }) => {
  const orderMessage = templateOrderMessage(template);
  const primaryHref = buildWaLink(orderMessage, WHATSAPP_PRIMARY);
  const alternateHref = buildWaLink(orderMessage, WHATSAPP_ALTERNATE);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-outline-variant/40">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              chat
            </span>
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface">Pesan via WhatsApp</h3>
            <p className="font-body text-xs text-on-surface-variant">
              Tim MomenKita akan membantu mengurus sisanya
            </p>
          </div>
        </div>

        {template && (
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 mb-6 flex items-center gap-4">
            <img
              src={template.image}
              alt={template.name}
              className="w-16 h-20 object-cover rounded-lg border border-outline-variant/40"
            />
            <div>
              <span className="text-[10px] font-body font-bold text-primary uppercase tracking-wider">
                {template.id} • {template.categoryLabel}
              </span>
              <h4 className="font-headline text-base font-bold text-on-surface">{template.name}</h4>
              <p className="font-body text-sm font-extrabold text-primary mt-1">
                {formatRupiah(template.price)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 mb-6">
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Pesanan Anda akan dikirim ke WhatsApp MomenKita lengkap dengan detail template
            yang dipilih. Admin kami akan menghubungi Anda untuk melengkapi data acara,
            mengunggah foto, memilih musik, dan membuat undangan Anda.
          </p>
          <pre className="mt-3 font-body text-[11px] text-on-surface bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/40 whitespace-pre-wrap leading-relaxed">
            {orderMessage}
          </pre>
        </div>

        <div className="flex flex-col gap-2.5">
          <UiButton
            variant="whatsapp"
            size="lg"
            fullWidth
            href={primaryHref}
            external
            icon="chat"
            iconFilled
          >
            Chat WhatsApp MomenKita
          </UiButton>
          <UiButton
            variant="secondary"
            size="md"
            fullWidth
            href={alternateHref}
            external
            icon="call"
          >
            Nomor Alternatif
          </UiButton>
        </div>

        <p className="mt-4 text-center font-body text-[10px] text-outline">
          Harga final sesuai penawaran admin. {WHATSAPP_PRIMARY}
        </p>
      </div>
    </div>
  );
};
