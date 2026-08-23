import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Truck,
  Building2,
  Wallet,
  CreditCard,
  Phone,
  MessageCircle,
  MapPin,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerInfo, DeliveryMethod, Order, PaymentMethod, StoreSettings } from '../../types';
import { formatFCFA, generateOrderConfirmationWhatsAppUrl } from '../../services/storeService';
import { Logo } from '../common/Logo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderPlaced: (order: Order) => Promise<void>;
  settings: StoreSettings;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items = [],
  onOrderPlaced,
  settings,
}) => {
  if (!isOpen) return null;

  const safeItems = items || [];
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '', phone: '', whatsapp: '', city: 'Ouagadougou', district: '', landmark: '', deliveryInstructions: '',
  });

  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Livraison à domicile');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Paiement à la livraison');
  const [mobileNetwork, setMobileNetwork] = useState<'Orange' | 'Moov' | 'Wave' | 'MTN'>('Orange');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number } | null>(null);

  const subtotal = safeItems.reduce((acc, item) => acc + (item.unitPrice || 0) * (item.quantity || 1), 0);
  const deliveryFee = subtotal >= (settings?.freeShippingThreshold || 60000) || deliveryMethod === 'Récupération en boutique' ? 0 : (settings?.defaultDeliveryFee || 2000);
  const total = Math.max(0, subtotal + deliveryFee - (promoApplied?.discount || 0));

  const handleNext = () => {
    if (step === 1 && (!customer.fullName || !customer.phone)) {
        alert('Veuillez remplir vos coordonnées.');
        return;
    }
    if (step === 2 && deliveryMethod === 'Livraison à domicile' && (!customer.district || !customer.landmark)) {
        alert('Veuillez préciser votre adresse de livraison.');
        return;
    }
    if (step < 3) setStep((step + 1) as any);
  };

  const handleBack = () => { if (step > 1) setStep((step - 1) as any); };

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [step, onClose]);

  const handleSubmit = async () => {
    try {
      const orderNumber = `AZF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        customer: { ...customer, whatsapp: sameAsPhone ? customer.phone : customer.whatsapp || customer.phone },
        items: safeItems,
        subtotal, deliveryFee, discount: promoApplied?.discount || 0, total,
        deliveryMethod, paymentMethod, status: 'Nouvelle',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };

      await onOrderPlaced(newOrder);
      setPlacedOrder(newOrder);
      setStep('success');
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#C5A059', '#0B1325'] });
      }, 100);
    } catch (err) {
      // Error is already handled by toast in App.tsx
      console.error("Submit error:", err);
    }
  };

  const steps = [
    { id: 1, label: 'Contact' },
    { id: 2, label: 'Livraison' },
    { id: 3, label: 'Paiement' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl bg-[#0B1325] text-[#F5F5F0] rounded-3xl shadow-2xl border border-[#C5A059]/30 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-[#050B18] border-b border-[#C5A059]/30 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Logo size="sm" variant="light" />
              {step !== 'success' && (
                <div className="flex items-center gap-2 ml-4">
                  {steps.map((s) => (
                    <React.Fragment key={s.id}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${step >= s.id ? 'bg-[#C5A059] text-[#0B1325] border-[#C5A059]' : 'border-white/20 text-white/40'}`}>
                        {s.id}
                      </div>
                      {s.id < 3 && <div className={`w-4 h-0.5 ${step > s.id ? 'bg-[#C5A059]' : 'bg-white/10'}`} />}
                    </React.Fragment>
                  ))}
                </div>
              )}
           </div>
           <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6 max-w-lg mx-auto py-4">
                <h3 className="text-2xl font-serif font-black text-[#C5A059] text-center">Vos Coordonnées</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">Nom Complet *</label>
                    <input type="text" value={customer.fullName} onChange={(e) => setCustomer({...customer, fullName: e.target.value})} className="w-full p-4 bg-[#10192C] border border-[#C5A059]/20 rounded-2xl mt-1 focus:border-[#C5A059] outline-none" placeholder="Ibrahim Traoré" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#C5A059]">Téléphone d'appel *</label>
                    <input type="tel" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} className="w-full p-4 bg-[#10192C] border border-[#C5A059]/20 rounded-2xl mt-1 focus:border-[#C5A059] outline-none" placeholder="+226 ..." />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-2xl border border-white/5">
                    <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)} className="w-5 h-5 accent-[#C5A059]" />
                    <span className="text-xs font-bold">Utiliser ce numéro pour WhatsApp</span>
                  </label>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6 max-w-lg mx-auto py-4">
                <h3 className="text-2xl font-serif font-black text-[#C5A059] text-center">Livraison Prestige</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setDeliveryMethod('Livraison à domicile')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${deliveryMethod.includes('domicile') ? 'bg-[#C5A059] text-[#0B1325] border-[#C5A059]' : 'bg-[#10192C] border-[#C5A059]/20 opacity-60'}`}>
                        <Truck className="w-6 h-6" /> <span className="text-[10px] font-black uppercase">À Domicile</span>
                    </button>
                    <button onClick={() => setDeliveryMethod('Récupération en boutique')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${!deliveryMethod.includes('domicile') ? 'bg-[#C5A059] text-[#0B1325] border-[#C5A059]' : 'bg-[#10192C] border-[#C5A059]/20 opacity-60'}`}>
                        <Building2 className="w-6 h-6" /> <span className="text-[10px] font-black uppercase">En Boutique</span>
                    </button>
                </div>
                <div className="space-y-4">
                  <select value={customer.city} onChange={(e) => setCustomer({...customer, city: e.target.value})} className="w-full p-4 bg-[#10192C] border border-[#C5A059]/20 rounded-2xl outline-none">
                    <option>Ouagadougou</option><option>Bobo-Dioulasso</option><option>Koudougou</option>
                  </select>
                  <input type="text" placeholder="Quartier (ex: Ouaga 2000)" value={customer.district} onChange={(e) => setCustomer({...customer, district: e.target.value})} className="w-full p-4 bg-[#10192C] border border-[#C5A059]/20 rounded-2xl" />
                  <input type="text" placeholder="Point de repère (Près de...)" value={customer.landmark} onChange={(e) => setCustomer({...customer, landmark: e.target.value})} className="w-full p-4 bg-[#10192C] border border-[#C5A059]/20 rounded-2xl" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6 max-w-3xl mx-auto py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-xl font-serif font-black text-[#C5A059]">Moyen de Paiement</h3>
                        <div className="space-y-3">
                            {['Paiement à la livraison', 'Mobile Money', 'Wave'].map((m) => (
                                <button key={m} onClick={() => setPaymentMethod(m as any)} className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between ${paymentMethod === m ? 'bg-[#C5A059] text-[#0B1325] border-[#C5A059]' : 'bg-[#10192C] border-[#C5A059]/20'}`}>
                                    <span className="text-xs font-black uppercase">{m}</span>
                                    {paymentMethod === m && <CheckCircle2 className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-[#050B18] p-6 rounded-3xl border border-[#C5A059]/30 space-y-4">
                        <h4 className="font-serif font-black text-[#C5A059] uppercase text-sm border-b border-white/10 pb-2">Récapitulatif</h4>
                        <div className="space-y-2 text-xs font-bold">
                            <div className="flex justify-between"><span>Articles ({safeItems.length})</span><span>{formatFCFA(subtotal)}</span></div>
                            <div className="flex justify-between"><span>Livraison</span><span>{deliveryFee === 0 ? 'GRATUITE' : formatFCFA(deliveryFee)}</span></div>
                            <div className="flex justify-between text-lg text-[#C5A059] border-t border-white/10 pt-2 font-black"><span>TOTAL</span><span>{formatFCFA(total)}</span></div>
                        </div>
                        <button onClick={handleSubmit} className="w-full py-4 bg-[#C5A059] text-[#0B1325] font-black uppercase rounded-2xl shadow-xl mt-4 tracking-widest hover:scale-[1.02] transition-all">Confirmer & Commander</button>
                    </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && placedOrder && (
              <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8 py-10">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20"><CheckCircle2 className="w-10 h-10 text-white" /></div>
                <div>
                    <h2 className="text-3xl font-serif font-black text-[#C5A059]">Félicitations !</h2>
                    <p className="text-sm opacity-90 mt-2 text-white">Votre commande <span className="font-black text-[#C5A059]">#{placedOrder.orderNumber}</span> est validée.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10">
                    <a href={generateOrderConfirmationWhatsAppUrl(placedOrder, settings)} target="_blank" className="flex-1 p-4 bg-[#25D366] rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 uppercase hover:scale-105 transition-all"><MessageCircle className="w-5 h-5" /> Confirmer via WhatsApp</a>
                    <button onClick={() => window.print()} className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 uppercase hover:bg-white/10 transition-all"><Printer className="w-5 h-5" /> Reçu PDF</button>
                </div>
                <div className="pt-4 space-y-4">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest italic animate-pulse">Redirection automatique vers la boutique...</p>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-[#10192C] border border-[#C5A059]/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#C5A059] hover:bg-[#C5A059] hover:text-[#050B18] transition-all"
                  >
                    Continuer mes achats
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step !== 'success' && (
          <div className="p-6 bg-[#050B18] border-t border-[#C5A059]/20 flex justify-between items-center">
            {step > 1 ? (
                <button onClick={handleBack} className="flex items-center gap-2 text-xs font-black uppercase text-[#C5A059] hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Retour
                </button>
            ) : <div />}
            {step < 3 && (
                <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-[#C5A059] text-[#0B1325] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#d8b56f] transition-all">
                    Continuer <ArrowRight className="w-4 h-4" />
                </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
