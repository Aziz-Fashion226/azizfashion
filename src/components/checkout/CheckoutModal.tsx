import React, { useState } from 'react';
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
} from 'lucide-react';
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

  // Steps: 'form' | 'success'
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Form State
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    whatsapp: '',
    city: 'Ouagadougou',
    district: '',
    landmark: '',
    deliveryInstructions: '',
  });

  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Livraison à domicile');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Paiement à la livraison');
  const [mobileNetwork, setMobileNetwork] = useState<'Orange' | 'Moov' | 'Wave' | 'MTN'>('Orange');

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Online Card Simulation State
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Calculations
  const freeThreshold = settings?.freeShippingThreshold ?? 50000;
  const defDeliveryFee = settings?.defaultDeliveryFee ?? 1500;
  const subtotal = safeItems.reduce((acc, item) => acc + (item.unitPrice || 0) * (item.quantity || 1), 0);
  const isFreeShipping = subtotal >= freeThreshold || deliveryMethod === 'Récupération en boutique / showroom';
  const deliveryFee = isFreeShipping ? 0 : defDeliveryFee;
  const discountAmount = promoApplied ? promoApplied.discount : 0;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Handle Promo Code
  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const codeClean = promoCode.trim().toUpperCase();
    if (codeClean === 'AZIZ10') {
      const discount = Math.round(subtotal * 0.1);
      setPromoApplied({ code: 'AZIZ10 (10% de réduction)', discount });
    } else if (codeClean === 'ELEGANCE5') {
      setPromoApplied({ code: 'ELEGANCE5 (-5 000 FCFA)', discount: 5000 });
    } else if (codeClean === 'BIENVENUE') {
      setPromoApplied({ code: 'BIENVENUE (-3 000 FCFA)', discount: 3000 });
    } else {
      setPromoError('Code promo invalide ou expiré (Exemples valides : AZIZ10, ELEGANCE5)');
    }
  };

  // Submit Order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.fullName || !customer.phone) {
      alert('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    const orderNumber = `AZF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const actualPaymentMethod: PaymentMethod =
      paymentMethod === 'Mobile Money'
        ? (`${mobileNetwork} Money` as PaymentMethod)
        : paymentMethod;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer: {
        ...customer,
        whatsapp: sameAsPhone ? customer.phone : customer.whatsapp || customer.phone,
      },
      items: safeItems,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      total,
      deliveryMethod,
      paymentMethod: actualPaymentMethod,
      status: 'Nouvelle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onOrderPlaced(newOrder);
    setPlacedOrder(newOrder);
    setStep('success');

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A059', '#0B1325', '#FAF5E8', '#1E3A8A'],
      });
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-[#0B1325] text-[#F5F5F0] rounded-3xl shadow-2xl border border-[#C5A059]/30 overflow-hidden my-auto animate-scaleUp max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="sticky top-0 z-20 bg-[#050B18] text-white px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="light" />
            <span className="text-xs text-[#C5A059] font-semibold tracking-wider uppercase border-l border-[#C5A059]/30 pl-3 hidden sm:inline">
              {step === 'form' ? 'Finalisation de la commande' : 'Confirmation de commande'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#F5F5F0]/60 hover:text-white rounded-full hover:bg-[#10192C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Customer and Delivery (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Step 1: Contact Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2">
                      <div className="w-6 h-6 rounded-full bg-[#10192C] text-[#C5A059] border border-[#C5A059]/40 text-xs font-bold flex items-center justify-center">
                        1
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#F5F5F0]">
                        Vos Coordonnées
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                          Nom & Prénom(s) *
                        </label>
                        <input
                          type="text"
                          required
                          value={customer.fullName}
                          onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                          placeholder="Ex: Ibrahim Ouédraogo"
                          className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                            Numéro de téléphone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={customer.phone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomer({
                                ...customer,
                                phone: val,
                                whatsapp: sameAsPhone ? val : customer.whatsapp,
                              });
                            }}
                            placeholder="Ex: +226 70 00 00 00"
                            className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                            Numéro WhatsApp
                          </label>
                          <input
                            type="tel"
                            disabled={sameAsPhone}
                            value={sameAsPhone ? customer.phone : customer.whatsapp}
                            onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })}
                            placeholder="Ex: +226 76 00 00 00"
                            className={`w-full p-3 border rounded-xl text-sm focus:outline-none ${
                              sameAsPhone
                                ? 'bg-[#050B18] text-[#F5F5F0]/40 border-[#C5A059]/20'
                                : 'bg-[#10192C] text-[#F5F5F0] border-[#C5A059]/30 focus:border-[#C5A059]'
                            }`}
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-[#F5F5F0]/70 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={sameAsPhone}
                          onChange={(e) => {
                            setSameAsPhone(e.target.checked);
                            if (e.target.checked) {
                              setCustomer({ ...customer, whatsapp: customer.phone });
                            }
                          }}
                          className="accent-[#C5A059]"
                        />
                        <span>Mon numéro WhatsApp est identique à mon numéro d'appel</span>
                      </label>
                    </div>
                  </div>

                  {/* Step 2: Delivery Method & Address */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2">
                      <div className="w-6 h-6 rounded-full bg-[#10192C] text-[#C5A059] border border-[#C5A059]/40 text-xs font-bold flex items-center justify-center">
                        2
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#F5F5F0]">
                        Mode de Livraison & Adresse
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('Livraison à domicile')}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          deliveryMethod === 'Livraison à domicile'
                            ? 'bg-[#10192C] text-white border-[#C5A059] shadow-md ring-1 ring-[#C5A059]'
                            : 'bg-[#050B18] text-[#F5F5F0]/70 border-[#C5A059]/20 hover:border-[#C5A059]/50'
                        }`}
                      >
                        <Truck
                          className={`w-5 h-5 shrink-0 ${
                            deliveryMethod === 'Livraison à domicile'
                              ? 'text-[#C5A059]'
                              : 'text-[#F5F5F0]/50'
                          }`}
                        />
                        <div>
                          <span className="font-bold text-xs block text-[#F5F5F0]">Livraison à domicile</span>
                          <span className="text-[11px] text-[#F5F5F0]/60 mt-0.5 block">
                            Directement à votre bureau ou domicile
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('Récupération en boutique / showroom')}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          deliveryMethod === 'Récupération en boutique / showroom'
                            ? 'bg-[#10192C] text-white border-[#C5A059] shadow-md ring-1 ring-[#C5A059]'
                            : 'bg-[#050B18] text-[#F5F5F0]/70 border-[#C5A059]/20 hover:border-[#C5A059]/50'
                        }`}
                      >
                        <Building2
                          className={`w-5 h-5 shrink-0 ${
                            deliveryMethod === 'Récupération en boutique / showroom'
                              ? 'text-[#C5A059]'
                              : 'text-[#F5F5F0]/50'
                          }`}
                        />
                        <div>
                          <span className="font-bold text-xs block text-[#F5F5F0]">Retrait en Showroom</span>
                          <span className="text-[11px] text-[#F5F5F0]/60 mt-0.5 block">
                            Gratuit • Showroom Ouaga
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Address Fields */}
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                            Ville *
                          </label>
                          <select
                            value={customer.city}
                            onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                            className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] font-semibold focus:outline-none focus:border-[#C5A059]"
                          >
                            <option value="Ouagadougou" className="bg-[#0B1325] text-[#F5F5F0]">Ouagadougou (Burkina Faso)</option>
                            <option value="Bobo-Dioulasso" className="bg-[#0B1325] text-[#F5F5F0]">Bobo-Dioulasso (Burkina Faso)</option>
                            <option value="Koudougou" className="bg-[#0B1325] text-[#F5F5F0]">Koudougou (Burkina Faso)</option>
                            <option value="Ouahigouya" className="bg-[#0B1325] text-[#F5F5F0]">Ouahigouya (Burkina Faso)</option>
                            <option value="Abidjan" className="bg-[#0B1325] text-[#F5F5F0]">Abidjan (Côte d'Ivoire)</option>
                            <option value="Dakar" className="bg-[#0B1325] text-[#F5F5F0]">Dakar (Sénégal)</option>
                            <option value="Lomé" className="bg-[#0B1325] text-[#F5F5F0]">Lomé (Togo)</option>
                            <option value="Cotonou" className="bg-[#0B1325] text-[#F5F5F0]">Cotonou (Bénin)</option>
                            <option value="Bamako" className="bg-[#0B1325] text-[#F5F5F0]">Bamako (Mali)</option>
                            <option value="Niamey" className="bg-[#0B1325] text-[#F5F5F0]">Niamey (Niger)</option>
                            <option value="Autre" className="bg-[#0B1325] text-[#F5F5F0]">Autre destination internationale</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                            Quartier / Secteur *
                          </label>
                          <input
                            type="text"
                            required
                            value={customer.district}
                            onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                            placeholder="Ex: Ouaga 2000, Koulouba, Somgandé..."
                            className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                          Adresse précise ou point de repère *
                        </label>
                        <input
                          type="text"
                          required
                          value={customer.landmark}
                          onChange={(e) => setCustomer({ ...customer, landmark: e.target.value })}
                          placeholder="Ex: Non loin de la pharmacie, portail noir, face à l'école..."
                          className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                          Instructions de livraison (Optionnel)
                        </label>
                        <input
                          type="text"
                          value={customer.deliveryInstructions}
                          onChange={(e) =>
                            setCustomer({ ...customer, deliveryInstructions: e.target.value })
                          }
                          placeholder="Ex: Appeler avant d'arriver, livrer après 14h..."
                          className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Payment Method */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 border-b border-[#C5A059]/20 pb-2">
                      <div className="w-6 h-6 rounded-full bg-[#10192C] text-[#C5A059] border border-[#C5A059]/40 text-xs font-bold flex items-center justify-center">
                        3
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#F5F5F0]">
                        Moyen de Paiement
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {/* Cash on delivery */}
                      <label
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentMethod === 'Paiement à la livraison'
                            ? 'bg-[#10192C] border-[#C5A059] ring-1 ring-[#C5A059]'
                            : 'bg-[#050B18] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'Paiement à la livraison'}
                            onChange={() => setPaymentMethod('Paiement à la livraison')}
                            className="accent-[#C5A059]"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#F5F5F0] block">
                              💵 Paiement à la livraison (Espèces)
                            </span>
                            <span className="text-[11px] text-[#F5F5F0]/60">
                              Réglez en mains propres au livreur après vérification
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#C5A059] bg-[#050B18] border border-[#C5A059]/30 px-2 py-0.5 rounded">
                          Populaire
                        </span>
                      </label>

                      {/* Mobile Money */}
                      <label
                        className={`p-3.5 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all ${
                          paymentMethod === 'Mobile Money'
                            ? 'bg-[#10192C] border-[#C5A059] ring-1 ring-[#C5A059]'
                            : 'bg-[#050B18] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'Mobile Money'}
                              onChange={() => setPaymentMethod('Mobile Money')}
                              className="accent-[#C5A059]"
                            />
                            <div>
                              <span className="font-bold text-xs text-[#F5F5F0] block">
                                📱 Mobile Money (Orange, Moov, Wave, MTN)
                              </span>
                              <span className="text-[11px] text-[#F5F5F0]/60">
                                Transfert direct et instantané sans frais
                              </span>
                            </div>
                          </div>
                        </div>

                        {paymentMethod === 'Mobile Money' && (
                          <div className="pl-6 pt-2 border-t border-[#C5A059]/20 flex flex-wrap gap-2">
                            {(['Orange', 'Moov', 'Wave', 'MTN'] as const).map((net) => (
                              <button
                                type="button"
                                key={net}
                                onClick={() => setMobileNetwork(net)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                  mobileNetwork === net
                                    ? 'bg-[#C5A059] text-[#050B18] border-[#C5A059]'
                                    : 'bg-[#050B18] text-[#F5F5F0]/80 border-[#C5A059]/30 hover:border-[#C5A059]'
                                }`}
                              >
                                {net} Money
                              </button>
                            ))}
                          </div>
                        )}
                      </label>

                      {/* Online Payment / CinetPay gateway simulated */}
                      <label
                        className={`p-3.5 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all ${
                          paymentMethod === 'Paiement par carte (CinetPay)'
                            ? 'bg-[#10192C] border-[#C5A059] ring-1 ring-[#C5A059]'
                            : 'bg-[#050B18] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'Paiement par carte (CinetPay)'}
                              onChange={() => setPaymentMethod('Paiement par carte (CinetPay)')}
                              className="accent-[#C5A059]"
                            />
                            <div>
                              <span className="font-bold text-xs text-[#F5F5F0] block">
                                💳 Paiement en ligne sécurisé (CinetPay / Carte Bancaire)
                              </span>
                              <span className="text-[11px] text-[#F5F5F0]/60">
                                Visa, Mastercard, Cartes internationales
                              </span>
                            </div>
                          </div>
                        </div>

                        {paymentMethod === 'Paiement par carte (CinetPay)' && (
                          <div className="pl-6 pt-2 border-t border-[#C5A059]/20 space-y-3">
                            <div className="p-3 bg-[#050B18] rounded-xl border border-[#C5A059]/30 text-xs text-[#F5F5F0]/80 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                              <span>
                                Passerelle sécurisée SSL 256 bits. Les données sensibles ne sont jamais enregistrées sur nos serveurs.
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Nom sur la carte"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value)}
                                className="p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-lg text-xs text-[#F5F5F0] placeholder-slate-500"
                              />
                              <input
                                type="text"
                                placeholder="Numéro de carte (16 chiffres)"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-lg text-xs text-[#F5F5F0] placeholder-slate-500"
                              />
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary & Promo (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-[#050B18] p-6 rounded-3xl border border-[#C5A059]/30 space-y-6 sticky top-4">
                    <h3 className="font-serif font-bold text-base text-[#F5F5F0] border-b border-[#C5A059]/20 pb-3">
                      Résumé de la commande ({safeItems.reduce((a, b) => a + (b.quantity || 1), 0)} articles)
                    </h3>

                    {/* Items miniature list */}
                    <div className="max-h-48 overflow-y-auto divide-y divide-[#C5A059]/20 pr-1 space-y-2">
                      {safeItems.map((item) => (
                        <div
                          key={`${item.productId}-${item.size}-${item.color}`}
                          className="pt-2 first:pt-0 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'}
                              alt={item.product?.name || 'Chemise'}
                              className="w-12 h-14 object-cover rounded-lg border border-[#C5A059]/30 bg-[#10192C]"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-bold text-[#F5F5F0] line-clamp-1">{item.product?.name || 'Chemise'}</p>
                              <p className="text-[11px] text-[#F5F5F0]/60">
                                Taille {item.size} • Qté: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-[#C5A059]">
                            {formatFCFA((item.unitPrice || 0) * (item.quantity || 1))}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Promo code box */}
                    <div className="pt-2 border-t border-[#C5A059]/20">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Code promo (ex: AZIZ10)"
                          className="flex-1 p-2.5 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-xs uppercase font-bold text-[#F5F5F0] placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={applyPromo}
                          className="px-4 py-2.5 bg-[#C5A059] text-[#050B18] text-xs font-bold uppercase rounded-xl hover:bg-[#d8b56f] transition-colors cursor-pointer"
                        >
                          Appliquer
                        </button>
                      </div>
                      {promoApplied && (
                        <p className="text-[11px] text-[#C5A059] font-bold mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Code appliqué : {promoApplied.code}
                        </p>
                      )}
                      {promoError && (
                        <p className="text-[11px] text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {promoError}
                        </p>
                      )}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2 pt-3 border-t border-[#C5A059]/20 text-xs">
                      <div className="flex justify-between text-[#F5F5F0]/70">
                        <span>Sous-total</span>
                        <span className="font-bold text-[#F5F5F0]">{formatFCFA(subtotal)}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-[#C5A059] font-bold">
                          <span>Remise code promo</span>
                          <span>-{formatFCFA(discountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[#F5F5F0]/70">
                        <span>Frais de livraison</span>
                        <span className="font-bold text-[#F5F5F0]">
                          {deliveryFee === 0 ? (
                            <span className="text-[#C5A059] font-bold">GRATUIT</span>
                          ) : (
                            formatFCFA(deliveryFee)
                          )}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-[#C5A059]/30 flex justify-between text-base font-extrabold text-[#F5F5F0]">
                        <span>Total Net à régler</span>
                        <span className="text-xl text-[#C5A059]">{formatFCFA(total)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-4 px-6 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-2xl shadow-[0_4px_20px_rgba(197,160,89,0.3)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>CONFIRMER LA COMMANDE</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Order Success View */
            placedOrder && (
              <div className="max-w-2xl mx-auto text-center space-y-8 py-6 animate-fadeIn">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F5F0] font-serif">
                    Merci pour votre commande, {placedOrder.customer.fullName.split(' ')[0]} !
                  </h2>
                  <p className="text-sm sm:text-base text-[#F5F5F0]/70 max-w-md mx-auto leading-relaxed">
                    Votre commande <span className="text-[#C5A059] font-bold">#{placedOrder.orderNumber}</span> a bien été transmise à notre atelier.
                    Préparez-vous à recevoir l'élégance à l'état pur.
                  </p>
                </div>

                {/* Priority Next Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#10192C] p-6 rounded-3xl border border-[#C5A059]/30 space-y-4 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 flex items-center justify-center text-[#25D366] mx-auto">
                      <MessageCircle className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] mb-1">
                        Confirmation Rapide
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Envoyez un message sur WhatsApp pour valider la livraison.
                      </p>
                    </div>
                    <a
                      href={generateOrderConfirmationWhatsAppUrl(placedOrder, settings)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      CONFIRMER SUR WHATSAPP
                    </a>
                  </div>

                  <div className="bg-[#10192C] p-6 rounded-3xl border border-[#C5A059]/30 space-y-4 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto">
                      <Printer className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] mb-1">
                        Garder votre Reçu
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Imprimez ou téléchargez le récapitulatif de votre commande.
                      </p>
                    </div>
                    <button
                      onClick={handlePrint}
                      className="w-full py-3 bg-white hover:bg-slate-200 text-[#0B1325] font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      IMPRIMER MON REÇU
                    </button>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="text-xs font-bold text-slate-500 hover:text-[#C5A059] transition-colors uppercase tracking-widest"
                >
                  Retourner à la boutique
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
