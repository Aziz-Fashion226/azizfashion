import React from 'react';
import { Award, Scissors, Compass, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';
import { Logo } from '../common/Logo';

export const BrandStory: React.FC = () => {
  const pillars = [
    {
      icon: <Award className="w-8 h-8 text-[#C5A059]" />,
      title: 'Sélection Authentique',
      subtitle: 'Coton & Tissages du Terroir',
      description:
        'Chaque chemise est choisie avec soin au Burkina Faso pour la qualité de son coton local et de son tissage Faso Danfani ou Koko Dunda réalisé par des artisans maîtres.',
    },
    {
      icon: <Scissors className="w-8 h-8 text-[#C5A059]" />,
      title: 'Qualité Premium',
      subtitle: 'Coupes et Finitions d\'Orfèvre',
      description:
        'Cols renforcés, surpiqûres précises, boutons en nacre véritable et liserés gansés au fil d\'or. Rien n\'est laissé au hasard pour assurer tenue et longévité.',
    },
    {
      icon: <Compass className="w-8 h-8 text-[#C5A059]" />,
      title: 'Style & Identité',
      subtitle: 'L\'Afrique Moderne & Conquérante',
      description:
        'Nous rejetons le folklore banal pour proposer une mode africaine contemporaine, cosmopolite et adaptée aux exigences des hommes d\'affaires et leaders d\'aujourd\'hui.',
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-[#C5A059]" />,
      title: 'Service de Proximité',
      subtitle: 'Écoute & Réactivité WhatsApp',
      description:
        'Un suivi personnalisé de votre commande du choix de la taille jusqu\'à la livraison à domicile ou au bureau avec possibilité d\'essayage.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#050B18] border-y border-[#C5A059]/20 relative overflow-hidden text-[#F5F5F0]">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10192C] text-[#C5A059] text-xs font-bold uppercase tracking-widest border border-[#C5A059]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Boutique de Mode</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F5F0] tracking-tight font-serif"
          >
            L'Âme d'Aziz Fashion
          </h2>
          <div className="w-20 h-1 bg-[#C5A059] mx-auto rounded-full" />
          <p className="text-base sm:text-lg text-[#F5F5F0]/70 leading-relaxed max-w-2xl mx-auto">
            Née de la passion pour le textile burkinabè et l'élégance masculine contemporaine, la marque <strong className="text-[#C5A059]">AZIZ FASHION</strong> réinvente la chemise africaine pour en faire le standard du vestiaire raffiné.
          </p>
        </div>

        {/* 4 Pillars Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(pillars || []).map((pillar, idx) => (
            <div
              key={idx}
              className="bg-[#0B1325] p-8 rounded-2xl border border-[#C5A059]/30 shadow-sm hover:shadow-xl hover:border-[#C5A059] transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#10192C] flex items-center justify-center border border-[#C5A059]/30 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#F5F5F0] font-serif group-hover:text-[#C5A059] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider mt-1">
                    {pillar.subtitle}
                  </p>
                </div>
                <p className="text-sm text-[#F5F5F0]/70 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[#C5A059]/20 flex items-center gap-2 text-xs font-bold text-[#F5F5F0] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>Engagement Qualité</span>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Craft Banner */}
        <div className="mt-16 bg-[#0B1325] text-white rounded-3xl p-8 sm:p-12 border border-[#C5A059]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-[#10192C] border border-[#C5A059]/40 rounded-full text-xs font-bold text-[#C5A059] tracking-widest uppercase">
                Savoir-Faire & Noblesse
              </div>
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F5F5F0] leading-tight font-serif"
              >
                L'excellence du textile burkinabè en prêt-à-porter
              </h3>
              <p className="text-sm sm:text-base text-[#F5F5F0]/80 leading-relaxed">
                Notre boutique sélectionne des pièces d'exception issues d'un travail minutieux : le choix des meilleurs fils, un tissage traditionnel régulier et une finition irréprochable.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-[#C5A059]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                  100% Tissé main
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                  Anti-transpirant & respirant
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                  Coupe calibrée
                </div>
              </div>
            </div>

            {/* Look Image Showcase */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80"
                alt="Détail col et boutons nacrés"
                className="rounded-2xl object-cover h-48 sm:h-60 w-full border border-[#C5A059]/30 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <img
                src="https://images.unsplash.com/photo-1620012253295-c15c429fccf8?auto=format&fit=crop&w=600&q=80"
                alt="Chemise africaine de gala"
                className="rounded-2xl object-cover h-48 sm:h-60 w-full border border-[#C5A059]/30 shadow-lg mt-6"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
