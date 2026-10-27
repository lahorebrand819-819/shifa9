import React from 'react';

interface TelcaLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TelcaLogo: React.FC<TelcaLogoProps> = ({
  className = 'h-9 w-auto',
  variant = 'dark',
  showSubtitle = true,
  size
}) => {
  // Height sizing if requested
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : size === 'xl' ? 'h-14' : className;

  const isLight = variant === 'light';
  const mainColor = isLight ? '#0B1E36' : '#FFFFFF';
  const subtextColor = isLight ? '#0B1E36' : '#F1F5F9';
  const cyanColor = '#00A3FF';

  return (
    <svg 
      viewBox={showSubtitle ? "0 0 570 210" : "0 0 570 140"} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${heightClass} object-contain transition-transform select-none`}
      aria-label="Shifa Productions Logo"
    >
      {/* Letter T */}
      <g transform="translate(30, 25)">
        <rect x="0" y="0" width="76" height="15" rx="1.5" fill={mainColor} />
        <rect x="30.5" y="15" width="15" height="75" rx="1.5" fill={mainColor} />
      </g>

      {/* Letter E */}
      <g transform="translate(132, 25)">
        {/* Top Bar */}
        <rect x="0" y="0" width="72" height="15" rx="1.5" fill={mainColor} />
        {/* Middle Cyan Bar */}
        <rect x="0" y="37.5" width="72" height="15" rx="1.5" fill={cyanColor} />
        {/* Bottom Bar */}
        <rect x="0" y="75" width="72" height="15" rx="1.5" fill={mainColor} />
      </g>

      {/* Letter L */}
      <g transform="translate(230, 25)">
        <rect x="0" y="0" width="15" height="90" rx="1.5" fill={mainColor} />
        <rect x="0" y="75" width="70" height="15" rx="1.5" fill={mainColor} />
      </g>

      {/* Letter C */}
      <g transform="translate(325, 25)">
        <path 
          d="M 72 18 C 62 5, 45 0, 36 0 C 16 0, 0 20, 0 45 C 0 70, 16 90, 36 90 C 46 90, 62 85, 72 72 L 62 60 C 54 70, 44 74, 36 74 C 24 74, 15 62, 15 45 C 15 28, 24 16, 36 16 C 44 16, 54 20, 62 30 Z" 
          fill={mainColor} 
        />
      </g>

      {/* Letter A */}
      <g transform="translate(425, 25)">
        <polygon points="38,0 48,0 15,90 0,90" fill={mainColor} />
        <polygon points="38,0 48,0 86,90 71,90" fill={mainColor} />
        {/* Cyan Crossbar */}
        <rect x="23" y="58" width="40" height="13" rx="1" fill={cyanColor} />
      </g>

      {/* Subtitle: — MARKETING — */}
      {showSubtitle && (
        <g transform="translate(0, 155)">
          {/* Left Line */}
          <line x1="60" y1="12" x2="130" y2="12" stroke={cyanColor} strokeWidth="3" strokeLinecap="round" />
          
          {/* MARKETING Word */}
          <text 
            x="285" 
            y="20" 
            textAnchor="middle" 
            fill={subtextColor}
            style={{ 
              fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif", 
              fontSize: '23px', 
              fontWeight: 700, 
              letterSpacing: '0.36em' 
            }}
          >
            MARKETING
          </text>
          
          {/* Right Line */}
          <line x1="440" y1="12" x2="510" y2="12" stroke={cyanColor} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};
