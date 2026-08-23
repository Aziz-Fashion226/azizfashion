import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'gold' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  // Size definitions for the image logo
  const heightMap = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-24',
    xl: 'h-32',
  };

  return (
    <div className={`flex items-center group select-none ${className}`}>
      {/* Official Aziz Fashion Logo Image */}
      <img
        src="/assets/logo-official.png"
        alt="AZIZ FASHION"
        className={`object-contain transition-transform duration-300 group-hover:scale-105 ${heightMap[size]}`}
        onError={(e) => {
          // Fallback if image not found
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.querySelector('.fallback-logo')?.classList.remove('hidden');
        }}
      />

      {/* Fallback SVG Logo (Original) */}
      <div className="fallback-logo hidden flex items-center gap-3">
        <div className={`relative flex items-center justify-center shrink-0 ${size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'}`}>
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_2px_10px_rgba(212,175,55,0.25)]"
          >
            <polygon points="50,4 96,50 50,96 4,50" stroke="#D4AF37" strokeWidth="3.5" fill="#0B1325" />
            <text x="50" y="65" textAnchor="middle" fontFamily="serif" fontSize="32" fontWeight="800" fill="#D4AF37">AF</text>
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className={`font-serif tracking-widest font-extrabold ${variant === 'dark' ? 'text-[#0B1325]' : 'text-white'}`}>
            AZIZ FASHION
          </span>
          {showSubtitle && (
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37]">
              Chemises Locales de Marque
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
