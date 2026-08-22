import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  CheckCheck,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MessageCircle,
  Search,
  Printer,
  Save,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Order, OrderStatus, Product, ShirtSize, SizeStock, StoreSettings } from '../../types';
import { formatFCFA, generateCustomerDirectWhatsAppUrl } from '../../services/storeService';
import { Logo } from '../common/Logo';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  onSaveProducts: (products: Product[]) => Promise<void>;
  onSaveOrders: (orders: Order[]) => Promise<void>;
  onSaveSettings: (settings: StoreSettings) => Promise<void>;
  isAuthenticated: boolean;
  onLogin: (status: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  settings,
  onSaveProducts,
  onSaveOrders,
  onSaveSettings,
  isAuthenticated,
  onLogin,
}) => {
  if (!isOpen) return null;

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings'>('dashboard');

  // Login Form State
  const [email, setEmail] = useState('admin@azizfashion.com');
  const [password, setPassword] = useState('admin2026');
  const [loginError, setLoginError] = useState('');

  // Product Editor Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Settings State form
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);

  // Authentication check
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      onLogin(true);
      setLoginError('');
    } else {
      setLoginError('Veuillez renseigner vos identifiants administrateur.');
    }
  };

  const handleLogout = () => {
    onLogin(false);
  };

  // KPIs calculations
  const safeOrders = orders || [];
  const safeProducts = products || [];

  const totalRevenue = safeOrders
    .filter((o) => o.status !== 'Annulée')
    .reduce((acc, o) => acc + (o.total || 0), 0);

  const orderStats = {
    total: safeOrders.length,
    nouvelle: safeOrders.filter((o) => o.status === 'Nouvelle').length,
    confirmee: safeOrders.filter((o) => o.status === 'Confirmée').length,
    enPreparation: safeOrders.filter((o) => o.status === 'En préparation').length,
    expediee: safeOrders.filter((o) => o.status === 'Expédiée').length,
    livree: safeOrders.filter((o) => o.status === 'Livrée').length,
    annulee: safeOrders.filter((o) => o.status === 'Annulée').length,
  };

  const outOfStockCount = safeProducts.filter(
    (p) => (Object.values(p?.stock || {}) as number[]).reduce((a, b) => a + b, 0) === 0 || !p.isAvailable
  ).length;

  // Order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = safeOrders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
    );
    onSaveOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // Product CRUD
  const handleOpenNewProduct = () => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: '',
      reference: `AZF-${Math.floor(100 + Math.random() * 900)}`,
      tagline: '',
      description: '',
      features: ['100% Coton peigné tissé main', 'Col structuré haut de gamme'],
      fabric: 'Coton biologique & Faso Danfani noble',
      origin: 'Atelier Aziz Fashion - Ouagadougou',
      fit: 'Ajustée (Slim)',
      collar: 'Col Officier',
      price: 28000,
      stock: { S: 3, M: 5, L: 5, XL: 2, XXL: 0 },
      category: 'Faso Danfani',
      badge: 'Nouveau',
      images: [
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80',
      ],
      colors: [{ name: 'Bleu Nuit & Or', hex: '#0B192C' }],
      isAvailable: true,
      createdAt: new Date().toISOString().split('T')[0],
      rating: 5.0,
      reviewCount: 1,
    };
    setEditingProduct(newProd);
    setIsNewProduct(true);
    setProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsNewProduct(false);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = (prodId: string) => {
    if (window.confirm('Êtes-vous certain de vouloir supprimer définitivement cette chemise ?')) {
      const updated = products.filter((p) => p.id !== prodId);
      onSaveProducts(updated);
    }
  };

  const handleToggleProductAvailability = (prodId: string) => {
    const updated = products.map((p) =>
      p.id === prodId ? { ...p, isAvailable: !p.isAvailable } : p
    );
    onSaveProducts(updated);
  };

  const handleQuickStockUpdate = (productId: string, size: ShirtSize, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const currentStock = p.stock[size] || 0;
        const newStock = Math.max(0, currentStock + delta);
        const updatedStock = { ...p.stock, [size]: newStock };
        const totalStock = (Object.values(updatedStock) as number[]).reduce((a, b) => a + b, 0);
        return { ...p, stock: updatedStock, isAvailable: totalStock > 0 };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  const handleSaveProductModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (isNewProduct) {
      onSaveProducts([editingProduct, ...products]);
    } else {
      const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
      onSaveProducts(updated);
    }
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customer.fullName.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.toLowerCase().includes(q);
      const matchCity = o.customer.city.toLowerCase().includes(q);
      return matchNum || matchName || matchPhone || matchCity;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div
        className="relative w-full max-w-6xl bg-[#0B1325] text-[#F5F5F0] rounded-3xl shadow-2xl border border-[#C5A059]/40 overflow-hidden my-auto animate-scaleUp max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="bg-[#050B18] text-[#F5F5F0] px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/30 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#10192C] rounded-xl text-[#C5A059] border border-[#C5A059]/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#F5F5F0]">
                AZIZ FASHION — Espace Administrateur
              </h2>
              <p className="text-xs text-[#C5A059] tracking-wider font-semibold uppercase">
                Gestion des stocks, commandes et paramètres
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#10192C] hover:bg-[#1A2644] text-slate-300 hover:text-white rounded-xl border border-[#C5A059]/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Logged In View */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full space-y-6 no-print">
            <div className="text-center space-y-2">
              <Logo size="md" variant="dark" />
              <h3 className="text-xl font-bold text-[#F5F5F0] pt-4 font-serif">
                Authentification Administrateur
              </h3>
              <p className="text-xs text-[#F5F5F0]/70">
                Connectez-vous pour piloter votre boutique, vos stocks et vos commandes.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                  Email gérant
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-[#10192C] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-400 font-semibold">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
              >
                Accéder au tableau de bord
              </button>

              <div className="p-3 bg-[#10192C] rounded-xl border border-[#C5A059]/30 text-[11px] text-[#F5F5F0]/80 text-center">
                ✨ <strong>Accès démonstration direct :</strong> Cliquez simplement sur « Accéder » pour pré-remplir la session de test.
              </div>
            </form>
          </div>
        ) : (
          /* Logged In Backoffice Body */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Admin Tabs Navigation */}
            <div className="bg-[#050B18] border-b border-[#C5A059]/30 px-6 py-2.5 flex items-center gap-3 overflow-x-auto no-print">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#C5A059] text-[#050B18] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#10192C]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Tableau de bord</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#C5A059] text-[#050B18] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#10192C]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Commandes</span>
                {orderStats.nouvelle > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black">
                    {orderStats.nouvelle}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-[#C5A059] text-[#050B18] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#10192C]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Gestion des Produits ({safeProducts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#C5A059] text-[#050B18] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#10192C]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres Boutique & WhatsApp</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Quick Action Alerts */}
                  {(orderStats.nouvelle > 0 || outOfStockCount > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orderStats.nouvelle > 0 && (
                        <div
                          onClick={() => setActiveTab('orders')}
                          className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-amber-950/60 transition-all"
                        >
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-amber-200">
                              {orderStats.nouvelle} nouvelles commandes
                            </h4>
                            <p className="text-[11px] text-amber-400/80">
                              En attente de confirmation et de préparation.
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-amber-500" />
                        </div>
                      )}

                      {outOfStockCount > 0 && (
                        <div
                          onClick={() => setActiveTab('products')}
                          className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-rose-950/60 transition-all"
                        >
                          <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-rose-200">
                              {outOfStockCount} produits en rupture
                            </h4>
                            <p className="text-[11px] text-rose-400/80">
                              Certains articles ne sont plus visibles en boutique.
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-rose-500" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#10192C] p-5 rounded-2xl border border-[#C5A059]/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                          Chiffre d'Affaires
                        </span>
                        <div className="p-2 bg-[#050B18] rounded-lg text-[#C5A059] border border-[#C5A059]/20">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-[#F5F5F0]">
                        {formatFCFA(totalRevenue)}
                      </div>
                      <p className="text-[11px] text-slate-400">Hors commandes annulées</p>
                    </div>

                    <div className="bg-[#10192C] p-5 rounded-2xl border border-[#C5A059]/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                          Total Commandes
                        </span>
                        <div className="p-2 bg-[#050B18] rounded-lg text-blue-400 border border-blue-500/20">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-[#F5F5F0]">{safeOrders.length}</div>
                      <p className="text-[11px] text-emerald-400 font-semibold">
                        {orderStats.livree} livrées • {orderStats.enPreparation} en cours
                      </p>
                    </div>

                    <div className="bg-[#10192C] p-5 rounded-2xl border border-[#C5A059]/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                          En Attente / Nouvelles
                        </span>
                        <div className="p-2 bg-[#050B18] rounded-lg text-amber-400 border border-amber-500/20">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-[#F5F5F0]">
                        {orderStats.nouvelle}
                      </div>
                      <p className="text-[11px] text-amber-300 font-semibold">À confirmer rapidement</p>
                    </div>

                    <div className="bg-[#10192C] p-5 rounded-2xl border border-[#C5A059]/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                          Ruptures de Stock
                        </span>
                        <div className="p-2 bg-[#050B18] rounded-lg text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-[#F5F5F0]">{outOfStockCount}</div>
                      <p className="text-[11px] text-slate-400">{safeProducts.length} chemises au catalogue</p>
                    </div>
                  </div>

                  {/* Status Pipeline Grid */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#C5A059]">
                      Pipeline des Commandes
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="p-4 bg-[#10192C] rounded-xl border border-[#C5A059]/20">
                        <span className="text-[11px] font-bold text-slate-400 block">Nouvelles</span>
                        <span className="text-xl font-bold text-[#F5F5F0]">{orderStats.nouvelle}</span>
                      </div>
                      <div className="p-4 bg-[#10192C] rounded-xl border border-[#C5A059]/20">
                        <span className="text-[11px] font-bold text-blue-400 block">Confirmées</span>
                        <span className="text-xl font-bold text-[#F5F5F0]">{orderStats.confirmee}</span>
                      </div>
                      <div className="p-4 bg-[#10192C] rounded-xl border border-[#C5A059]/20">
                        <span className="text-[11px] font-bold text-amber-400 block">En préparation</span>
                        <span className="text-xl font-bold text-[#F5F5F0]">{orderStats.enPreparation}</span>
                      </div>
                      <div className="p-4 bg-[#10192C] rounded-xl border border-[#C5A059]/20">
                        <span className="text-[11px] font-bold text-purple-400 block">Expédiées</span>
                        <span className="text-xl font-bold text-[#F5F5F0]">{orderStats.expediee}</span>
                      </div>
                      <div className="p-4 bg-[#10192C] rounded-xl border border-[#C5A059]/20">
                        <span className="text-[11px] font-bold text-emerald-400 block">Livrées</span>
                        <span className="text-xl font-bold text-[#F5F5F0]">{orderStats.livree}</span>
                      </div>
                      <div className="p-4 bg-[#10192C] rounded-xl border border-[#C5A059]/20">
                        <span className="text-[11px] font-bold text-rose-400 block">Annulées</span>
                        <span className="text-xl font-bold text-[#F5F5F0]">{orderStats.annulee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders table preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#C5A059]">
                        Dernières Commandes Reçues
                      </h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-[#C5A059] font-bold hover:underline cursor-pointer"
                      >
                        Voir toutes les commandes →
                      </button>
                    </div>

                    <div className="overflow-x-auto bg-[#10192C] rounded-2xl border border-[#C5A059]/30">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#050B18] text-[#C5A059] font-bold uppercase tracking-wider border-b border-[#C5A059]/30">
                            <th className="p-3.5">N° Commande</th>
                            <th className="p-3.5">Client</th>
                            <th className="p-3.5">Ville</th>
                            <th className="p-3.5">Articles</th>
                            <th className="p-3.5">Montant</th>
                            <th className="p-3.5">Statut</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C5A059]/15">
                          {safeOrders.slice(0, 5).map((ord) => (
                            <tr key={ord.id} className="hover:bg-[#050B18]/50 transition-colors">
                              <td className="p-3.5 font-bold font-mono text-[#F5F5F0]">
                                {ord.orderNumber}
                              </td>
                              <td className="p-3.5">
                                <div className="font-bold text-[#F5F5F0]">{ord?.customer?.fullName || 'Client'}</div>
                                <div className="text-slate-400 text-[11px]">{ord?.customer?.phone}</div>
                              </td>
                              <td className="p-3.5 text-slate-300">{ord?.customer?.city}</td>
                              <td className="p-3.5 text-slate-300">
                                {(ord?.items || []).map((it) => `${it?.product?.name || 'Chemise'} (${it.size})`).join(', ')}
                              </td>
                              <td className="p-3.5 font-bold text-[#C5A059]">
                                {formatFCFA(ord.total)}
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    ord.status === 'Livrée'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                      : ord.status === 'Expédiée'
                                      ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                                      : ord.status === 'En préparation'
                                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                      : ord.status === 'Confirmée'
                                      ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                                      : ord.status === 'Annulée'
                                      ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => setSelectedOrder(ord)}
                                  className="px-3 py-1 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  Détails
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {/* Filters and Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#10192C] p-4 rounded-2xl border border-[#C5A059]/30">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Rechercher n° commande, client..."
                        className="w-full pl-9 pr-3 py-2 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-xs text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                      <span className="text-xs font-bold text-[#C5A059]">Statut :</span>
                      {['all', 'Nouvelle', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'].map(
                        (st) => (
                          <button
                            key={st}
                            onClick={() => setOrderStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              orderStatusFilter === st
                                ? 'bg-[#C5A059] text-[#050B18]'
                                : 'bg-[#050B18] text-slate-300 border border-[#C5A059]/30 hover:text-white'
                            }`}
                          >
                            {st === 'all' ? 'Toutes' : st}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto bg-[#10192C] rounded-2xl border border-[#C5A059]/30">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#050B18] text-[#C5A059] font-bold uppercase tracking-wider border-b border-[#C5A059]/30">
                          <th className="p-3.5">N° Commande</th>
                          <th className="p-3.5">Client & Contact</th>
                          <th className="p-3.5">Adresse & Ville</th>
                          <th className="p-3.5">Articles</th>
                          <th className="p-3.5">Montant</th>
                          <th className="p-3.5">Paiement</th>
                          <th className="p-3.5">Statut</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C5A059]/15">
                        {(filteredOrders || []).map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#050B18]/50 transition-colors">
                            <td className="p-3.5 font-bold font-mono text-[#F5F5F0]">
                              {ord.orderNumber}
                              <div className="text-[10px] text-slate-400 font-normal">
                                {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-[#F5F5F0]">{ord?.customer?.fullName || 'Client'}</div>
                              <div className="text-slate-400 font-mono">{ord?.customer?.phone}</div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-semibold text-[#F5F5F0]">{ord?.customer?.city}</div>
                              <div className="text-slate-400 text-[11px]">{ord?.customer?.district}</div>
                            </td>
                            <td className="p-3.5">
                              <ul className="space-y-1">
                                {(ord?.items || []).map((it, idx) => (
                                  <li key={idx} className="text-slate-300">
                                    • {it?.product?.name || 'Chemise'} (Taille {it.size}) x{it.quantity}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="p-3.5 font-bold text-[#C5A059]">
                              {formatFCFA(ord.total)}
                            </td>
                            <td className="p-3.5 text-slate-300">
                              <span className="px-2 py-0.5 bg-[#050B18] border border-[#C5A059]/20 rounded text-[10px] font-medium text-slate-300">
                                {ord.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                                }
                                className="p-1.5 bg-[#050B18] border border-[#C5A059]/30 rounded-lg text-xs font-bold text-[#F5F5F0] focus:border-[#C5A059] outline-none cursor-pointer"
                              >
                                <option value="Nouvelle">Nouvelle</option>
                                <option value="Confirmée">Confirmée</option>
                                <option value="En préparation">En préparation</option>
                                <option value="Expédiée">Expédiée</option>
                                <option value="Livrée">Livrée</option>
                                <option value="Annulée">Annulée</option>
                              </select>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <a
                                href={generateCustomerDirectWhatsAppUrl(
                                  ord?.customer?.phone || '',
                                  ord.orderNumber,
                                  ord?.customer?.fullName || '',
                                  ord.status
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block p-1.5 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a]"
                                title="Contacter le client sur WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-2.5 py-1.5 bg-[#C5A059] text-[#050B18] text-[11px] font-bold rounded-lg hover:bg-[#d8b56f] transition-colors cursor-pointer"
                              >
                                Fiche
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#F5F5F0]">
                        Catalogue & Gestion des Stocks
                      </h3>
                      <p className="text-xs text-slate-400">
                        Ajoutez, modifiez ou ajustez les stocks par taille (S, M, L, XL, XXL)
                      </p>
                    </div>

                    <button
                      onClick={handleOpenNewProduct}
                      className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter une chemise</span>
                    </button>
                  </div>

                  {/* Products Grid / List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(safeProducts || []).map((p) => {
                      const totalStock = (Object.values(p?.stock || {}) as number[]).reduce((a, b) => a + b, 0);
                      return (
                        <div
                          key={p.id}
                          className="bg-[#10192C] p-5 rounded-2xl border border-[#C5A059]/30 flex flex-col justify-between space-y-4 shadow-sm"
                        >
                          <div className="flex gap-4">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-20 h-24 object-cover rounded-xl border border-[#C5A059]/20 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-[#C5A059]">
                                  {p.category}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {p.reference}
                                </span>
                              </div>
                              <h4 className="font-bold text-[#F5F5F0] text-sm leading-tight">
                                {p.name}
                              </h4>
                              <p className="text-xs font-extrabold text-[#C5A059]">
                                {formatFCFA(p.price)}
                              </p>
                              <p className="text-[11px] text-slate-400">{p.collar}</p>
                            </div>
                          </div>

                          {/* Stocks by size preview with quick update */}
                          <div className="pt-2 border-t border-[#C5A059]/20">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                              Stock par variante (Ajustement rapide) :
                            </span>
                            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                              {(['S', 'M', 'L', 'XL', 'XXL'] as ShirtSize[]).map((size) => (
                                <div
                                  key={size}
                                  className={`relative group/stock p-1 rounded-lg font-bold border ${
                                    (p?.stock?.[size] || 0) > 0
                                      ? 'bg-[#050B18] text-[#F5F5F0] border-[#C5A059]/30'
                                      : 'bg-rose-950/40 text-rose-400 border-rose-500/20'
                                  }`}
                                >
                                  <div className="text-[8px] text-slate-500 mb-0.5">{size}</div>
                                  <div className="text-xs">{p?.stock?.[size] ?? 0}</div>

                                  {/* Quick Adjust Buttons on Hover/Action */}
                                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/stock:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickStockUpdate(p.id, size, -1);
                                      }}
                                      className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 shadow-lg cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickStockUpdate(p.id, size, 1);
                                      }}
                                      className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 shadow-lg cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="pt-2 border-t border-[#C5A059]/20 flex items-center justify-between">
                            <button
                              onClick={() => handleToggleProductAvailability(p.id)}
                              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer ${
                                p.isAvailable
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {p.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{p.isAvailable ? 'Actif' : 'Désactivé'}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="p-2 text-slate-300 hover:text-[#C5A059] hover:bg-[#050B18] rounded-lg border border-[#C5A059]/30 transition-colors cursor-pointer"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#F5F5F0]">
                      Paramètres Généraux & Numéro WhatsApp
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configurez les coordonnées du magasin, le numéro de contact WhatsApp et la livraison
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSaveSettings(settingsForm);
                      alert('Paramètres enregistrés avec succès !');
                    }}
                    className="bg-[#10192C] p-6 rounded-3xl border border-[#C5A059]/30 space-y-4 text-[#F5F5F0]"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                        Numéro WhatsApp Réception Commandes (Sans symbole, ex: 22670000000) *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.whatsappNumber}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                        }
                        className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm font-mono text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ce numéro sera utilisé dynamiquement pour tous les boutons "Commander via WhatsApp".
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                          Affichage WhatsApp Public
                        </label>
                        <input
                          type="text"
                          value={settingsForm.whatsappDisplay}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, whatsappDisplay: e.target.value })
                          }
                          className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                          Téléphone Appel Showroom
                        </label>
                        <input
                          type="text"
                          value={settingsForm.phoneDisplay}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, phoneDisplay: e.target.value })
                          }
                          className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                        Adresse du Showroom
                      </label>
                      <input
                        type="text"
                        value={settingsForm.addressShowroom}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, addressShowroom: e.target.value })
                        }
                        className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                          Frais de livraison standard (FCFA)
                        </label>
                        <input
                          type="number"
                          value={settingsForm.defaultDeliveryFee}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              defaultDeliveryFee: Number(e.target.value),
                            })
                          }
                          className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                          Seuil Livraison Gratuite (FCFA)
                        </label>
                        <input
                          type="number"
                          value={settingsForm.freeShippingThreshold}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              freeShippingThreshold: Number(e.target.value),
                            })
                          }
                          className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                        Texte du bandeau d'annonce
                      </label>
                      <input
                        type="text"
                        value={settingsForm.bannerAnnouncement}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, bannerAnnouncement: e.target.value })
                        }
                        className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Enregistrer les paramètres</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Edit or Create Product */}
        {productModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="bg-[#0B1325] border border-[#C5A059]/40 rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto text-[#F5F5F0] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4">
                <h3 className="font-serif font-bold text-lg text-[#C5A059]">
                  {isNewProduct ? 'Ajouter une nouvelle chemise' : 'Modifier la chemise'}
                </h3>
                <button onClick={() => setProductModalOpen(false)} className="cursor-pointer">
                  <XCircle className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleSaveProductModal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                      Nom de la chemise *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                      Référence
                    </label>
                    <input
                      type="text"
                      value={editingProduct.reference}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, reference: e.target.value })
                      }
                      className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                    Slogan / Sous-titre
                  </label>
                  <input
                    type="text"
                    value={editingProduct.tagline}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, tagline: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                    Description détaillée
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                      Prix de vente (FCFA) *
                    </label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm font-bold text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                      Prix promo barré (Optionnel)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          originalPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                      Catégorie
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, category: e.target.value as any })
                      }
                      className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-xs font-semibold text-[#F5F5F0] focus:border-[#C5A059] outline-none cursor-pointer"
                    >
                      <option value="Faso Danfani">Faso Danfani</option>
                      <option value="Cérémonie & Prestige">Cérémonie & Prestige</option>
                      <option value="Signature">Signature</option>
                      <option value="Koko Dunda Moderne">Koko Dunda Moderne</option>
                      <option value="Casual Chic">Casual Chic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                      Col
                    </label>
                    <select
                      value={editingProduct.collar}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, collar: e.target.value as any })
                      }
                      className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-xs font-semibold text-[#F5F5F0] focus:border-[#C5A059] outline-none cursor-pointer"
                    >
                      <option value="Col Officier">Col Officier</option>
                      <option value="Col Mao">Col Mao</option>
                      <option value="Col Français Contemporain">Col Français</option>
                      <option value="Col V Épuré">Col V Épuré</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                      Badge
                    </label>
                    <select
                      value={editingProduct.badge || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          badge: (e.target.value || undefined) as any,
                        })
                      }
                      className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-xs font-semibold text-[#F5F5F0] focus:border-[#C5A059] outline-none cursor-pointer"
                    >
                      <option value="">Aucun</option>
                      <option value="Nouveau">Nouveau</option>
                      <option value="Promo">Promo</option>
                      <option value="Populaire">Populaire</option>
                      <option value="Édition Limitée">Édition Limitée</option>
                    </select>
                  </div>
                </div>

                {/* Per size stock inputs */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#C5A059] mb-2">
                    Gestion du stock par taille :
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['S', 'M', 'L', 'XL', 'XXL'] as ShirtSize[]).map((size) => (
                      <div key={size} className="space-y-1 text-center">
                        <span className="text-xs font-bold text-[#F5F5F0]">{size}</span>
                        <input
                          type="number"
                          min={0}
                          value={editingProduct.stock[size]}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              stock: {
                                ...editingProduct.stock,
                                [size]: Math.max(0, parseInt(e.target.value) || 0),
                              },
                            })
                          }
                          className="w-full p-2 bg-[#050B18] border border-[#C5A059]/30 rounded-lg text-center text-sm font-bold text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#C5A059] mb-1">
                    Photo Principale (URL)
                  </label>
                  <input
                    type="url"
                    required
                    value={editingProduct.images[0] || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: [e.target.value, ...(editingProduct.images.slice(1))],
                      })
                    }
                    className="w-full p-2.5 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-xs font-mono text-[#F5F5F0] focus:border-[#C5A059] outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#C5A059]/20">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold uppercase rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Order Details Fiche */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
            <div
              className="bg-[#0B1325] border border-[#C5A059]/40 rounded-3xl max-w-xl w-full p-6 space-y-6 text-[#F5F5F0] shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Printable Header (Visible only on print) */}
              <div className="hidden print-only text-black text-center mb-8">
                <h1 className="text-2xl font-black uppercase tracking-widest">{settings.storeName}</h1>
                <p className="text-xs">{settings.addressShowroom} | {settings.phoneDisplay}</p>
                <div className="h-px bg-black my-4 w-full"></div>
                <h2 className="text-xl font-bold">BON DE COMMANDE #{selectedOrder.orderNumber}</h2>
              </div>

              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4 no-print">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#C5A059]">
                    Commande #{selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="cursor-pointer no-print">
                  <XCircle className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-[#10192C] rounded-xl border border-[#C5A059]/30 space-y-2 print:bg-white print:text-black print:border-black">
                  <div className="font-bold text-sm text-[#F5F5F0] print:text-black">
                    CLIENT : {selectedOrder?.customer?.fullName || 'Client'}
                  </div>
                  <div className="text-slate-300 print:text-black">📞 Téléphone : {selectedOrder?.customer?.phone}</div>
                  <div className="text-slate-300 print:text-black">💬 WhatsApp : {selectedOrder?.customer?.whatsapp}</div>
                  <div className="text-slate-300 print:text-black">
                    📍 Destination : {selectedOrder?.customer?.city}, {selectedOrder?.customer?.district} (
                    {selectedOrder?.customer?.landmark})
                  </div>
                  {selectedOrder?.customer?.deliveryInstructions && (
                    <div className="text-slate-400 print:text-black italic">📝 Instructions : {selectedOrder.customer.deliveryInstructions}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-[#C5A059] print:text-black uppercase tracking-wider">Articles commandés :</div>
                  <div className="divide-y divide-[#C5A059]/15 border border-[#C5A059]/30 rounded-xl p-3 bg-[#050B18] print:bg-white print:text-black print:border-black">
                    {(selectedOrder?.items || []).map((it, idx) => (
                      <div key={idx} className="py-2 flex justify-between">
                        <div className="text-slate-300 print:text-black">
                          <strong className="text-[#F5F5F0] print:text-black">{it?.product?.name || 'Chemise'}</strong> (Taille {it.size}) x{it.quantity}
                        </div>
                        <div className="font-bold text-[#C5A059] print:text-black">{formatFCFA((it.unitPrice || 0) * it.quantity)}</div>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-bold text-sm text-[#F5F5F0] print:text-black border-t border-[#C5A059]/30 print:border-black">
                      <span>MONTANT TOTAL :</span>
                      <span className="text-[#C5A059] print:text-black">{formatFCFA(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Info Payment/Delivery for print */}
                <div className="hidden print:block text-[10px] space-y-1 pt-4">
                  <div><strong>Mode de livraison :</strong> {selectedOrder.deliveryMethod}</div>
                  <div><strong>Mode de paiement :</strong> {selectedOrder.paymentMethod}</div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 no-print">
                  <a
                    href={generateCustomerDirectWhatsAppUrl(
                      selectedOrder?.customer?.phone || '',
                      selectedOrder.orderNumber,
                      selectedOrder?.customer?.fullName || '',
                      selectedOrder.status
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contacter le client</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 bg-[#10192C] hover:bg-[#15233e] text-[#C5A059] border border-[#C5A059]/30 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
