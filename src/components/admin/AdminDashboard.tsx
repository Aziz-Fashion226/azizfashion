import React, { useState } from 'react';
import {
  User, LayoutDashboard, Package, ShoppingBag, Settings, LogOut, TrendingUp, Clock, CheckCircle, Truck, CheckCheck, XCircle, Plus, Edit2, Trash2, Eye, EyeOff, MessageCircle, Search, Printer, Save, RotateCcw, Sparkles, AlertTriangle, ChevronRight, Filter, MapPin, Calendar, Box,
} from 'lucide-react';
import { Order, OrderStatus, Product, ShirtSize, SizeStock, StoreSettings } from '../../types';
import { formatFCFA, generateCustomerDirectWhatsAppUrl, addProduct, updateProduct, deleteProduct, getOrderByNumber, saveOrder } from '../../services/storeService';
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings' | 'inventory'>('dashboard');
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
  const outOfStockCount = safeProducts.filter(p => (Object.values(p.stock || {}) as number[]).reduce((a, b) => a + b, 0) === 0).length;

  const handleOpenNewProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`, name: '', reference: `AZF-${Math.floor(100+Math.random()*900)}`, tagline: '', description: '',
      features: ['100% Coton peigné'], fabric: 'Faso Danfani', origin: 'Ouagadougou', fit: 'Ajustée (Slim)', collar: 'Col Officier',
      price: 25000, stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 }, category: 'Faso Danfani', images: [''], colors: [{ name: 'Bleu', hex: '#0000FF' }],
      isAvailable: true, createdAt: new Date().toISOString(), rating: 5, reviewCount: 0
    });
    setIsNewProduct(true);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const cleanImgs = editingProduct.images.filter(img => img.trim() !== '');
      const toSave = { ...editingProduct, images: cleanImgs.length > 0 ? cleanImgs : ['https://via.placeholder.com/400'] };
      if (isNewProduct) { await addProduct(toSave); await onSaveProducts([toSave, ...products]); }
      else { await updateProduct(toSave); await onSaveProducts(products.map(p => p.id === toSave.id ? toSave : p)); }
      setProductModalOpen(false);
    } catch (err: any) { alert("Erreur : " + err.message); }
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
    } catch (err: any) {
      alert("Erreur lors de la mise à jour : " + err.message);
    }
  };

  const orderStatuses: OrderStatus[] = ['Nouvelle', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'];

  const filteredOrders = safeOrders.filter(o =>
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl bg-[#0B1325] text-[#F5F5F0] rounded-3xl shadow-2xl border border-[#C5A059]/40 overflow-hidden my-auto max-h-[94vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#050B18] px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/30">
          <div className="flex items-center gap-3"><User className="w-5 h-5 text-[#C5A059]" /><div><h2 className="font-serif font-bold text-lg">Aziz Fashion Portail</h2></div></div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition-colors"><XCircle className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="p-10 max-w-2xl mx-auto space-y-8">
              {portalMode === 'choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button onClick={() => setPortalView('tracking')} className="p-10 bg-[#10192C] border border-[#C5A059]/20 rounded-3xl flex flex-col items-center gap-4 hover:border-[#C5A059] transition-all"><Package className="w-12 h-12 text-[#C5A059]" /><span className="font-serif font-bold">Suivre ma commande</span></button>
                  <button onClick={() => setPortalView('login')} className="p-10 bg-[#050B18] border border-white/5 rounded-3xl flex flex-col items-center gap-4 hover:border-white/20 transition-all"><User className="w-12 h-12 text-slate-500" /><span className="font-serif font-bold">Espace Équipe</span></button>
                </div>
              )}
              {portalMode === 'tracking' && (
                <div className="max-w-md mx-auto space-y-6">
                  <button onClick={() => setPortalView('choice')} className="text-xs text-[#C5A059] flex items-center gap-1 hover:underline"><RotateCcw className="w-3 h-3" /> Retour</button>
                  <h3 className="text-xl font-serif font-bold text-center">Rechercher mon colis</h3>
                  <form onSubmit={handleTrackOrder} className="space-y-4">
                    <input type="text" placeholder="AZF-2026-XXXX" value={trackNumber} onChange={(e) => setTrackNumber(e.target.value)} className="w-full p-4 bg-[#10192C] border border-[#C5A059]/30 rounded-2xl text-center font-mono font-bold text-[#C5A059] outline-none" />
                    <button type="submit" className="w-full py-4 bg-[#C5A059] text-[#0B1325] font-black uppercase rounded-2xl">Rechercher</button>
                  </form>
                  {trackedOrder && <div className="p-6 bg-[#10192C] rounded-2xl border border-[#C5A059]/30 text-center font-bold">Statut : {trackedOrder.status}</div>}
                  {trackError && <p className="text-rose-400 text-center text-xs">{trackError}</p>}
                </div>
              )}
              {portalMode === 'login' && (
                <div className="max-w-md mx-auto space-y-6">
                   <button onClick={() => setPortalView('choice')} className="text-xs text-[#C5A059] flex items-center gap-1 hover:underline"><RotateCcw className="w-3 h-3" /> Retour</button>
                   <h3 className="text-xl font-serif font-bold text-center">Connexion Maison</h3>
                   <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-[#10192C] border border-[#C5A059]/20 rounded-xl outline-none" />
                      <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-[#10192C] border border-[#C5A059]/20 rounded-xl outline-none" />
                      <button type="submit" className="w-full py-3 bg-[#C5A059] text-[#0B1325] font-bold rounded-xl">Se connecter</button>
                      <button type="button" onClick={() => onLogin(true)} className="w-full py-3 bg-white/5 border border-white/10 text-white/60 font-bold rounded-xl">🚀 Mode Démo Local</button>
                   </form>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 space-y-8">
              <div className="flex gap-4 border-b border-[#C5A059]/20 pb-4 overflow-x-auto items-center">
                {['dashboard', 'orders', 'products', 'inventory'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t as any)} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-[#C5A059] text-[#0B1325]' : 'text-slate-400 hover:text-white'}`}>{t}</button>
                ))}

                {isAuthenticated && !supabase.auth.getUser() && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] text-amber-500 font-bold uppercase">Mode Démo - Lecture Seule</span>
                  </div>
                )}

                <button onClick={() => { supabase.auth.signOut(); onLogin(false); }} className="ml-auto px-4 py-2 text-rose-400 text-xs font-bold hover:bg-rose-900/20 rounded-xl">Déconnexion</button>
              </div>

              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#10192C] p-8 rounded-3xl border border-[#C5A059]/20"><span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">CA Total</span><div className="text-3xl font-black mt-2">{formatFCFA(totalRevenue)}</div></div>
                  <div className="bg-[#10192C] p-8 rounded-3xl border border-[#C5A059]/20"><span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">Commandes</span><div className="text-3xl font-black mt-2">{safeOrders.length}</div></div>
                  <div className="bg-[#10192C] p-8 rounded-3xl border border-rose-500/20"><span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Ruptures</span><div className="text-3xl font-black mt-2">{outOfStockCount}</div></div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold">Commandes</h3>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" placeholder="Rechercher..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-[#10192C] border border-white/10 rounded-xl text-xs outline-none focus:border-[#C5A059]" />
                    </div>
                  </div>
                  <div className="bg-[#10192C] rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#050B18] text-[#C5A059] uppercase tracking-tighter">
                        <tr>
                          <th className="p-4">N° Commande</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Montant</th>
                          <th className="p-4">Statut</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredOrders.map(o => (
                          <tr key={o.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono font-bold">{o.orderNumber}</td>
                            <td className="p-4">
                              <div className="font-bold">{o.customer.fullName}</div>
                              <div className="text-[10px] text-slate-500">{o.customer.phone}</div>
                            </td>
                            <td className="p-4 font-black text-[#C5A059]">{formatFCFA(o.total)}</td>
                            <td className="p-4">
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                                className="bg-[#050B18] border border-white/10 rounded-lg px-2 py-1 outline-none"
                              >
                                {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <a href={generateCustomerDirectWhatsAppUrl(o.customer.phone, o.orderNumber, o.customer.fullName, o.status)} target="_blank" className="p-2 inline-block bg-emerald-900/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center"><h3 className="text-xl font-serif font-bold">Catalogue</h3><button onClick={handleOpenNewProduct} className="px-6 py-2.5 bg-[#C5A059] text-[#0B1325] font-black text-xs uppercase rounded-xl">+ Ajouter</button></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {safeProducts.map(p => (
                      <div key={p.id} className="bg-[#10192C] p-4 rounded-2xl border border-white/5 flex gap-4 items-center">
                        <img src={p.images[0]} className="w-16 h-20 object-cover rounded-lg" alt="" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{p.name}</h4>
                          <p className="text-[#C5A059] font-black text-xs">{formatFCFA(p.price)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingProduct(p); setIsNewProduct(false); setProductModalOpen(true); }} className="p-2 bg-white/5 rounded-lg hover:text-[#C5A059]"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 bg-white/5 rounded-lg hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold">Gestion des Stocks</h3>
                  <div className="bg-[#10192C] rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#050B18] text-[#C5A059] uppercase tracking-tighter">
                        <tr>
                          <th className="p-4">Produit</th>
                          <th className="p-4">S</th>
                          <th className="p-4">M</th>
                          <th className="p-4">L</th>
                          <th className="p-4">XL</th>
                          <th className="p-4">XXL</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {safeProducts.map(p => {
                          const total = (Object.values(p.stock) as number[]).reduce((a, b) => a + b, 0);
                          return (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-4 font-bold">{p.name}</td>
                              <td className={`p-4 ${p.stock.S === 0 ? 'text-rose-500' : ''}`}>{p.stock.S}</td>
                              <td className={`p-4 ${p.stock.M === 0 ? 'text-rose-500' : ''}`}>{p.stock.M}</td>
                              <td className={`p-4 ${p.stock.L === 0 ? 'text-rose-500' : ''}`}>{p.stock.L}</td>
                              <td className={`p-4 ${p.stock.XL === 0 ? 'text-rose-500' : ''}`}>{p.stock.XL}</td>
                              <td className={`p-4 ${p.stock.XXL === 0 ? 'text-rose-500' : ''}`}>{p.stock.XXL}</td>
                              <td className="p-4 font-black">{total}</td>
                              <td className="p-4">
                                {total === 0 ? (
                                  <span className="text-rose-500 font-bold uppercase text-[9px]">Rupture</span>
                                ) : (
                                  <span className="text-emerald-500 font-bold uppercase text-[9px]">En stock</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {productModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
            <form onSubmit={handleSaveProduct} className="bg-[#0B1325] border border-[#C5A059]/40 p-8 rounded-3xl w-full max-w-2xl space-y-6 overflow-y-auto max-h-[90vh]">
              <h3 className="text-2xl font-serif font-bold text-[#C5A059]">{isNewProduct ? 'Nouvelle Création' : 'Modifier Création'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Nom" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="p-3 bg-[#10192C] rounded-xl outline-none border border-white/10" required />
                <input type="number" placeholder="Prix" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="p-3 bg-[#10192C] rounded-xl outline-none border border-white/10" required />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {(['S', 'M', 'L', 'XL', 'XXL'] as ShirtSize[]).map(s => (
                  <div key={s}>
                    <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase tracking-widest">Stock {s}</label>
                    <input type="number" value={editingProduct.stock[s]} onChange={e => setEditingProduct({...editingProduct, stock: {...editingProduct.stock, [s]: Number(e.target.value)}})} className="w-full p-2 bg-[#10192C] rounded-lg border border-white/10 text-xs text-center" />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-[#C5A059] uppercase tracking-widest">Photos (Plusieurs URLs possibles)</label>
                {editingProduct.images.map((img, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="url" value={img} onChange={e => { const im = [...editingProduct.images]; im[i] = e.target.value; setEditingProduct({...editingProduct, images: im}); }} className="flex-1 p-3 bg-[#10192C] rounded-xl outline-none border border-white/10 text-xs font-mono" placeholder="Lien image..." />
                    <button type="button" onClick={() => setEditingProduct({...editingProduct, images: editingProduct.images.filter((_, idx) => idx !== i)})} className="p-3 bg-rose-900/20 text-rose-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setEditingProduct({...editingProduct, images: [...editingProduct.images, '']})} className="w-full py-2 bg-white/5 border border-dashed border-white/20 rounded-xl text-[10px] uppercase font-bold">+ Ajouter une vue</button>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setProductModalOpen(false)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold uppercase text-xs">Annuler</button>
                <button type="submit" className="flex-1 py-3 bg-[#C5A059] text-[#0B1325] rounded-xl font-black uppercase text-xs">Enregistrer</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
