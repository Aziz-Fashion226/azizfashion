import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { Logo } from '../common/Logo';
import { StoreSettings } from '../../types';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenSizeGuide: () => void;
  onOpenAdmin: () => void;
  settings: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenSizeGuide,
  onOpenAdmin,
  settings,
}) => {
  const phoneClean = (settings?.whatsappNumber || '+22670000000').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#1A1510] text-[#F5F5F0] border-t border-[#D4AF37]/20 pt-12 pb-24 lg:pb-12">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="space-y-6">
            <Logo size="md" variant="light" showSubtitle={false} />
            <p className="text-xs text-[#F5F5F0]/60 leading-relaxed uppercase tracking-widest font-bold">
              Boutique de Prêt-à-Porter <br /> Ouagadougou
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h5 className="font-serif text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">
              Boutique
            </h5>
            <ul className="space-y-2 text-[11px] font-bold uppercase tracking-widest text-[#F5F5F0]/70">
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Toutes les chemises
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('new')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Nouveautés
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Maison */}
          <div className="space-y-3">
            <h5 className="font-serif text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">
              La Maison
            </h5>
            <ul className="space-y-2 text-[11px] font-bold uppercase tracking-widest text-[#F5F5F0]/70">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  À propos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Réseaux Sociaux */}
          <div className="space-y-3">
             <h5 className="font-serif text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">
              Suivez-nous
            </h5>
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${phoneClean}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/5 hover:bg-[#25D366] text-white/80 hover:text-white rounded-full transition-all border border-white/10"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/5 hover:bg-[#1877F2] text-white/80 hover:text-white rounded-full transition-all border border-white/10"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/5 hover:bg-[#E1306C] text-white/80 hover:text-white rounded-full transition-all border border-white/10"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0]/30">
          <p>© {new Date().getFullYear()} Aziz Fashion — Boutique de Mode</p>
          <button
            onClick={onOpenAdmin}
            className="hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            Administration
          </button>
        </div>
      </div>
    </footer>
  );
};
