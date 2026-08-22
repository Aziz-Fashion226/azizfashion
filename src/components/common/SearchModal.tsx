import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA } from '../../services/storeService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products = [],
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const safeProducts = products || [];
  const filteredProducts = query.trim() === ''
    ? safeProducts.slice(0, 4) // trending suggestion
    : safeProducts.filter(
        (p) =>
          p && (
            (p.name || '').toLowerCase().includes(query.toLowerCase()) ||
            (p.description || '').toLowerCase().includes(query.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(query.toLowerCase()) ||
            (p.fabric || '').toLowerCase().includes(query.toLowerCase()) ||
            (p.collar || '').toLowerCase().includes(query.toLowerCase())
          )
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#0B1325] text-[#F5F5F0] rounded-2xl shadow-2xl border border-[#C5A059]/30 overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#C5A059]/20 flex items-center gap-3 bg-[#050B18]">
          <Search className="w-6 h-6 text-[#C5A059] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une chemise (Faso Danfani, col Mao, lin, blanc, cérémonie...)"
            className="w-full bg-transparent text-[#F5F5F0] text-base placeholder-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#F5F5F0]/50 hover:text-[#F5F5F0] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-[#F5F5F0]/70 hover:text-white bg-[#10192C] rounded-lg border border-[#C5A059]/30 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Popular searches suggestions */}
        {query.trim() === '' && (
          <div className="p-4 bg-[#0B1325] border-b border-[#C5A059]/15 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#F5F5F0]/60 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Suggestions :
            </span>
            {['Faso Danfani', 'Col Officier', 'Bleu Nuit', 'Cérémonie', 'Lin'].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-2.5 py-1 bg-[#10192C] hover:bg-[#1A2644] text-[#C5A059] rounded-full border border-[#C5A059]/30 transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-[#C5A059]/15">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-[#F5F5F0]/60">
              <p className="text-base font-medium">Aucune chemise trouvée pour « {query} »</p>
              <p className="text-xs mt-1 text-[#F5F5F0]/40">Essayez avec d'autres termes comme « Danfani », « Prestige », « Blanc »...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#C5A059] px-2">
                {query.trim() === '' ? 'Modèles populaires' : `${filteredProducts.length} résultat(s)`}
              </div>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#10192C] cursor-pointer transition-all group border border-transparent hover:border-[#C5A059]/30"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-14 h-16 object-cover rounded-lg border border-[#C5A059]/30 shrink-0 bg-[#050B18]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#F5F5F0] text-sm group-hover:text-[#C5A059] transition-colors">
                          {product.name}
                        </h4>
                        {product.badge && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#050B18] text-[#C5A059] border border-[#C5A059]/30">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#F5F5F0]/60 line-clamp-1">{product.tagline}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-bold text-[#C5A059]">{formatFCFA(product.price)}</span>
                        {product.originalPrice && (
                          <span className="line-through text-[#F5F5F0]/40 text-[11px]">
                            {formatFCFA(product.originalPrice)}
                          </span>
                        )}
                        <span className="text-[11px] text-[#F5F5F0]/50 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#C5A059]" /> {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 text-[#F5F5F0]/40 group-hover:text-[#C5A059] group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
