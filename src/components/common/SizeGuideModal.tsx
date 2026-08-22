import React from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#0B1325] border border-[#C5A059]/40 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp text-[#F5F5F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#050B18] text-[#F5F5F0] p-6 flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#10192C] rounded-xl text-[#C5A059] border border-[#C5A059]/30">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-[#F5F5F0]">Guide des Tailles — AZIZ FASHION</h3>
              <p className="text-xs text-[#C5A059] tracking-wider uppercase font-semibold">Coupes confectionnées pour une allure parfaite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#F5F5F0]/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="bg-[#10192C] p-4 rounded-xl border border-[#C5A059]/20 text-xs sm:text-sm text-[#F5F5F0]/80 space-y-1.5 leading-relaxed">
            <p className="font-bold text-[#C5A059]">📌 Comment choisir la bonne taille ?</p>
            <p>Nos chemises sont taillées selon les standards africains et internationaux. Si vous préférez une coupe plus ajustée (slim), prenez votre taille habituelle. Pour un tombé plus ample ou cérémonial, optez pour une taille au-dessus.</p>
          </div>

          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#10192C] text-[#C5A059] text-xs uppercase tracking-wider border-b border-[#C5A059]/30">
                  <th className="p-3.5 rounded-l-lg font-bold">Taille</th>
                  <th className="p-3.5 font-bold">Tour de poitrine</th>
                  <th className="p-3.5 font-bold">Tour de cou</th>
                  <th className="p-3.5 font-bold">Longueur chemise</th>
                  <th className="p-3.5 rounded-r-lg font-bold">Carrure épaules</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/15 text-[#F5F5F0]/90">
                <tr className="hover:bg-[#10192C]/70 transition-colors">
                  <td className="p-3.5 font-bold text-[#C5A059]">S (38-39)</td>
                  <td className="p-3.5">92 - 96 cm</td>
                  <td className="p-3.5">38 - 39 cm</td>
                  <td className="p-3.5">72 cm</td>
                  <td className="p-3.5">44 cm</td>
                </tr>
                <tr className="hover:bg-[#10192C]/70 transition-colors bg-[#10192C]/30">
                  <td className="p-3.5 font-bold text-[#C5A059]">M (40-41)</td>
                  <td className="p-3.5">98 - 104 cm</td>
                  <td className="p-3.5">40 - 41 cm</td>
                  <td className="p-3.5">74 cm</td>
                  <td className="p-3.5">46 cm</td>
                </tr>
                <tr className="hover:bg-[#10192C]/70 transition-colors">
                  <td className="p-3.5 font-bold text-[#C5A059]">L (42-43)</td>
                  <td className="p-3.5">106 - 112 cm</td>
                  <td className="p-3.5">42 - 43 cm</td>
                  <td className="p-3.5">76 cm</td>
                  <td className="p-3.5">48 cm</td>
                </tr>
                <tr className="hover:bg-[#10192C]/70 transition-colors bg-[#10192C]/30">
                  <td className="p-3.5 font-bold text-[#C5A059]">XL (44-45)</td>
                  <td className="p-3.5">114 - 120 cm</td>
                  <td className="p-3.5">44 - 45 cm</td>
                  <td className="p-3.5">78 cm</td>
                  <td className="p-3.5">50 cm</td>
                </tr>
                <tr className="hover:bg-[#10192C]/70 transition-colors">
                  <td className="p-3.5 font-bold text-[#C5A059]">XXL (46-47)</td>
                  <td className="p-3.5">122 - 130 cm</td>
                  <td className="p-3.5">46 - 47 cm</td>
                  <td className="p-3.5">80 cm</td>
                  <td className="p-3.5">52 cm</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Measuring tips */}
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-[#F5F5F0]/70">
            <div className="flex items-start gap-2 p-3 bg-[#10192C] border border-[#C5A059]/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#F5F5F0]">Tour de poitrine :</span> Placez le mètre ruban bien horizontalement sous les aisselles au point le plus large.
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-[#10192C] border border-[#C5A059]/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#F5F5F0]">Sur-mesure disponible :</span> Vous avez une morphologie particulière ? Contactez notre atelier directement sur WhatsApp !
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050B18] border-t border-[#C5A059]/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
