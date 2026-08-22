import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { StoreSettings } from '../../types';

interface WhatsAppFloatProps {
  settings: StoreSettings;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const phone = (settings?.whatsappNumber || '+22670000000').replace(/[^0-9]/g, '');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = customMsg.trim() || "Bonjour Aziz Fashion 👋🏾, j'aimerais avoir des conseils pour choisir une chemise.";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setCustomMsg('');
  };

  const handleQuickQuestion = (question: string) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(`Bonjour Aziz Fashion 👋🏾\n\n${question}`)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Interactive Popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-[#0B1325] rounded-2xl shadow-2xl border border-[#C5A059]/40 overflow-hidden animate-scaleUp text-[#F5F5F0]">
          {/* Header */}
          <div className="bg-[#050B18] text-[#F5F5F0] p-4 flex items-center justify-between border-b border-[#C5A059]/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#C5A059] text-[#050B18] flex items-center justify-center font-black text-sm">
                  AF
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#050B18] rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#F5F5F0]">Conciergerie Aziz Fashion</h4>
                <p className="text-[11px] text-[#C5A059] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En ligne • Réponse en 15 min
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#F5F5F0]/60 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#0B1325] space-y-3">
            <div className="bg-[#10192C] p-3.5 rounded-xl rounded-tl-none border border-[#C5A059]/20 text-xs text-[#F5F5F0]/90 shadow-sm leading-relaxed">
              <p className="font-bold text-[#C5A059] mb-1">Bonjour et bienvenue chez Aziz Fashion ! 👔</p>
              <p>Besoin d'un conseil taille, d'une confection spéciale ou d'une livraison express ? Nous sommes à votre écoute directe sur WhatsApp.</p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider">Questions fréquentes :</p>
              <button
                onClick={() => handleQuickQuestion("Quels sont les délais de livraison à Ouagadougou et en province ?")}
                className="w-full text-left text-xs p-2.5 bg-[#10192C] hover:bg-[#1A2644] text-[#F5F5F0] hover:text-[#C5A059] rounded-xl border border-[#C5A059]/20 transition-colors cursor-pointer"
              >
                🚚 Délais et frais de livraison ?
              </button>
              <button
                onClick={() => handleQuickQuestion("Proposez-vous la confection sur-mesure pour cérémonies ou mariages ?")}
                className="w-full text-left text-xs p-2.5 bg-[#10192C] hover:bg-[#1A2644] text-[#F5F5F0] hover:text-[#C5A059] rounded-xl border border-[#C5A059]/20 transition-colors cursor-pointer"
              >
                ✂️ Confection sur-mesure & cérémonies ?
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Écrivez votre message ici..."
                className="flex-1 text-xs p-2.5 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Contacter sur WhatsApp"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
        </div>
        <span className="text-xs sm:text-sm font-semibold tracking-wide hidden sm:inline">
          Commander sur WhatsApp
        </span>
      </button>
    </div>
  );
};
