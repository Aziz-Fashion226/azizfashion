import React from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CartItem, StoreSettings } from '../../types';
import { formatFCFA, generateCartWhatsAppUrl } from '../../services/storeService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: string, color: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  settings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  settings,
}) => {
  if (!isOpen) return null;

  const safeItems = items || [];
  const subtotal = safeItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const isFreeShipping = subtotal >= (settings?.freeShippingThreshold || 50000);
  const deliveryFee = safeItems.length === 0 ? 0 : isFreeShipping ? 0 : (settings?.defaultDeliveryFee || 1500);
  const total = subtotal + deliveryFee;

  const freeShippingThreshold = settings?.freeShippingThreshold || 50000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleWhatsAppCheckout = () => {
    const url = generateCartWhatsAppUrl(safeItems, total, settings);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0B1325] text-[#F5F5F0] shadow-2xl flex flex-col border-l border-[#C5A059]/30">
          {/* Header */}
          <div className="p-5 bg-[#050B18] text-[#F5F5F0] flex items-center justify-between border-b border-[#C5A059]/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#10192C] rounded-lg text-[#C5A059] border border-[#C5A059]/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F5F5F0]">Mon Panier</h3>
                <p className="text-xs text-[#C5A059] tracking-wider">
                  {safeItems.reduce((a, b) => a + b.quantity, 0)} article(s) sélectionné(s)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#F5F5F0]/60 hover:text-white hover:bg-[#10192C] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="bg-[#10192C] p-3.5 border-b border-[#C5A059]/20 text-xs">
            <div className="flex items-center justify-between text-[#F5F5F0] font-semibold mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                {isFreeShipping ? (
                  <strong className="text-emerald-400">✨ Félicitations ! Livraison offerte !</strong>
                ) : (
                  <span>
                    Plus que <strong className="text-[#C5A059]">{formatFCFA(remainingForFreeShipping)}</strong> pour la livraison offerte
                  </span>
                )}
              </span>
              <span className="text-[10px] text-[#F5F5F0]/50 font-mono">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div className="w-full bg-[#050B18] h-1.5 rounded-full overflow-hidden border border-[#C5A059]/20">
              <div
                className="bg-[#C5A059] h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {safeItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#F5F5F0]/60 space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#10192C] flex items-center justify-center text-[#C5A059] border border-[#C5A059]/30 shadow-inner">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#F5F5F0]">Votre panier est vide</h4>
                  <p className="text-xs text-[#F5F5F0]/50 mt-1 max-w-xs">
                    Découvrez nos collections de chemises locales et ajoutez vos coups de cœur.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#C5A059] text-[#050B18] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#d8b56f] transition-colors shadow-md cursor-pointer"
                >
                  Explorer la boutique
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#C5A059]/20">
                {safeItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="py-4 first:pt-0 flex gap-4"
                  >
                    <img
                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'}
                      alt={item.product?.name || 'Chemise'}
                      className="w-20 h-24 object-cover rounded-xl border border-[#C5A059]/30 shrink-0 bg-[#10192C]"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-[#F5F5F0] text-sm leading-tight">
                            {item.product?.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.productId, item.size, item.color)}
                            className="text-[#F5F5F0]/50 hover:text-red-400 p-1 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-[#F5F5F0]/60 font-medium">
                          <span className="px-2 py-0.5 bg-[#10192C] rounded border border-[#C5A059]/30 text-[#C5A059] font-bold">
                            Taille {item.size}
                          </span>
                          <span>• {item.color}</span>
                        </div>

                        <div className="text-xs text-[#F5F5F0]/50 mt-1">
                          Prix unitaire : {formatFCFA(item.unitPrice)}
                        </div>
                      </div>

                      {/* Quantity modifier and Subtotal */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[#C5A059]/30 rounded-lg bg-[#10192C] p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.size, item.color, -1)}
                            className="w-6 h-6 rounded bg-[#050B18] text-[#F5F5F0] hover:bg-[#1A2644] font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#C5A059]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.size, item.color, 1)}
                            className="w-6 h-6 rounded bg-[#050B18] text-[#F5F5F0] hover:bg-[#1A2644] font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-extrabold text-sm text-[#C5A059]">
                          {formatFCFA(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout Actions */}
          {safeItems.length > 0 && (
            <div className="p-5 bg-[#050B18] border-t border-[#C5A059]/30 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#F5F5F0]/70">
                  <span>Sous-total articles</span>
                  <span className="font-bold text-[#F5F5F0]">{formatFCFA(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#F5F5F0]/70">
                  <span>Frais de livraison estimés</span>
                  <span className="font-bold text-[#C5A059]">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">GRATUIT</span>
                    ) : (
                      formatFCFA(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#C5A059]/20 flex justify-between text-base font-extrabold text-[#F5F5F0]">
                  <span>Total à payer</span>
                  <span className="text-lg text-[#C5A059]">{formatFCFA(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full py-4 px-6 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>PASSER LA COMMANDE</span>
                  <ArrowRight className="w-4 h-4 text-[#050B18]" />
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Commander via WhatsApp</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-[#F5F5F0]/50 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                Paiement sécurisé • Aucun frais caché
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
