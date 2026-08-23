import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, StoreSettings, ShirtSize } from './types';
import {
  getProducts,
  saveProducts,
  getOrders,
  saveOrders,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist,
  getSettings,
  saveSettings,
  formatFCFA,
} from './services/storeService';
import { INITIAL_SETTINGS } from './data/initialData';
import { supabase } from './services/supabaseClient';

// Layout & Navigation
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloat } from './components/layout/WhatsAppFloat';

// Home Views
import { HeroBanner } from './components/home/HeroBanner';
import { BrandStory } from './components/home/BrandStory';
import { CustomerReviews } from './components/home/CustomerReviews';
import { ContactSection } from './components/home/ContactSection';

// Shop & Product Views
import { ProductCard } from './components/shop/ProductCard';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { ShopPage } from './components/shop/ShopPage';

// Cart & Checkout
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';

// Modals & Common
import { SizeGuideModal } from './components/common/SizeGuideModal';
import { SearchModal } from './components/common/SearchModal';
import { Toast } from './components/common/Toast';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Icons
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Scissors,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';

export default function App() {
  // Navigation View State: 'home' | 'shop' | 'about' | 'contact' | 'new'
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'about' | 'contact' | 'new'>('home');
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string>('all');

  // Core Data States
  const [products, setProductsState] = useState<Product[]>([]);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistState] = useState<string[]>([]);
  const [settings, setSettingsState] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Drawer States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Initial Load from Supabase & Storage
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      try {
        // 1. Check Auth Session
        const { data: { session } } = await supabase.auth.getSession();
        setIsAdminAuthenticated(!!session);

        // 2. Fetch Data
        const [prodData, orderData, settingsData] = await Promise.all([
          getProducts(),
          getOrders(),
          getSettings(),
        ]);

        setProductsState(prodData);
        setOrdersState(orderData);
        setSettingsState(settingsData);

        // 3. Cart and Wishlist remain local
        setCartState(getCart());
        setWishlistState(getWishlist());
      } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Erreur de connexion à la base de données', 'info');
      } finally {
        setIsLoading(false);
      }
    };

    initApp();

    // --- REALTIME SUBSCRIPTIONS ---
    const ordersSubscription = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrdersState((current) => [payload.new as Order, ...current]);
            showToast('🔔 Nouvelle commande reçue !', 'success');
          } else if (payload.eventType === 'UPDATE') {
            setOrdersState((current) =>
              current.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrdersState((current) => current.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  // Handlers for Data Updates
  const handleUpdateProducts = async (newProducts: Product[]) => {
    // This handler is now used mainly for local state sync,
    // individual CRUD operations are handled in AdminDashboard for DB persistence
    setProductsState(newProducts);
  };

  const handleUpdateOrders = async (newOrders: Order[]) => {
    setOrdersState(newOrders);
    await saveOrders(newOrders);
    showToast('Commandes mises à jour');
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    setSettingsState(newSettings);
    await saveSettings(newSettings);
    showToast('Paramètres enregistrés');
  };

  // Cart Handlers
  const handleAddToCart = (
    product: Product,
    size: ShirtSize,
    quantity: number,
    color: string
  ) => {
    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id && item.size === size && item.color === color
    );

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart = [
        ...cart,
        {
          productId: product.id,
          product,
          size,
          quantity,
          color,
          unitPrice: product.price,
        },
      ];
    }

    setCartState(updatedCart);
    saveCart(updatedCart);
    showToast(`"${product.name}" (${size}) ajouté au panier !`);
  };

  const handleUpdateCartQuantity = (
    productId: string,
    size: string,
    color: string,
    delta: number
  ) => {
    const updated = cart
      .map((item) => {
        if (
          item.productId === productId &&
          item.size === size &&
          item.color === color
        ) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    setCartState(updated);
    saveCart(updated);
  };

  const handleRemoveCartItem = (productId: string, size: string, color: string) => {
    const updated = cart.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.size === size &&
          item.color === color
        )
    );
    setCartState(updated);
    saveCart(updated);
    showToast('Article retiré du panier', 'info');
  };

  const handleClearCart = () => {
    setCartState([]);
    saveCart([]);
  };

  // Wishlist Handlers
  const handleToggleWishlist = (productId: string) => {
    const isSaved = wishlistIds.includes(productId);
    let updated: string[];
    if (isSaved) {
      updated = wishlistIds.filter((id) => id !== productId);
      showToast('Article retiré de vos favoris', 'info');
    } else {
      updated = [...wishlistIds, productId];
      showToast('Article ajouté à vos favoris !', 'success');
    }
    setWishlistState(updated);
    saveWishlist(updated);
  };

  // Order Placement (Checkout)
  const handleOrderPlaced = async (order: Order) => {
    // 1. Save order to list
    const updatedOrders = [order, ...orders];
    setOrdersState(updatedOrders);
    await saveOrders(updatedOrders);

    // 2. Decrement stock for each item
    const updatedProducts = products.map((prod) => {
      const purchasedForThis = order.items.filter((it) => it.productId === prod.id);
      if (purchasedForThis.length === 0) return prod;

      const newStock = { ...prod.stock };
      purchasedForThis.forEach((it) => {
        if (newStock[it.size] !== undefined) {
          newStock[it.size] = Math.max(0, newStock[it.size] - it.quantity);
        }
      });

      return {
        ...prod,
        stock: newStock,
      };
    });

    setProductsState(updatedProducts);
    await saveProducts(updatedProducts);

    // 3. Clear cart
    handleClearCart();
  };

  // Derived Values
  const featuredProducts = products.filter((p) => p.featured || p.badge === 'Populaire');
  const newArrivals = products.filter((p) => p.badge === 'Nouveau');
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navigateToShop = (category: string = 'all') => {
    setShopCategoryFilter(category);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0B1325] flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-[#0B1325]">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-[#0B1325] flex flex-col items-center justify-center text-white space-y-4">
          <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
          <div className="font-serif text-lg tracking-widest animate-pulse">AZIZ FASHION</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Chargement de votre expérience...</p>
        </div>
      )}

      {/* Header with Navigation */}
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        settings={settings}
      />

      {/* Main View Switcher */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div className="space-y-16 sm:space-y-24">
            {/* Hero Banner Section */}
            <HeroBanner
              onExplore={() => navigateToShop('all')}
              settings={settings}
            />

            {/* Reassurance & Value Proposition Bar */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 bg-[#0B1325] text-white rounded-3xl border border-[#D4AF37]/30 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      100% Coton Peigné
                    </h4>
                    <p className="text-[11px] text-slate-300">Tissé main & finitions nobles</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Coupe Impeccable
                    </h4>
                    <p className="text-[11px] text-slate-300">Cols structurés & tenue parfaite</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Livraison Express
                    </h4>
                    <p className="text-[11px] text-slate-300">24h à 48h à Ouaga et sous-région</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Échange Garanti
                    </h4>
                    <p className="text-[11px] text-slate-300">Sous 48h en cas de mauvaise taille</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Creations Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5E8] text-[#997A1E] text-xs font-bold uppercase tracking-widest border border-[#D4AF37]/30 mb-2">
                    <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Incontournables</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1325] font-serif tracking-tight">
                    Nos Chemises Vedettes
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Les pièces emblématiques plébiscitées pour leur allure et leur confort d'exception.
                  </p>
                </div>

                <button
                  onClick={() => navigateToShop('all')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0B1325] hover:text-[#997A1E] transition-colors group"
                >
                  <span>Explorer toute la collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)).map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onQuickAddToCart={(p, size) =>
                        handleAddToCart(p, size, 1, p.colors[0]?.name || 'Standard')
                      }
                      settings={settings}
                    />
                  )
                )}
              </div>
            </section>

            {/* Visual Category Banner Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  Univers & Confections
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1325] font-serif">
                  Découvrez nos lignes de style
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category 1: Faso Danfani */}
                <div
                  onClick={() => navigateToShop('Faso Danfani')}
                  className="relative group h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg border border-[#E8E4DC]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
                    alt="Faso Danfani"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1325] via-[#0B1325]/40 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                    <span className="text-[11px] font-bold uppercase text-[#D4AF37] tracking-widest">
                      Héritage & Prestige
                    </span>
                    <h3 className="text-xl font-bold font-serif">Faso Danfani Tissé Main</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      L'authenticité du fil de coton burkinabè travaillé avec une coupe moderne et épurée.
                    </p>
                    <span className="text-xs font-bold text-[#D4AF37] inline-flex items-center gap-1 group-hover:underline pt-1">
                      Découvrir la ligne <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Category 2: Cérémonie & Prestige */}
                <div
                  onClick={() => navigateToShop('Cérémonie & Prestige')}
                  className="relative group h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg border border-[#E8E4DC]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
                    alt="Cérémonie & Prestige"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1325] via-[#0B1325]/40 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                    <span className="text-[11px] font-bold uppercase text-[#D4AF37] tracking-widest">
                      Grands Événements
                    </span>
                    <h3 className="text-xl font-bold font-serif">Cérémonie & Réceptions</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      Des broderies dorées discrètes et des cols officier haute prestance pour marquer les esprits.
                    </p>
                    <span className="text-xs font-bold text-[#D4AF37] inline-flex items-center gap-1 group-hover:underline pt-1">
                      Découvrir la ligne <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Category 3: Signature Aziz */}
                <div
                  onClick={() => navigateToShop('Signature')}
                  className="relative group h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg border border-[#E8E4DC]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80"
                    alt="Signature Aziz"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1325] via-[#0B1325]/40 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                    <span className="text-[11px] font-bold uppercase text-[#D4AF37] tracking-widest">
                      Éditions Limitées
                    </span>
                    <h3 className="text-xl font-bold font-serif">Ligne Signature Aziz</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      Le mariage du bleu nuit profond et des finitions dorées signatures de notre maison.
                    </p>
                    <span className="text-xs font-bold text-[#D4AF37] inline-flex items-center gap-1 group-hover:underline pt-1">
                      Découvrir la ligne <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* New Arrivals Section */}
            {newArrivals.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                      Derniers Ateliers
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1325] font-serif">
                      Nouveautés Récentes
                    </h2>
                  </div>
                  <button
                    onClick={() => navigateToShop('all')}
                    className="text-xs sm:text-sm font-bold text-[#997A1E] hover:underline"
                  >
                    Voir toutes les nouveautés
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {newArrivals.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onQuickAddToCart={(p, size) =>
                        handleAddToCart(p, size, 1, p.colors[0]?.name || 'Standard')
                      }
                      settings={settings}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Brand Story & Tailoring Section */}
            <BrandStory
              onDiscoverShowroom={() => {
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Customer Testimonials & Reviews */}
            <CustomerReviews />

            {/* Showroom & Contact interactive Section */}
            <ContactSection settings={settings} />
          </div>
        )}

        {/* VIEW 2: SHOP CATALOG */}
        {(currentView === 'shop' || currentView === 'new') && (
          <ShopPage
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            settings={settings}
            initialCategory={currentView === 'new' ? 'all' : shopCategoryFilter}
          />
        )}

        {/* VIEW 3: ABOUT / SAVOIR-FAIRE */}
        {currentView === 'about' && (
          <div className="py-12 space-y-16">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Maison Aziz Fashion
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-[#0B1325]">
                L'Élégance Africaine Contemporaine
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Fondée avec la conviction profonde que le textile traditionnel africain mérite les finitions les plus nobles de la haute couture internationale.
              </p>
            </div>

            <BrandStory
              onDiscoverShowroom={() => {
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <CustomerReviews />
          </div>
        )}

        {/* VIEW 4: CONTACT & SHOWROOM */}
        {currentView === 'contact' && (
          <div className="py-8">
            <ContactSection settings={settings} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        settings={settings}
      />

      {/* Floating Action Elements */}
      <WhatsAppFloat settings={settings} />

      <MobileNav
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setWishlistOpen(true)}
      />

      {/* Drawers & Modals */}
      {/* 1. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        allProducts={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        settings={settings}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        settings={settings}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cart}
        onOrderPlaced={handleOrderPlaced}
        settings={settings}
      />

      {/* 4. Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistIds={wishlistIds}
        products={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={(product, size) => {
          handleAddToCart(product, size, 1, product.colors[0]?.name || 'Standard');
          handleToggleWishlist(product.id);
        }}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* 5. Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* 6. Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

      {/* 7. Admin Dashboard */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        orders={orders}
        settings={settings}
        onSaveProducts={handleUpdateProducts}
        onSaveOrders={handleUpdateOrders}
        onSaveSettings={handleUpdateSettings}
        isAuthenticated={isAdminAuthenticated}
        onLogin={setIsAdminAuthenticated}
      />

      {/* Toast feedback */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
