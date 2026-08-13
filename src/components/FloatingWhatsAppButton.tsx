import React from 'react';
import { buildWaLink, homepageWaMessage } from '../lib/whatsapp';

export const FloatingWhatsAppButton: React.FC = () => {
  return (
    <a
      href={buildWaLink(homepageWaMessage)}
      target="_blank"
      rel="noreferrer"
      aria-label="Pesan via WhatsApp"
      className="fixed bottom-5 right-4 sm:right-6 sm:bottom-8 z-40 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-body text-xs font-bold uppercase tracking-wider rounded-full pl-3 pr-3 sm:pl-4 sm:pr-5 py-3 shadow-[0px_10px_25px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 hover:shadow-[0px_14px_30px_rgba(16,185,129,0.55)] active:scale-95 transition-all cursor-pointer"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" className="w-6 h-6 shrink-0">
        <path d="M16.004 3C9.383 3 4 8.383 4 15.004c0 2.648.864 5.094 2.324 7.078L4 29l7.078-2.297A11.93 11.93 0 0 0 16.004 29C22.621 29 28 23.621 28 17.004 28 10.383 22.621 3 16.004 3zm0 2.3c4.977 0 9.023 4.046 9.023 9.023S20.98 23.346 16.004 23.346a9.7 9.7 0 0 1-4.656-1.168l-.332-.187-4.234 1.371 1.352-4.148-.22-.336a8.98 8.98 0 0 1-1.488-4.874C6.426 9.346 11.027 5.3 16.004 5.3zm-4.836 4.805c-.313 0-.82.117-1.191.586-.371.469-1.419 1.383-1.419 3.375 0 1.992 1.45 3.918 1.66 4.187.21.27 2.926 4.59 7.207 6.262 3.614 1.41 4.348 1.129 5.133 1.058.785-.07 2.531-1.035 2.887-2.035.356-1 .356-1.855.25-2.035-.106-.18-.39-.293-.82-.508-.426-.215-2.531-1.25-2.926-1.395-.394-.145-.68-.215-.968.211-.287.43-1.113 1.395-1.363 1.68-.25.286-.5.322-.93.11-.43-.215-1.82-.672-3.465-2.137-1.28-1.14-2.148-2.551-2.398-2.98-.25-.43-.027-.664.188-.878.194-.192.43-.5.645-.752.215-.25.287-.43.43-.717.144-.287.073-.536-.035-.75-.11-.215-.969-2.38-1.355-3.247-.352-.832-.71-.824-1.07-.83-.172-.004-.36-.008-.57-.008z" />
      </svg>
      <span className="hidden sm:inline">Pesan Sekarang</span>
    </a>
  );
};
