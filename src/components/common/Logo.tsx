import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'gold' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  customLogoUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  className = '',
  customLogoUrl,
}) => {
  if (customLogoUrl) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={customLogoUrl}
          alt="AZIZ FASHION Logo"
          className={`object-contain ${
            size === 'sm' ? 'h-8' : size === 'md' ? 'h-10' : size === 'lg' ? 'h-14' : 'h-20'
          }`}
          referrerPolicy="no-referrer"
        />
        {showSubtitle && (
          <div className="flex flex-col">
            <span
              className={`font-serif tracking-widest font-extrabold ${
                variant === 'dark' ? 'text-[#0B1325]' : 'text-white'
              } ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'}`}
            >
              AZIZ FASHION
            </span>
            <span
              className={`text-[9px] tracking-[0.25em] uppercase font-medium ${
                variant === 'dark' ? 'text-[#997A1E]' : 'text-[#D4AF37]'
              }`}
            >
              Chemises Locales de Marque
            </span>
          </div>
        )}
      </div>
    );
  }

  // Size definitions
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[7.5px]', gap: 'gap-2' },
    md: { icon: 'w-9 h-9', text: 'text-xl', sub: 'text-[9px]', gap: 'gap-2.5' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-[10px]', gap: 'gap-3' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl sm:text-4xl', sub: 'text-xs', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];

  // Color schemes
  const isDarkVariant = variant === 'dark';
  const primaryText = isDarkVariant ? 'text-[#0B1325]' : 'text-white';
  const goldAccent = '#D4AF37';

  return (
    <div className={`flex items-center ${currentSize.gap} group select-none ${className}`}>
      {/* Luxury Vector Monogram Badge */}
      <div className={`relative flex items-center justify-center shrink-0 ${currentSize.icon}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_10px_rgba(212,175,55,0.25)] transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer Geometric Diamond/Octagon Crest */}
          <polygon
            points="50,4 96,50 50,96 4,50"
            stroke="url(#goldGradient)"
            strokeWidth="3.5"
            fill={isDarkVariant ? '#FAF7F0' : '#0B1325'}
          />
          {/* Inner Accent Ring */}
          <polygon
            points="50,14 86,50 50,86 14,50"
            stroke="url(#goldGradient)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.85"
          />
          {/* Stylized African Tailor Needle / Crown Motif */}
          <path
            d="M50 20 L53 32 L50 36 L47 32 Z"
            fill={goldAccent}
          />
          {/* Stylized A & F Intertwined Typography */}
          <text
            x="50"
            y="65"
            textAnchor="middle"
            fontFamily="'Cinzel', serif"
            fontSize="32"
            fontWeight="800"
            letterSpacing="-1"
            fill="url(#goldGradient)"
          >
            AF
          </text>
          {/* Tailoring stitch line bottom */}
          <line
            x1="35"
            y1="75"
            x2="65"
            y2="75"
            stroke="url(#goldGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Gradients */}
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F7E7A9" />
              <stop offset="0.45" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#997A1E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-serif tracking-[0.12em] font-extrabold ${primaryText} ${currentSize.text} transition-colors duration-200`}
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            AZIZ
          </span>
          <span
            className={`font-serif tracking-[0.12em] font-light text-[#D4AF37] ${currentSize.text}`}
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            FASHION
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`font-sans tracking-[0.28em] uppercase font-semibold text-[#C5A059] ${currentSize.sub} mt-0.5`}
          >
            Chemises Locales de Marque
          </span>
        )}
      </div>
    </div>
  );
};
