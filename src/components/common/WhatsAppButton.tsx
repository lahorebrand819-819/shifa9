import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAgency } from '../../context/AgencyContext';
import { motion } from 'motion/react';

export const WhatsAppButton: React.FC = () => {
  const { data } = useAgency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawPhone = data?.settings?.whatsappNumber?.trim() || '923706264133';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '923706264133';
  const message = data?.settings?.whatsappMessage?.trim() || "Hi Shifa Productions! I'd like to discuss a project.";

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const buttonContent = (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 999999,
        pointerEvents: 'auto',
        transform: 'translateZ(0)' // Force dedicated compositor layer
      }}
      className="fixed bottom-[20px] right-[20px] z-[999999]"
    >
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white shadow-2xl shadow-emerald-500/40 border-2 border-white/20 transition-all duration-300 cursor-pointer"
        aria-label={`Chat with ${data?.settings?.agencyName || data?.settings?.name || 'Shifa Productions'} on WhatsApp`}
        title={`Chat on WhatsApp (+${cleanPhone})`}
      >
        {/* Soft pulsing aura animation around the circular icon */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400/35 animate-ping pointer-events-none" />

        {/* WhatsApp Official Vector Icon */}
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 fill-white drop-shadow-sm transition-transform duration-300 group-hover:rotate-6"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>

        {/* Online Indicator Green Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-300 border-2 border-slate-900 rounded-full" />
      </motion.a>
    </div>
  );

  // Render via React Portal directly into document.body to prevent any parent container/overflow/transform issues
  if (mounted && typeof document !== 'undefined') {
    return createPortal(buttonContent, document.body);
  }

  return buttonContent;
};
