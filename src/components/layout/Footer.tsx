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
    <footer className="bg-[#050B18] text-[#F5F5F0] border-t border-[#C5A059]/30 pt-16 pb-24 lg:pb-12">
      {/* 4 Trust Pillars Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#C5A059]/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="p-3 bg-[#10192C] rounded-xl text-[#C5A059] shrink-0 border border-[#C5A059]/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F5F5F0]">Fabrication 100% Locale</h4>
              <p className="text-xs text-[#F5F5F0]/60 mt-0.5">Tissages artisanaux et cotons du terroir</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="p-3 bg-[#10192C] rounded-xl text-[#C5A059] shrink-0 border border-[#C5A059]/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F5F5F0]">Livraison Rapide</h4>
              <p className="text-xs text-[#F5F5F0]/60 mt-0.5">À domicile ou retrait en showroom</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="p-3 bg-[#10192C] rounded-xl text-[#C5A059] shrink-0 border border-[#C5A059]/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F5F5F0]">Paiement Souple</h4>
              <p className="text-xs text-[#F5F5F0]/60 mt-0.5">Mobile Money ou à la livraison</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="p-3 bg-[#10192C] rounded-xl text-[#C5A059] shrink-0 border border-[#C5A059]/30">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F5F5F0]">Échange Facile</h4>
              <p className="text-xs text-[#F5F5F0]/60 mt-0.5">Ajustement ou échange sous 48h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Slogan */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" variant="light" />
            <p className="text-sm text-[#F5F5F0]/70 max-w-sm leading-relaxed">
              AZIZ FASHION est la maison burkinabè de référence pour les chemises locales modernes pour homme. Nous célébrons l'alliance du savoir-faire africain et des coupes contemporaines haut de gamme.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${phoneClean}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#10192C] hover:bg-[#25D366] text-[#F5F5F0]/80 hover:text-white rounded-full transition-all border border-[#C5A059]/20"
                title="WhatsApp Aziz Fashion"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#10192C] hover:bg-[#1877F2] text-[#F5F5F0]/80 hover:text-white rounded-full transition-all border border-[#C5A059]/20"
                title="Facebook Aziz Fashion"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#10192C] hover:bg-[#E1306C] text-[#F5F5F0]/80 hover:text-white rounded-full transition-all border border-[#C5A059]/20"
                title="Instagram Aziz Fashion"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-bold text-[#C5A059] uppercase tracking-wider">
              Boutique
            </h5>
            <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Toutes les chemises
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('new')}
                  className="hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Nouveautés
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Faso Danfani noble
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Cérémonie & Prestige
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className="hover:text-[#C5A059] transition-colors text-[#C5A059] underline cursor-pointer"
                >
                  Guide des tailles
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Maison */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-bold text-[#C5A059] uppercase tracking-wider">
              La Maison
            </h5>
            <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  À propos d'Aziz Fashion
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Notre Showroom
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Confection & Tissage
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#C5A059] transition-colors text-xs text-slate-400 cursor-pointer"
                >
                  Administration
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Showroom */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-bold text-[#C5A059] uppercase tracking-wider">
              Contact & Retrait
            </h5>
            <ul className="space-y-2.5 text-xs text-[#F5F5F0]/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>{settings?.addressShowroom || 'Ouagadougou'}, {settings?.cityCountry || 'Burkina Faso'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>{settings?.phoneDisplay || '+226 70 00 00 00'}</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href={`https://wa.me/${phoneClean}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#25D366] underline cursor-pointer"
                >
                  WhatsApp direct : {settings?.whatsappDisplay || '+226 70 00 00 00'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>{settings?.emailContact || 'contact@azizfashion.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Accepted Payment badges */}
        <div className="mt-12 pt-8 border-t border-[#C5A059]/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#F5F5F0]/50">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="font-semibold text-[#F5F5F0]/70">Moyens de paiement acceptés :</span>
            <span className="px-2.5 py-1 bg-[#10192C] border border-[#C5A059]/30 rounded-md text-[#F5F5F0] font-medium">Orange Money</span>
            <span className="px-2.5 py-1 bg-[#10192C] border border-[#C5A059]/30 rounded-md text-[#F5F5F0] font-medium">Moov Money</span>
            <span className="px-2.5 py-1 bg-[#10192C] border border-[#C5A059]/30 rounded-md text-[#F5F5F0] font-medium">Wave</span>
            <span className="px-2.5 py-1 bg-[#10192C] border border-[#C5A059]/30 rounded-md text-[#F5F5F0] font-medium">CinetPay / Cartes</span>
            <span className="px-2.5 py-1 bg-[#10192C] border border-[#C5A059]/30 rounded-md text-[#F5F5F0] font-medium">Paiement à la livraison</span>
          </div>

          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} Aziz Fashion — Tous droits réservés</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
