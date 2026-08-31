import React, { useState } from 'react';
import {
  User, LayoutDashboard, Package, ShoppingBag, Settings, LogOut, TrendingUp, Clock, CheckCircle, Truck, CheckCheck, XCircle, Plus, Edit2, Trash2, Eye, EyeOff, MessageCircle, Search, Printer, Save, RotateCcw, Sparkles, AlertTriangle, ChevronRight, Filter, MapPin, Calendar, Box, Camera, Info, Tag, Layers, ArrowLeft, ChevronDown
} from 'lucide-react';
import { Order, OrderStatus, Product, ShirtSize, SizeStock, StoreSettings } from '../../types';
import { formatFCFA, generateCustomerDirectWhatsAppUrl, addProduct, updateProduct, deleteProduct, getOrderByNumber, saveOrder, uploadProductImage, getCustomerOrders, getVisitCount } from '../../services/storeService';
import { Logo } from '../common/Logo';
import { supabase } from '../../services/supabaseClient';

interface AdminDashboardProps {
  isOpen: boolean; onClose: () => void; products: Product[]; orders: Order[]; settings: StoreSettings;
  onSaveProducts: (products: Product[]) => Promise<void>;
  onSaveOrders: (orders: Order[]) => Promise<void>;
  onSaveSettings: (settings: StoreSettings) => Promise<void>;
  isAuthenticated: boolean; onLogin: (status: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen, onClose, products = [], orders = [], settings, onSaveProducts, onSaveOrders, onSaveSettings, isAuthenticated, onLogin,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings'>('dashboard');
  const [portalMode, setPortalView] = useState<'choice' | 'tracking' | 'login'>(isAuthenticated ? 'login' : 'choice');
  const [trackNumber, setTrackNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [email, setEmail] = useState('admin@azizfashion.com');
  const [password, setPassword] = useState('admin2026');
  const [loginError, setLoginError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [visitCount, setVisitCount] = useState<number>(0);

  React.useEffect(() => {
    if (isOpen) {
      setLocalOrders(getCustomerOrders());
      if (isAuthenticated) {
        getVisitCount().then(setVisitCount);
      }
    }
  }, [isOpen, isAuthenticated]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) onLogin(true);
    } catch (err: any) { setLoginError(err.message || 'Identifiants incorrects.'); }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackNumber.trim()) return;
    setIsTrackLoading(true);
    setTrackError('');
    try {
      const order = await getOrderByNumber(trackNumber.trim().toUpperCase());
      if (order) setTrackedOrder(order);
      else setTrackError('Commande non trouvée.');
    } catch (err) { setTrackError('Erreur de recherche.'); } finally { setIsTrackLoading(false); }
  };

  const safeOrders = orders || [];
  const safeProducts = products || [];
  const totalRevenue = safeOrders.filter(o => o.status !== 'Annulée').reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const lowStockThreshold = 3;
  const outOfStockCount = safeProducts.filter(p => (Object.values(p.stock || {}) as number[]).reduce((a, b) => a + b, 0) === 0).length;
  const lowStockItems = safeProducts.filter(p => (Object.values(p.stock) as number[]).some(s => s > 0 && s <= lowStockThreshold));

