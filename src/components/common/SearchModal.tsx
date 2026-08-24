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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aziz_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('aziz_recent_searches', JSON.stringify(updated));
  };

  const safeProducts = products || [];
  const filteredProducts = query.trim() === ''
    ? safeProducts.filter(p => p.featured || p.badge === 'Populaire').slice(0, 4)
    : safeProducts.filter(
        (p) =>
          p && (
            (p.name || '').toLowerCase().includes(query.toLowerCase()) ||
            (p.description || '').toLowerCase().includes(query.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(query.toLowerCase()) ||
            (p.fabric || '').toLowerCase().includes(query.toLowerCase())
          )
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#0B1325] text-[#F5F5F0] rounded-2xl shadow-2xl border border-[#C5A059]/30 overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-5 border-b border-[#C5A059]/20 flex items-center gap-3 bg-[#050B18]">
          <Search className="w-6 h-6 text-[#C5A059] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveSearch(query)}
            placeholder="Rechercher par nom, tissu..."
            className="w-full bg-transparent text-[#F5F5F0] text-lg placeholder-slate-600 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#F5F5F0]/50 hover:text-[#F5F5F0] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-black text-[#F5F5F0]/70 hover:text-white bg-[#10192C] rounded-lg border border-[#C5A059]/30 cursor-pointer uppercase tracking-widest"
          >
            Fermer
          </button>
        </div>

        {/* Suggestions & Recent Searches */}
        <div className="bg-[#0B1325] border-b border-[#C5A059]/15 p-4 space-y-4">
          {recentSearches.length > 0 && query === '' && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#F5F5F0]/40 uppercase font-black tracking-tighter mr-2">Récents :</span>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 bg-[#050B18] hover:bg-[#1A2644] text-slate-300 rounded-lg border border-white/5 transition-all cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#C5A059]/60 uppercase font-black tracking-tighter mr-2">Savoir-faire :</span>
            {['Faso Danfani', "Pathé'O", 'Lin', 'Lin cassé', 'Luxe'].map((term) => (
              <button
                key={term}
                onClick={() => { setQuery(term); saveSearch(term); }}
                className="px-3 py-1.5 bg-[#10192C] hover:bg-[#C5A059] hover:text-[#050B18] text-[#C5A059] rounded-lg border border-[#C5A059]/30 transition-all cursor-pointer font-bold"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-[#C5A059]/10">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-[#10192C] rounded-full flex items-center justify-center text-slate-600 mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-serif font-bold text-[#F5F5F0]">Aucun résultat</p>
                <p className="text-xs text-slate-500">Essayez des termes plus larges comme "Coton" ou "Danfani"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059] px-4 py-3">
                {query.trim() === '' ? 'Nos Recommandations Prestige' : `${filteredProducts.length} Création(s) trouvée(s)`}
              </div>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    saveSearch(query || product.name);
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#10192C] cursor-pointer transition-all group border border-transparent hover:border-[#C5A059]/20 mx-1"
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-16 h-20 object-cover rounded-xl border border-[#C5A059]/20 shrink-0 bg-[#050B18] shadow-lg group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-[#F5F5F0] text-base group-hover:text-[#C5A059] transition-colors leading-none">
                          {product.name}
                        </h4>
                        {(product.badge === 'Populaire' || product.featured) && (
                          <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#F5F5F0]/50 line-clamp-1 italic uppercase tracking-wider">{product.tagline}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="font-black text-[#C5A059] text-sm">{formatFCFA(product.price)}</span>
                        <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-[#050B18] text-slate-400 border border-white/5">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 text-[#C5A059] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
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
