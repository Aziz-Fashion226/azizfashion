import React from 'react';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { CartItem, StoreSettings } from '../../types';
import { formatFCFA, generateCartWhatsAppUrl } from '../../services/storeService';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onNavigate: (view: any) => void;
  settings: StoreSettings;
}

export const CartPage: React.FC<CartPageProps> = ({
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onNavigate,
  settings,
}) => {
  const safeItems = items || [];
  const subtotal = safeItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const isFreeShipping = subtotal >= (settings?.freeShippingThreshold || 60000);
  const deliveryFee = safeItems.length === 0 ? 0 : isFreeShipping ? 0 : (settings?.defaultDeliveryFee || 2000);
  const total = subtotal + deliveryFee;

  const freeShippingThreshold = settings?.freeShippingThreshold || 60000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleWhatsAppCheckout = () => {
    const url = generateCartWhatsAppUrl(safeItems, total, settings);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Cart Content */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('shop')} className="p-2 bg-white/5 rounded-full text-[#C5A059] hover:bg-[#C5A059] hover:text-[#050B18] transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-3xl font-serif font-black uppercase tracking-tighter">Mon Panier</h2>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-4 py-1.5 rounded-full border border-[#C5A059]/20">
              {safeItems.reduce((a, b) => a + b.quantity, 0)} article(s)
            </span>
          </div>

          {safeItems.length === 0 ? (
            <div className="bg-[#10192C] rounded-[2.5rem] p-12 text-center border border-white/5 space-y-6">
              <div className="w-24 h-24 bg-[#050B18] rounded-full flex items-center justify-center mx-auto border border-[#C5A059]/20 shadow-xl">
                <ShoppingBag className="w-10 h-10 text-slate-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-black">Votre panier est vide</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">Explorez nos créations en Faso Danfani et Koko Dunda pour trouver votre prochaine tenue d'exception.</p>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-[#050B18] font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#C5A059]/10"
              >
                Découvrir la boutique <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {safeItems.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="bg-[#10192C] p-6 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row gap-6 hover:border-[#C5A059]/30 transition-all group">
                  <div className="w-full sm:w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-[#050B18] shrink-0 border border-white/5">
                    <img src={item.product?.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-serif font-black">{item.product?.name}</h3>
                        <button onClick={() => onRemoveItem(item.productId, item.size)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 rounded-lg border border-[#C5A059]/20">Taille {item.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center bg-[#050B18] p-1.5 rounded-xl border border-white/10">
                        <button onClick={() => onUpdateQuantity(item.productId, item.size, -1)} className="w-8 h-8 rounded-lg bg-[#10192C] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#050B18] transition-all font-black">-</button>
                        <span className="w-12 text-center text-sm font-black text-[#F5F5F0]">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.productId, item.size, 1)} className="w-8 h-8 rounded-lg bg-[#10192C] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#050B18] transition-all font-black">+</button>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Article</div>
                        <div className="text-lg font-black text-[#C5A059]">{formatFCFA(item.unitPrice * item.quantity)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        {safeItems.length > 0 && (
          <aside className="w-full lg:w-[400px] space-y-6">
            <div className="bg-[#10192C] rounded-[2.5rem] border border-[#C5A059]/20 overflow-hidden shadow-2xl sticky top-28">
              {/* Shipping Progress */}
              <div className="p-8 bg-[#050B18] border-b border-[#C5A059]/20 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2 text-[#C5A059]"><Truck className="w-4 h-4" /> Livraison</span>
                  <span className="text-slate-400">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-[#C5A059] h-full transition-all duration-1000" style={{ width: `${freeShippingProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  {isFreeShipping ? (
                    <span className="text-emerald-400 font-black tracking-widest">✨ Livraison offerte activée !</span>
                  ) : (
                    <>Plus que <span className="text-[#C5A059]">{formatFCFA(remainingForFreeShipping)}</span> pour profiter de la livraison gratuite.</>
                  )}
                </p>
              </div>

              <div className="p-8 space-y-6">
                <h3 className="text-xl font-serif font-black uppercase tracking-tighter border-b border-white/5 pb-4">Résumé</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Sous-total</span>
                    <span className="text-white">{formatFCFA(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Livraison</span>
                    <span className={deliveryFee === 0 ? 'text-emerald-400 font-black uppercase' : 'text-white'}>
                      {deliveryFee === 0 ? 'Gratuite' : formatFCFA(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-6 border-t border-white/10">
                    <span className="text-sm font-black uppercase tracking-widest">Total à régler</span>
                    <div className="text-right">
                      <div className="text-3xl font-black text-[#C5A059] drop-shadow-lg">{formatFCFA(total)}</div>
                      <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Taxes incluses</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  <button
                    onClick={onProceedToCheckout}
                    className="w-full py-5 bg-[#C5A059] text-[#050B18] font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-[#C5A059]/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Valider ma commande <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-4 bg-emerald-600/10 border border-emerald-600/20 text-emerald-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> Acheter via WhatsApp
                  </button>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-4">
                  <div className="text-center space-y-1">
                    <ShieldCheck className="w-5 h-5 text-[#C5A059] mx-auto opacity-50" />
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Paiement Sécurisé</p>
                  </div>
                  <div className="text-center space-y-1">
                    <Truck className="w-5 h-5 text-[#C5A059] mx-auto opacity-50" />
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Suivi en direct</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