  const handleResetOrders = async () => {
    if (window.confirm("⚠️ ATTENTION : Vous allez supprimer TOUTES les commandes de la base de données. Cette action est irréversible. Voulez-vous continuer ?")) {
      try {
        const { error } = await supabase.from('orders').delete().neq('id', 'placeholder');
        if (error) throw error;
        onSaveOrders([]);
        alert("Le compteur a été réinitialisé avec succès.");
      } catch (err: any) {
        alert("Erreur lors de la réinitialisation : " + err.message);
      }
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Voulez-vous vraiment annuler votre commande ? Cette action est irréversible.")) return;

    try {
      const orderToCancel = trackedOrder || localOrders.find(o => o.id === orderId);
      if (!orderToCancel) return;

      const updatedOrder = { ...orderToCancel, status: 'Annulée' as OrderStatus, updatedAt: new Date().toISOString() };
      await saveOrder(updatedOrder);

      // Update local tracking view
      if (trackedOrder?.id === orderId) {
        setTrackedOrder(updatedOrder);
      }

      // Update local storage history
      const { getCustomerOrders, saveCustomerOrder } = await import('../../services/storeService');
      const currentLocal = getCustomerOrders();
      const updatedLocal = currentLocal.map(o => o.id === orderId ? updatedOrder : o);
      localStorage.setItem('aziz_fashion_customer_orders_v1', JSON.stringify(updatedLocal));
      setLocalOrders(updatedLocal);

      alert("Votre commande a été annulée avec succès.");
    } catch (err: any) {
      alert("Erreur lors de l'annulation : " + err.message);
    }
  };

  const handleOpenNewProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`, name: '', reference: `AZF-${Math.floor(100+Math.random()*900)}`, tagline: '', description: '',
      features: ['Tissu de haute qualité'], fabric: 'Faso Danfani', origin: 'Burkina Faso', fit: 'Moderne Relax',
      price: 25000, stock: { S: 10, M: 10, L: 10, XL: 10, XXL: 10, XXXL: 10 }, category: 'Faso Danfani', images: [''],
      isAvailable: true, createdAt: new Date().toISOString(), rating: 5, reviewCount: 0
    });
    setIsNewProduct(true);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || isUploading) return;
    try {
      const cleanImgs = editingProduct.images.filter(img => img.trim() !== '');
      const toSave = { ...editingProduct, images: cleanImgs.length > 0 ? cleanImgs : ['https://via.placeholder.com/400'] };
      if (isNewProduct) { await addProduct(toSave); await onSaveProducts([toSave, ...products]); }
      else { await updateProduct(toSave); await onSaveProducts(products.map(p => p.id === toSave.id ? toSave : p)); }
      setProductModalOpen(false);
    } catch (err: any) { alert("Erreur : " + err.message); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const publicUrl = await uploadProductImage(file);

      // Add the new URL to the images array, removing empty strings
      const currentImages = editingProduct.images.filter(img => img.trim() !== '');
      setEditingProduct({
        ...editingProduct,
        images: [...currentImages, publicUrl]
      });
    } catch (err: any) {
      alert("Erreur lors de l'envoi de l'image : " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer cette création ?")) {
      await deleteProduct(id);
      onSaveProducts(products.filter(p => p.id !== id));
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const order = safeOrders.find(o => o.id === orderId);
    if (!order) return;
    const updatedOrder = { ...order, status: newStatus, updatedAt: new Date().toISOString() };
    try {
      await saveOrder(updatedOrder);
      await onSaveOrders(safeOrders.map(o => o.id === orderId ? updatedOrder : o));
    } catch (err: any) { alert("Erreur : " + err.message); }
  };

  const orderStatuses: OrderStatus[] = ['Commande reçue', 'Commande livrée', 'Annulée'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-7xl bg-[#0B1325] text-[#F5F5F0] rounded-none sm:rounded-[2.5rem] shadow-2xl border-x sm:border border-[#C5A059]/20 overflow-hidden h-full sm:h-[92vh] flex flex-col sm:flex-row" onClick={(e) => e.stopPropagation()}>

        {/* Modern Sidebar for Desktop */}
        {isAuthenticated && (
          <aside className="w-full sm:w-64 bg-[#050B18] border-b sm:border-b-0 sm:border-r border-[#C5A059]/10 flex flex-col p-6 no-print shrink-0">
            <div className="mb-10 flex items-center justify-center sm:justify-start gap-3">
              <Logo size="sm" variant="light" />
            </div>

            <nav className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
                { id: 'orders', icon: ShoppingBag, label: 'Commandes' },
                { id: 'products', icon: Package, label: 'Catalogue' },
                { id: 'settings', icon: Settings, label: 'Réglages' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === item.id
                    ? 'bg-[#C5A059] text-[#050B18] shadow-lg shadow-[#C5A059]/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5 hidden sm:block space-y-4">
              <button
                onClick={handleResetOrders}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#C5A059] hover:bg-[#C5A059]/10 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all"
                title="Réinitialiser toutes les commandes"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Réinitialiser Compteur</span>
              </button>

              <button
                onClick={() => { supabase.auth.signOut(); onLogin(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-900/10 rounded-2xl text-xs font-bold uppercase transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Bar */}
          <header className="px-6 py-4 bg-[#0B1325]/80 backdrop-blur-md border-b border-[#C5A059]/10 flex items-center justify-between no-print shrink-0">
            <div>
              <h2 className="text-lg font-serif font-black text-[#F5F5F0]">
                {!isAuthenticated ? 'Espace Personnel' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              {isAuthenticated && <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-[0.2em]">Boutique Aziz Fashion</p>}
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => { supabase.auth.signOut(); onLogin(false); }}
                  className="sm:hidden p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all flex items-center gap-1.5"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Déconnexion</span>
                </button>
              )}
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            {!isAuthenticated ? (
              <div className="max-w-2xl mx-auto space-y-8 py-10">
                {portalMode === 'choice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button onClick={() => setPortalView('tracking')} className="group p-10 bg-[#10192C] border border-[#C5A059]/10 rounded-[2rem] flex flex-col items-center gap-6 hover:border-[#C5A059] transition-all duration-500">
                      <div className="p-5 bg-[#C5A059]/10 rounded-3xl group-hover:bg-[#C5A059] group-hover:text-[#050B18] transition-all">
                        <Package className="w-10 h-10 text-[#C5A059] group-hover:text-[#050B18]" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-serif font-black text-xl mb-1">Suivi Colis</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Où est ma chemise ?</p>
                      </div>
                    </button>
                    <button onClick={() => setPortalView('login')} className="group p-10 bg-[#050B18] border border-white/5 rounded-[2rem] flex flex-col items-center gap-6 hover:border-white/20 transition-all duration-500">
                      <div className="p-5 bg-white/5 rounded-3xl group-hover:bg-white group-hover:text-[#050B18] transition-all">
                        <User className="w-10 h-10 text-slate-500 group-hover:text-[#050B18]" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-serif font-black text-xl mb-1">Accès Maison</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Espace collaborateur</p>
                      </div>
                    </button>
                  </div>
                )}

                {portalMode === 'tracking' && (
                  <div className="max-w-md mx-auto space-y-8 text-center">
                    <button onClick={() => setPortalView('choice')} className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-[#C5A059] hover:text-white tracking-widest">
                      <ArrowLeft className="w-3 h-3" /> Retour
                    </button>

                    {/* Local Orders History */}
                    {localOrders.length > 0 && (
                      <div className="space-y-4 text-left">
                        <h4 className="text-xs font-black uppercase text-[#C5A059] tracking-widest border-b border-white/5 pb-2">Mes Commandes Récentes</h4>
                        <div className="space-y-3">
                          {localOrders.map(order => (
                            <button
                              key={order.id}
                              onClick={async () => {
                                setTrackNumber(order.orderNumber);
                                setIsTrackLoading(true);
                                const latest = await getOrderByNumber(order.orderNumber);
                                setTrackedOrder(latest || order);
                                setIsTrackLoading(false);
                              }}
                              className="w-full p-4 bg-[#10192C] border border-white/5 rounded-2xl flex items-center justify-between hover:border-[#C5A059]/30 transition-all text-left"
                            >
                              <div>
                                <div className="text-xs font-black text-[#F5F5F0]">{order.orderNumber}</div>
                                <div className="text-[10px] text-slate-500">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] font-black text-[#C5A059] uppercase">{order.status}</div>
                                <div className="text-[9px] text-slate-600 font-bold">{formatFCFA(order.total)}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="relative py-4 flex items-center gap-4">
                          <div className="flex-1 h-px bg-white/5"></div>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">Ou rechercher</span>
                          <div className="flex-1 h-px bg-white/5"></div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-3xl font-serif font-black">Suivre une commande</h3>
                      <p className="text-sm text-slate-400">Entrez le numéro reçu par WhatsApp ou sur votre reçu.</p>
                    </div>
                    <form onSubmit={handleTrackOrder} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Ex: AZF-2026-9041"
                        value={trackNumber}
                        onChange={(e) => setTrackNumber(e.target.value)}
                        className="w-full p-5 bg-[#10192C] border border-[#C5A059]/20 rounded-2xl text-center font-mono font-black text-xl text-[#C5A059] outline-none focus:border-[#C5A059] transition-all"
                      />
                      <button type="submit" className="w-full py-5 bg-[#C5A059] text-[#0B1325] font-black uppercase rounded-2xl shadow-xl shadow-[#C5A059]/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                        {isTrackLoading ? (
                          <div className="w-5 h-5 border-2 border-[#0B1325]/20 border-t-[#0B1325] rounded-full animate-spin"></div>
                        ) : 'Rechercher'}
                      </button>
                    </form>
                    {trackedOrder && (
                      <div className="p-8 bg-[#10192C] rounded-[2rem] border border-[#C5A059]/30 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-xs font-black text-[#C5A059] uppercase tracking-widest">Statut Actuel</div>
                        <div className="text-2xl font-serif font-black">{trackedOrder.status}</div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#C5A059] h-full transition-all duration-1000"
                            style={{ width: trackedOrder.status === 'Commande livrée' ? '100%' : trackedOrder.status === 'Annulée' ? '0%' : '50%' }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold italic">Numéro : {trackedOrder.orderNumber}</p>

                        {trackedOrder.status === 'Commande reçue' && (
                          <button
                            onClick={() => handleCancelOrder(trackedOrder.id)}
                            className="w-full py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all mt-2"
                          >
                            Annuler ma commande
                          </button>
                        )}
                      </div>
                    )}
                    {trackError && <p className="text-rose-500 font-bold text-xs">{trackError}</p>}
                  </div>
                )}

                {portalMode === 'login' && (
                  <div className="max-w-md mx-auto space-y-8">
                    <button onClick={() => setPortalView('choice')} className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-[#C5A059] hover:text-white tracking-widest">
                      <ArrowLeft className="w-3 h-3" /> Retour
                    </button>
                    <div className="text-center space-y-2">
                      <h3 className="text-3xl font-serif font-black">Connexion Maison</h3>
                      <p className="text-sm text-slate-400">Identifiez-vous pour gérer les créations et les commandes.</p>
                    </div>
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-[#10192C] border border-white/10 rounded-2xl outline-none focus:border-[#C5A059] transition-all" />
                      <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-[#10192C] border border-white/10 rounded-2xl outline-none focus:border-[#C5A059] transition-all" />
                      <button type="submit" className="w-full py-4 bg-[#C5A059] text-[#0B1325] font-black uppercase rounded-2xl tracking-widest hover:bg-[#D4AF37] transition-all">Se connecter</button>
                    </form>
                    {loginError && <p className="text-rose-500 text-center text-xs font-bold">{loginError}</p>}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in duration-500">
                {/* Dashboard View */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-[#10192C] p-8 rounded-[2rem] border border-[#C5A059]/10 relative overflow-hidden group">
                        <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:text-[#C5A059]/10 transition-all" />
                        <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-2 block">Chiffre d'Affaires</span>
                        <div className="text-3xl font-black">{formatFCFA(totalRevenue)}</div>
                      </div>
                      <div className="bg-[#10192C] p-8 rounded-[2rem] border border-[#C5A059]/10 relative overflow-hidden group">
                        <ShoppingBag className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:text-[#C5A059]/10 transition-all" />
                        <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-2 block">Commandes</span>
                        <div className="text-3xl font-black">{safeOrders.length}</div>
                      </div>
                      <div className="bg-[#10192C] p-8 rounded-[2rem] border border-emerald-500/10 relative overflow-hidden group">
                        <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:text-emerald-500/10 transition-all" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 block">Produits</span>
                        <div className="text-3xl font-black">{safeProducts.length}</div>
                      </div>
                      <div className="bg-[#10192C] p-8 rounded-[2rem] border border-blue-500/10 relative overflow-hidden group">
                        <User className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:text-blue-500/10 transition-all" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 block">Visites Site</span>
                        <div className="text-3xl font-black">{visitCount.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      <div className="bg-[#10192C] p-8 rounded-[2rem] border border-white/5">
                        <h3 className="text-xl font-serif font-black mb-6 flex items-center gap-3">
                          <Clock className="w-5 h-5 text-[#C5A059]" /> Dernières Commandes
                        </h3>
                        <div className="space-y-4">
                          {safeOrders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-[#050B18] rounded-2xl border border-white/5 hover:border-[#C5A059]/30 transition-all">
                              <div>
                                <div className="text-xs font-black">{order.orderNumber}</div>
                                <div className="text-[10px] text-slate-500">{order.customer.fullName}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-black text-[#C5A059]">{formatFCFA(order.total)}</div>
                                <div className="text-[9px] uppercase font-bold text-slate-500">{order.status}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Orders View */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-2xl font-serif font-black uppercase tracking-tighter">Gestion Commandes</h3>
                      <div className="relative w-full sm:w-auto">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Rechercher (Nom, N°...)"
                          value={orderSearch}
                          onChange={e => setOrderSearch(e.target.value)}
                          className="w-full sm:w-72 pl-12 pr-4 py-3 bg-[#10192C] border border-white/10 rounded-2xl text-xs outline-none focus:border-[#C5A059] transition-all"
                        />
                      </div>
                    </div>

                    <div className="bg-[#10192C] rounded-[2rem] border border-white/5 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#050B18] text-[#C5A059] uppercase tracking-tighter font-black">
                            <tr>
                              <th className="p-6">Référence</th>
                              <th className="p-6">Client</th>
                              <th className="p-6">Montant</th>
                              <th className="p-6">Date</th>
                              <th className="p-6">Statut</th>
                              <th className="p-6 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {(orderSearch ? safeOrders.filter(o => o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase())) : safeOrders).map(o => (
                              <tr
                                key={o.id}
                                onClick={() => setSelectedOrder(o)}
                                className="hover:bg-white/5 transition-colors group cursor-pointer"
                              >
                                <td className="p-6 font-mono font-bold">{o.orderNumber}</td>
                                <td className="p-6">
                                  <div className="font-bold text-sm">{o.customer.fullName}</div>
                                  <div className="text-[10px] text-slate-500">{o.customer.phone}</div>
                                </td>
                                <td className="p-6 font-black text-[#C5A059] text-sm">{formatFCFA(o.total)}</td>
                                <td className="p-6 text-slate-400">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                                <td className="p-6" onClick={(e) => e.stopPropagation()}>
                                  <select
                                    value={o.status}
                                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest outline-none bg-transparent cursor-pointer ${
                                      o.status === 'Commande livrée' ? 'border-emerald-500/50 text-emerald-500' :
                                      o.status === 'Annulée' ? 'border-rose-500/50 text-rose-500' :
                                      'border-[#C5A059]/50 text-[#C5A059]'
                                    }`}
                                  >
                                    {orderStatuses.map(s => <option key={s} value={s} className="bg-[#0B1325]">{s}</option>)}
                                  </select>
                                </td>
                                <td className="p-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => setSelectedOrder(o)} className="p-3 bg-white/5 rounded-xl hover:text-[#C5A059] transition-all"><Eye className="w-4 h-4" /></button>
                                  <a href={generateCustomerDirectWhatsAppUrl(o.customer.phone, o.orderNumber, o.customer.fullName, o.status)} target="_blank" className="p-3 bg-emerald-900/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-[#050B18] transition-all inline-block"><MessageCircle className="w-4 h-4" /></a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Catalog / Products View */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-serif font-black uppercase tracking-tighter">Catalogue Créations</h3>
                      <button
                        onClick={handleOpenNewProduct}
                        className="px-6 py-3 bg-[#C5A059] text-[#050B18] font-black text-xs uppercase rounded-[1.25rem] shadow-lg shadow-[#C5A059]/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Nouvelle Chemise
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {safeProducts.map(p => (
                        <div key={p.id} className="group bg-[#10192C] rounded-[2rem] border border-white/5 overflow-hidden hover:border-[#C5A059]/40 transition-all">
                          <div className="aspect-[4/5] relative overflow-hidden">
                            <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="" />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingProduct(p); setIsNewProduct(false); setProductModalOpen(true); }} className="p-3 bg-white/90 text-[#0B1325] rounded-xl hover:bg-[#C5A059] transition-all"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(p.id)} className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            {p.badge && <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#C5A059] text-[#050B18] text-[9px] font-black uppercase rounded-lg tracking-widest">{p.badge}</div>}
                          </div>
                          <div className="p-6">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{p.category}</div>
                            <h4 className="font-serif font-black text-lg mb-2">{p.name}</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-[#C5A059] font-black text-sm">{formatFCFA(p.price)}</span>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase">
                                <CheckCircle className="w-3 h-3" />
                                Disponible
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </main>
        </div>

        {/* --- MODALS --- */}

        {/* 1. Product Modal (Modern & Simplified) */}
        {productModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-0 sm:p-4">
            <div className="bg-[#0B1325] border-x sm:border border-[#C5A059]/30 w-full max-w-5xl h-full sm:h-[90vh] rounded-none sm:rounded-[2.5rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif font-black text-[#C5A059] uppercase tracking-tighter">
                    {isNewProduct ? 'Nouvelle Création' : 'Éditer la Création'}
                  </h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{editingProduct.reference || 'Génération auto...'}</p>
                </div>
                <button onClick={() => setProductModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-12">

                {/* Section 1: Essentiels */}
                <section className="space-y-6">
                  <h4 className="flex items-center gap-3 text-xs font-black uppercase text-[#C5A059] tracking-widest border-l-2 border-[#C5A059] pl-4">
                    <Tag className="w-4 h-4" /> Informations Générales
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Nom du Modèle *</label>
                      <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-4 bg-[#10192C] rounded-2xl border border-white/10 outline-none focus:border-[#C5A059] transition-all" required placeholder="Ex: Faso Élégance Or" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Accroche (Tagline)</label>
                      <input type="text" value={editingProduct.tagline} onChange={e => setEditingProduct({...editingProduct, tagline: e.target.value})} className="w-full p-4 bg-[#10192C] rounded-2xl border border-white/10 outline-none focus:border-[#C5A059] transition-all" placeholder="Ex: L'élégance du textile authentique" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Prix de Vente (FCFA) *</label>
                      <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full p-4 bg-[#10192C] rounded-2xl border border-white/10 outline-none focus:border-[#C5A059] transition-all font-black text-[#C5A059]" required />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Prix Original (Promo)</label>
                      <input type="number" value={editingProduct.originalPrice || ''} onChange={e => setEditingProduct({...editingProduct, originalPrice: Number(e.target.value) || undefined})} className="w-full p-4 bg-[#10192C] rounded-2xl border border-white/10 outline-none focus:border-[#C5A059] transition-all text-slate-400" placeholder="Ex: 35000" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Badge</label>
                      <select value={editingProduct.badge || ''} onChange={e => setEditingProduct({...editingProduct, badge: e.target.value as any || undefined})} className="w-full p-4 bg-[#10192C] rounded-2xl border border-white/10 outline-none focus:border-[#C5A059] transition-all appearance-none">
                        <option value="">Aucun</option>
                        <option>Nouveau</option>
                        <option>Promo</option>
                        <option>Populaire</option>
                        <option>Édition Limitée</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Catégorie</label>
                      <select
                        value={editingProduct.category}
                        onChange={e => {
                          const newCat = e.target.value as any;
                          setEditingProduct({
                            ...editingProduct,
                            category: newCat,
                            fabric: newCat // Auto-sync fabric with category by default
                          });
                        }}
                        className="w-full p-4 bg-[#10192C] rounded-2xl border border-white/10 outline-none focus:border-[#C5A059] transition-all appearance-none text-[#F5F5F0]"
                      >
                        <option value="Faso Danfani">Faso Danfani</option>
                        <option value="Pathé'O">Pathé'O</option>
                        <option value="Lin">Lin</option>
                        <option value="Lin cassé">Lin cassé</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="flex items-center gap-3 text-xs font-black uppercase text-[#C5A059] tracking-widest border-l-2 border-[#C5A059] pl-4">
                    <Camera className="w-4 h-4" /> Médias & Présentation
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {/* Upload Button */}
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        <div className={`w-full py-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all ${isUploading ? 'bg-white/5 border-white/10' : 'bg-[#10192C] border-[#C5A059]/20 group-hover:border-[#C5A059]/50'}`}>
                          {isUploading ? (
                            <>
                              <div className="w-6 h-6 border-2 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin"></div>
                              <span className="text-[10px] font-black uppercase text-[#C5A059] animate-pulse">Envoi en cours...</span>
                            </>
                          ) : (
                            <>
                              <div className="p-4 bg-[#C5A059]/10 rounded-2xl text-[#C5A059]">
                                <Plus className="w-6 h-6" />
                              </div>
                              <div className="text-center">
                                <span className="text-xs font-black uppercase text-[#F5F5F0]">Ajouter une photo</span>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Glisser-déposer ou cliquer</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="relative flex items-center gap-4 py-2">
                        <div className="flex-1 h-px bg-white/5"></div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase">Ou lien direct</span>
                        <div className="flex-1 h-px bg-white/5"></div>
                      </div>

                      <div className="space-y-3">
                        {editingProduct.images.map((img, i) => (
                          <div key={i} className="flex gap-2 group/item">
                            <input
                              type="url"
                              value={img}
                              onChange={e => { const im = [...editingProduct.images]; im[i] = e.target.value; setEditingProduct({...editingProduct, images: im}); }}
                              className="flex-1 p-4 bg-[#10192C] rounded-2xl border border-white/10 text-[10px] font-mono outline-none focus:border-[#C5A059] transition-all"
                              placeholder="URL de la photo..."
                            />
                            <button type="button" onClick={() => setEditingProduct({...editingProduct, images: editingProduct.images.filter((_, idx) => idx !== i)})} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 auto-rows-min">
                      {editingProduct.images.filter(img => img).map((img, i) => (
                        <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5 group/thumb">
                          <img src={img} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Non+Trouvée')} />
                          <button
                            type="button"
                            onClick={() => setEditingProduct({...editingProduct, images: editingProduct.images.filter((_, idx) => idx !== i)})}
                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md text-white rounded-lg opacity-0 group-hover/thumb:opacity-100 transition-all hover:bg-rose-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {editingProduct.images.filter(img => img).length === 0 && (
                        <div className="col-span-2 h-48 bg-[#050B18] border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-700">
                          <Camera className="w-8 h-8 opacity-20" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] italic">Aucun aperçu</span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Section 3: Disponibilité & Tailles (Simplified) */}
                <section className="space-y-6">
                  <h4 className="flex items-center gap-3 text-xs font-black uppercase text-[#C5A059] tracking-widest border-l-2 border-[#C5A059] pl-4">
                    <Layers className="w-4 h-4" /> Tailles & Disponibilité
                  </h4>
                  <div className="p-8 bg-[#050B18] rounded-[2rem] border border-white/5 space-y-6">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                        <div key={size} className="px-6 py-3 bg-[#C5A059]/10 text-[#C5A059] rounded-xl text-sm font-black border border-[#C5A059]/20">
                          {size}
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
                      Note : Les chemises sont considérées comme disponibles en continu dans toutes les tailles.
                    </p>
                  </div>
                </section>

                {/* Section 4: Détails Techniques */}
                <section className="space-y-6">
                  <h4 className="flex items-center gap-3 text-xs font-black uppercase text-[#C5A059] tracking-widest border-l-2 border-[#C5A059] pl-4">
                    <Info className="w-4 h-4" /> Savoir-faire & Caractéristiques
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Matière Utilisée *</label>
                      <div className="relative group/fabric">
                        <select
                          value={['Faso Danfani', "Pathé'O", 'Lin', 'Lin cassé'].includes(editingProduct.fabric) ||
                                 ['Faso Danfani', "Pathé'O", 'Lin', 'Lin cassé'].some(m => editingProduct.fabric.startsWith(m + ' + '))
                                 ? editingProduct.fabric : 'custom'}
                          onChange={e => {
                            const val = e.target.value;
                            if (val !== 'custom') {
                              setEditingProduct({...editingProduct, fabric: val});
                            }
                          }}
                          className="w-full p-4 bg-[#10192C] rounded-2xl border border-white/10 outline-none focus:border-[#C5A059] transition-all appearance-none text-xs"
                        >
                          {/* Option pure */}
                          <option value={editingProduct.category}>{editingProduct.category} (Pur)</option>

                          {/* Mixes suggérés */}
                          {['Faso Danfani', "Pathé'O", 'Lin', 'Lin cassé']
                            .filter(m => m !== editingProduct.category)
                            .map(m => (
                              <option key={m} value={`${editingProduct.category} + ${m}`}>
                                {editingProduct.category} + {m}
                              </option>
                            ))
                          }
                          <option value="custom">-- Autre (Saisie libre) --</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      </div>

                      {/* Champ de saisie libre si 'custom' ou pour affiner */}
                      <input
                        type="text"
                        value={editingProduct.fabric}
                        onChange={e => setEditingProduct({...editingProduct, fabric: e.target.value})}
                        className="w-full mt-2 p-3 bg-[#050B18] rounded-xl border border-white/5 text-xs outline-none focus:border-[#C5A059] placeholder:italic"
                        placeholder="Précisez la matière ou le mix..."
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Origine du Textile</label>
                      <input type="text" value={editingProduct.origin} onChange={e => setEditingProduct({...editingProduct, origin: e.target.value})} className="w-full p-4 bg-[#10192C] rounded-2xl border border-white/10 outline-none focus:border-[#C5A059]" placeholder="Ex: Koudougou, Burkina Faso" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Coupe (Fit)</label>
                      <select value={editingProduct.fit} onChange={e => setEditingProduct({...editingProduct, fit: e.target.value as any})} className="w-full p-4 bg-[#10192C] rounded-2xl border border-white/10 outline-none">
                        <option>Ajustée (Slim)</option><option>Droite (Regular)</option><option>Moderne Relax</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block">Points Clés (Features)</label>
                      {(editingProduct.features || []).map((feat, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={feat}
                            onChange={e => { const f = [...editingProduct.features]; f[i] = e.target.value; setEditingProduct({...editingProduct, features: f}); }}
                            className="flex-1 p-4 bg-[#10192C] rounded-2xl border border-white/10 text-xs outline-none"
                            placeholder="Ex: Finitions fil d'or..."
                          />
                          <button type="button" onClick={() => setEditingProduct({...editingProduct, features: editingProduct.features.filter((_, idx) => idx !== i)})} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setEditingProduct({...editingProduct, features: [...(editingProduct.features || []), '']})} className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-500">+ Ajouter un point</button>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase mb-2 block">Description de la création</label>
                      <textarea
                        value={editingProduct.description}
                        onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                        rows={6}
                        className="w-full p-5 bg-[#10192C] rounded-2xl border border-white/10 outline-none focus:border-[#C5A059] text-sm leading-relaxed"
                        placeholder="Décrivez l'histoire et le style de cette chemise..."
                      />
                    </div>
                  </div>
                </section>
              </form>

              <div className="p-6 bg-[#050B18] border-t border-[#C5A059]/20 flex gap-4 no-print">
                <button type="button" onClick={() => setProductModalOpen(false)} className="px-8 py-4 bg-white/5 text-white font-bold uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all flex-1 sm:flex-none">Annuler</button>
                <button onClick={handleSaveProduct} className="px-12 py-4 bg-[#C5A059] text-[#050B18] font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 transition-all flex-1 shadow-xl shadow-[#C5A059]/10">Valider & Enregistrer</button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
            <div className="bg-[#0B1325] border border-[#C5A059]/30 w-full max-w-3xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif font-black text-[#C5A059] uppercase tracking-tighter">Commande {selectedOrder.orderNumber}</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Client : {selectedOrder.customer.fullName}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest border-b border-white/5 pb-2">Informations Client</h4>
                    <div className="space-y-4 text-xs leading-relaxed">
                      <div><span className="text-slate-500 font-bold block mb-1">Téléphone & WhatsApp :</span> {selectedOrder.customer.phone}</div>
                      <div><span className="text-slate-500 font-bold block mb-1">Adresse :</span> {selectedOrder.customer.city}, {selectedOrder.customer.district}</div>
                      <div><span className="text-slate-500 font-bold block mb-1">Point de repère :</span> {selectedOrder.customer.landmark}</div>
                      {selectedOrder.customer.deliveryInstructions && <div><span className="text-slate-500 font-bold block mb-1">Instructions :</span> {selectedOrder.customer.deliveryInstructions}</div>}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest border-b border-white/5 pb-2">Résumé Transaction</h4>
                    <div className="space-y-4 text-xs leading-relaxed">
                      <div className="flex justify-between"><span>Méthode :</span> <span className="font-bold">{selectedOrder.deliveryMethod}</span></div>
                      <div className="flex justify-between"><span>Paiement :</span> <span className="font-bold">{selectedOrder.paymentMethod}</span></div>
                      <div className="flex justify-between text-[#C5A059] text-xl font-black pt-4 border-t border-white/5">
                        <span>Total :</span> <span>{formatFCFA(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest border-b border-white/5 pb-2">Articles Commandés</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-[#050B18] rounded-2xl border border-white/5 group">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-16 bg-white/5 rounded-xl overflow-hidden border border-white/10 shrink-0">
                              <img
                                src={item.product?.images?.[0]}
                                className="w-full h-full object-cover"
                                alt=""
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=AF')}
                              />
                           </div>
                           <div>
                              <div className="text-sm font-black">{item.product?.name || item.productName}</div>
                              <div className="text-[10px] text-[#C5A059] font-bold">Taille: {item.size} • {item.color}</div>
                              <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Quantité: {item.quantity}</div>
                           </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-[#C5A059]">{formatFCFA(item.unitPrice * item.quantity)}</div>
                          <div className="text-[9px] text-slate-600 font-mono">{formatFCFA(item.unitPrice)}/u</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[#050B18] border-t border-[#C5A059]/20 flex gap-4">
                 <button onClick={() => window.print()} className="px-8 py-4 bg-white/5 text-white font-bold uppercase text-[10px] tracking-widest rounded-2xl flex items-center gap-2"><Printer className="w-4 h-4" /> Imprimer Bon</button>
                 <a
                   href={generateCustomerDirectWhatsAppUrl(selectedOrder.customer.phone, selectedOrder.orderNumber, selectedOrder.customer.fullName, selectedOrder.status)}
                   target="_blank"
                   className="flex-1 py-4 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2"
                 >
                   <MessageCircle className="w-4 h-4" /> Contacter sur WhatsApp
                 </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
