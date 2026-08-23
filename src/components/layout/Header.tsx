import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Heart, Menu, X, Shield, Phone, Sparkles, User } from 'lucide-react';
import { Logo } from '../common/Logo';
import { StoreSettings } from '../../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
  settings: StoreSettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenAdmin,
  isAdminLoggedIn,
  settings,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Accueil' },
    { id: 'shop', label: 'Boutique' },
    { id: 'new', label: 'Nouveautés' },
    { id: 'about', label: 'À Propos' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (tabId: string) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Main Navigation Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-2.5 sm:py-3 border-b border-[#D4AF37]/20'
            : 'bg-[#F7F3ED] py-3.5 sm:py-4 border-b border-[#D4AF37]/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile menu hamburger button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1510] hover:text-[#D4AF37] focus:outline-none transition-colors"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#1A1510] hover:text-[#D4AF37] transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer transition-transform duration-200 active:scale-95"
          >
            <Logo size={isScrolled ? 'sm' : 'md'} variant="dark" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {(navLinks || []).map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`text-[13px] font-bold tracking-widest transition-all duration-200 relative py-1 uppercase cursor-pointer ${
                    isActive
                      ? 'text-[#D4AF37]'
                      : 'text-[#1A1510]/70 hover:text-[#1A1510]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />
                  )}
                </button>
              );
            })}

            {/* Added Quick Contact in Nav */}
            <div className="flex items-center gap-4 pl-4 border-l border-[#D4AF37]/20 ml-4">
               <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[#25D366] flex items-center gap-1.5 hover:scale-105 transition-transform"
              >
                <Phone className="w-3 h-3" />
                <span>{settings.whatsappDisplay}</span>
              </a>
            </div>
          </nav>

          {/* Header Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Search Button */}
            <button
              onClick={onOpenSearch}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-[#F7F3ED] text-[#1A1510]/80 hover:text-[#1A1510] border border-[#D4AF37]/20 transition-all text-[11px] font-black uppercase tracking-widest cursor-pointer shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Rechercher</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-[#1A1510]/70 hover:text-[#D4AF37] transition-colors cursor-pointer"
              aria-label="Favoris"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#D4AF37] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 p-2 sm:px-4 sm:py-2.5 rounded-2xl bg-[#1A1510] text-white hover:bg-[#2A2520] font-black text-[11px] uppercase tracking-widest shadow-xl transition-all duration-200 transform active:scale-95 cursor-pointer"
              aria-label="Panier"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="bg-[#D4AF37] text-[#1A1510] text-[10px] font-black px-1.5 py-0.5 rounded-md">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[80px] z-50 bg-[#F7F3ED]/98 backdrop-blur-xl border-t border-[#D4AF37]/20 p-8 flex flex-col justify-between animate-fadeIn">
          <div className="space-y-6">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-4">
              MENU
            </div>
            {(navLinks || []).map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left py-2 text-2xl font-serif font-black transition-all flex items-center justify-between cursor-pointer ${
                  currentView === link.id
                    ? 'text-[#D4AF37]'
                    : 'text-[#1A1510]'
                }`}
              >
                <span>{link.label}</span>
                {currentView === link.id && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
              </button>
            ))}

            <div className="pt-4 border-t border-[#C5A059]/20 space-y-2">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#10192C] text-[#F5F5F0] text-sm font-semibold hover:bg-[#1A2644] transition-colors cursor-pointer border border-[#C5A059]/20"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C5A059]" />
                  Espace Administrateur
                </span>
                <span className="text-xs text-[#C5A059]">
                  {isAdminLoggedIn ? 'Connecté' : 'Accéder'}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#C5A059]/20 text-center text-xs text-[#F5F5F0]/60 space-y-2">
            <p className="text-[#F5F5F0]/80 font-medium">Showroom Ouagadougou • Livraison dans toute la sous-région</p>
            <p className="text-[#C5A059]">WhatsApp : {settings?.whatsappDisplay || '+226 70 00 00 00'}</p>
          </div>
        </div>
      )}
    </header>
  );
};
