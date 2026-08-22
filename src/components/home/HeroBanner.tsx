import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Shirt, Award, ChevronRight } from 'lucide-react';
import { StoreSettings } from '../../types';

interface HeroBannerProps {
  onExploreCollection: () => void;
  onOrderNow: () => void;
  onOpenWhatsApp: () => void;
  settings: StoreSettings;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreCollection,
  onOrderNow,
  onOpenWhatsApp,
  settings,
}) => {
  // Preset of interchangeable hero visuals
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1600&q=85',
      tag: 'NOUVELLE COLLECTION 2026',
      title: "L'élégance locale, autrement.",
      subtitle: 'Découvrez des chemises qui associent style contemporain, identité africaine et savoir-faire local.',
      highlight: 'Tissage Faso Danfani Noble',
    },
    {
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
      tag: 'HAUTE CONFECTION MASCULINE',
      title: "L'allure des hommes d'exception.",
      subtitle: 'Coupes modernes ajustées, cols officiers impeccables et finitions d\'orfèvre au fil d\'or.',
      highlight: 'Série Prestige & Cérémonie',
    },
    {
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1600&q=85',
      tag: 'ÉDITION LIMITÉE NOIR & OR',
      title: 'La signature vestimentaire du Sahel.',
      subtitle: 'Des pièces fortes confectionnées à la main dans notre atelier de Ouagadougou.',
      highlight: 'Coton 100% Biologique Local',
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const current = heroSlides[activeSlide];

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] bg-[#070C18] flex items-center overflow-hidden">
      {/* Background Image Carousel with Smooth Transitions */}
      {(heroSlides || []).map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          style={{ transition: 'opacity 1s ease-in-out, transform 8s ease-out' }}
        >
          <img
            src={slide.image}
            alt="Aziz Fashion Mannequin"
            className="w-full h-full object-cover object-top sm:object-center filter brightness-[0.65] contrast-[1.05]"
            referrerPolicy="no-referrer"
          />
          {/* Multi-layered luxury gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B18] via-[#050B18]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050B18]/90 via-[#050B18]/50 to-transparent" />
        </div>
      ))}

      {/* Decorative Gold Elements */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-[#0B192C]/40 rounded-full blur-2xl pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="max-w-2xl text-left space-y-6">
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10192C] backdrop-blur-md border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold tracking-widest uppercase animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{current.tag}</span>
          </div>

          {/* Main Title */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5F5F0] tracking-tight leading-[1.1] drop-shadow-md font-serif"
          >
            {current.title.split(',')[0]}
            {current.title.includes(',') && (
              <span className="block text-[#C5A059] font-light italic text-3xl sm:text-5xl lg:text-5xl mt-2 font-serif">
                {current.title.split(',')[1]}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#F5F5F0]/80 leading-relaxed max-w-xl font-normal">
            {current.subtitle}
          </p>

          {/* Feature Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A059]">
            <Award className="w-4 h-4" />
            <span>{current.highlight}</span>
            <span className="text-slate-500">•</span>
            <span>Confection à Ouagadougou</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              onClick={onExploreCollection}
              className="px-8 py-4 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-extrabold text-xs sm:text-sm tracking-widest uppercase rounded-xl shadow-[0_4px_25px_rgba(197,160,89,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>DÉCOUVRIR LA COLLECTION</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOrderNow}
              className="px-8 py-4 bg-[#10192C] hover:bg-[#1A2644] text-[#F5F5F0] font-bold text-xs sm:text-sm tracking-widest uppercase rounded-xl backdrop-blur-md border border-[#C5A059]/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>COMMANDER MAINTENANT</span>
              <ChevronRight className="w-4 h-4 text-[#C5A059]" />
            </button>
          </div>

          {/* Slide Navigation Dots */}
          <div className="flex items-center gap-2.5 pt-6">
            {(heroSlides || []).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeSlide ? 'w-8 bg-[#C5A059]' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Trust Badge on Desktop */}
      <div className="hidden xl:block absolute bottom-8 right-8 z-10 p-5 rounded-2xl bg-[#0B1325]/90 backdrop-blur-md border border-[#C5A059]/30 text-[#F5F5F0] shadow-2xl max-w-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#10192C] flex items-center justify-center text-[#C5A059] shrink-0 border border-[#C5A059]/30">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
              100% Coton Noble
            </div>
            <div className="text-sm font-bold text-[#F5F5F0]">Coupes Modernes</div>
            <div className="text-[11px] text-[#F5F5F0]/60 mt-0.5">Tailles S à XXL disponibles</div>
          </div>
        </div>
      </div>
    </section>
  );
};
