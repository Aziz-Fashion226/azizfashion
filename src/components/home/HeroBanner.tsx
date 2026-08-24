import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Award, Truck } from 'lucide-react';
import { StoreSettings } from '../../types';

interface HeroBannerProps {
  onExplore: () => void;
  settings: StoreSettings;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExplore,
  settings,
}) => {
  return (
    <section className="relative min-h-[80vh] sm:min-h-[85vh] bg-[#1A1510] flex items-center overflow-hidden">
      {/* Visual background - Local Creation Image */}
      <div className="absolute inset-0">
        <img
          src="/assets/creation.jpg"
          alt="Aziz Fashion Boutique de Luxe"
          className="w-full h-full object-cover object-top sm:object-center filter brightness-[0.75] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510] via-transparent to-black/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-16 w-full text-center">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative">
          {/* Subtle readability halo behind text */}
          <div className="absolute inset-x-[-20%] inset-y-[-30%] bg-[#1A1510]/45 blur-[80px] rounded-full pointer-events-none -z-10" />

          {/* Brand Presentation */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-black tracking-[0.2em] uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Boutique de Prêt-à-Porter de Luxe</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none font-serif">
              AZIZ <span className="text-[#D4AF37]">FASHION</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
              Portez vos racines. Affirmez votre style.<br className="hidden sm:block" />
              Des matières authentiques, un savoir-faire local, une élégance résolument moderne. <strong className="text-white">Aziz Fashion</strong> transforme chaque chemise en une signature : la vôtre.
            </p>
          </div>

          {/* Core Values Summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 py-6 border-y border-white/10 max-w-2xl mx-auto text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            <div className="space-y-2">
              <ShieldCheck className="w-5 h-5 mx-auto opacity-80" />
              <span>Qualité Premium</span>
            </div>
            <div className="space-y-2">
              <Award className="w-5 h-5 mx-auto opacity-80" />
              <span>100% Artisanal</span>
            </div>
            <div className="space-y-2">
              <Truck className="w-5 h-5 mx-auto opacity-80" />
              <span>Livraison 24h/48h</span>
            </div>
          </div>

          {/* Primary Action */}
          <div className="pt-4">
            <button
              onClick={onExplore}
              className="px-10 py-5 bg-[#D4AF37] hover:bg-[#B88E2F] text-[#1A1510] font-black text-xs sm:text-sm tracking-[0.2em] uppercase rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto cursor-pointer"
            >
              <span>Explorer la boutique</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
