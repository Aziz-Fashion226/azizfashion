import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  Building,
} from 'lucide-react';
import { StoreSettings } from '../../types';

interface ContactSectionProps {
  settings: StoreSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    const text = encodeURIComponent(
      `*Message Boutique / Contact*\n• *Nom :* ${name}\n• *Téléphone :* ${phone || 'Non renseigné'}\n• *Message :* ${message}`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
    setSubmitted(true);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#050B18] text-[#F5F5F0] relative overflow-hidden border-t border-[#C5A059]/20">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#10192C]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10192C] text-[#C5A059] text-xs font-bold uppercase tracking-widest border border-[#C5A059]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Boutique & Prise de Rendez-vous</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#F5F5F0] tracking-tight">
            Venez essayer nos créations à la Boutique
          </h2>
          <p className="text-sm text-[#F5F5F0]/70">
            Notre équipe vous accueille pour des essayages personnalisés, des conseils de style et la découverte de nos nouvelles collections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Info cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-[#0B1325] backdrop-blur-md rounded-2xl border border-[#C5A059]/30 space-y-4 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#C5A059]/5 rounded-full blur-2xl group-hover:bg-[#C5A059]/10 transition-all" />

              <h3 className="text-lg font-bold font-serif text-[#C5A059] flex items-center gap-2">
                <Building className="w-5 h-5" />
                <span>Localisation Boutique</span>
              </h3>

              <div className="space-y-3">
                <p className="text-xs text-[#F5F5F0] font-bold leading-relaxed">
                  {settings.addressShowroom}
                </p>
                <div className="p-3 bg-[#10192C] rounded-xl border border-white/5 space-y-2">
                  <p className="text-[10px] text-[#C5A059] font-black uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Itinéraire précis
                  </p>
                  <p className="text-[11px] text-[#F5F5F0]/70 leading-relaxed italic">
                    "Située sur la route du SIAO. En quittant la pédiatrie Charles de Gaulle, tournez à droite à la station service Sogel B. La boutique se trouve au deuxième six-mètres."
                  </p>
                </div>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=12.355130,-1.488179"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#C5A059] hover:text-[#050B18] transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Ouvrir dans Google Maps
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-[#0B1325] backdrop-blur-md rounded-2xl border border-[#C5A059]/30 space-y-2">
                <Clock className="w-4 h-4 text-[#C5A059]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">Horaires d'Ouverture</h4>
                <p className="text-xs text-[#F5F5F0]/70">
                  Lun - Sam : 08h30 – 19h30<br />
                  Dimanche : Sur rendez-vous
                </p>
              </div>

              <div className="p-5 bg-[#0B1325] backdrop-blur-md rounded-2xl border border-[#C5A059]/30 space-y-2">
                <Phone className="w-4 h-4 text-[#C5A059]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">Téléphone & WhatsApp</h4>
                <p className="text-xs text-[#F5F5F0]/70">
                  {settings.phoneDisplay}<br />
                  {settings.whatsappDisplay}
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#10192C] rounded-2xl border border-[#C5A059]/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C5A059] text-[#050B18] flex items-center justify-center font-bold shrink-0 shadow-lg">
                <MessageCircle className="w-6 h-6 fill-[#050B18]" />
              </div>
              <div className="text-xs">
                <strong className="block text-[#F5F5F0] font-bold text-sm">Assistance WhatsApp 7j/7</strong>
                <span className="text-[#F5F5F0]/70">Réponse garantie en moins de 15 minutes.</span>
              </div>
            </div>
          </div>

          {/* Contact form (7 cols) */}
          <div className="lg:col-span-7 bg-[#0B1325] p-8 rounded-3xl text-[#F5F5F0] shadow-2xl border border-[#C5A059]/30">
            <h3 className="text-xl font-bold font-serif text-[#F5F5F0] mb-2">
              Envoyez-nous un message direct
            </h3>
            <p className="text-xs text-[#F5F5F0]/60 mb-6">
              Remplissez ce formulaire court pour être mis en relation directement avec nos conseillers.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-200 text-base">Message transmis avec succès</h4>
                <p className="text-xs text-emerald-300">
                  Votre message a été redirigé vers notre conseiller WhatsApp. Nous vous répondrons immédiatement.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold uppercase text-[#C5A059] underline cursor-pointer"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                      Votre Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Moussa Sanogo"
                      className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-xs sm:text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                      Téléphone ou WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: +226 70 00 00 00"
                      className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-xs sm:text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                    Votre Message ou Question *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Précisez votre demande (disponibilité d'un modèle, visite boutique...)"
                    className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-xs sm:text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#050B18]" />
                  <span>Envoyer ma demande</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
