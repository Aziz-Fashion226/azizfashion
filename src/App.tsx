import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, StoreSettings, ShirtSize } from './types';
import {
  getProducts,
  getOrders,
  saveOrder,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist,
  saveCustomerOrder,
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
import { ContactSection } from './components/home/ContactSection';

// Shop & Product Views
import { ProductCard } from './components/shop/ProductCard';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { ShopPage } from './components/shop/ShopPage';

// Cart & Checkout
import { CartPage } from './components/cart/CartPage';
import { CheckoutModal } from './components/checkout/CheckoutModal';

// Modals & Common
import { SizeGuideModal } from './components/common/SizeGuideModal';
import { SearchModal } from './components/common/SearchModal';
import { Toast } from './components/common/Toast';
import { WishlistPage } from './components/wishlist/WishlistPage';
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
  // Navigation View State: 'home' | 'shop' | 'about' | 'contact' | 'new' | 'cart' | 'wishlist'
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'about' | 'contact' | 'new' | 'cart' | 'wishlist'>('home');

  // Sync state with browser history for back button support
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial state
    window.history.replaceState({ view: 'home' }, '');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToView = (view: any) => {
    if (view === currentView) return;
    setCurrentView(view);
    window.history.pushState({ view }, '', view === 'home' ? '/' : `#${view}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

    const productsSubscription = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProductsState((current) =>
              current.map((p) => (p.id === payload.new.id ? {
                ...p,
                ...payload.new,
                originalPrice: payload.new.original_price,
                isAvailable: payload.new.is_available,
                reviewCount: payload.new.review_count,
              } : p))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(productsSubscription);
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
    // Persistance handled individually in AdminDashboard or Checkout
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
    quantity: number
  ) => {
    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id && item.size === size
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
          color: 'Standard',
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
    delta: number
  ) => {
    const updated = cart
      .map((item) => {
        if (
          item.productId === productId &&
          item.size === size
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

  const handleRemoveCartItem = (productId: string, size: string) => {
    const updated = cart.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.size === size
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
    try {
      // 1. Save order to Supabase
      await saveOrder(order);

      // 2. Update local state
      setOrdersState([order, ...orders]);

      // 3. Clear cart & Save locally
      saveCustomerOrder(order);
      handleClearCart();
      showToast('Commande validée avec succès !', 'success');
    } catch (error: any) {
      console.error('Error placing order:', error);
      showToast('Erreur lors de la commande : ' + error.message, 'info');
      throw error; // Re-throw to inform the UI
    }
  };

  // Derived Values
  const featuredProducts = products.filter((p) => p.featured || p.badge === 'Populaire');
  const newArrivals = products.filter((p) => p.badge === 'Nouveau');
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navigateToShop = (category: string = 'all') => {
    setShopCategoryFilter(category);
    navigateToView('shop');
  };

  return (
    <div className="min-h-screen bg-[#F7F3ED] text-[#1A1510] flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-[#1A1510]">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-[#1A1510] flex flex-col items-center justify-center text-white space-y-4">
          <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
          <div className="font-serif text-lg tracking-widest animate-pulse text-[#D4AF37]">AZIZ FASHION</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Chargement de votre expérience...</p>
        </div>
      )}

      {/* Header with Navigation */}
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        currentView={currentView}
        onNavigate={navigateToView}
        onOpenCart={() => navigateToView('cart')}
        onOpenWishlist={() => navigateToView('wishlist')}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        isAdminLoggedIn={isAdminAuthenticated}
        settings={settings}
      />

      {/* Main View Switcher */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div className="space-y-8 sm:space-y-24">
            {/* Hero Banner Section */}
            <HeroBanner
              onExplore={() => navigateToShop('all')}
              settings={settings}
            />

            {/* Reassurance & Featured Creations */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#C5A059]/30 pb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-4xl font-black text-[#1A1510] font-serif tracking-tight">
                    Nos Créations Vedettes
                  </h2>
                  <p className="text-[11px] sm:text-sm text-slate-500 font-medium italic">
                    L'excellence du savoir-faire textile burkinabè.
                  </p>
                </div>

                <button
                  onClick={() => navigateToShop('all')}
                  className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#C5A059] hover:text-[#997A1E] transition-colors group uppercase"
                >
                  <span>Voir toute la collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                        handleAddToCart(p, size, 1)
                      }
                      settings={settings}
                    />
                  )
                )}
              </div>
            </section>

            {/* Brand Story (Reduced) - REMOVED for simplification as per user request */}
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
                Fondée avec la conviction profonde que le textile traditionnel africain mérite de briller dans le prêt-à-porter haut de gamme.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 4: CONTACT & BOUTIQUE */}
        {currentView === 'contact' && (
          <div className="py-8">
            <ContactSection settings={settings} />
          </div>
        )}

        {/* VIEW 5: CART PAGE */}
        {currentView === 'cart' && (
          <CartPage
            items={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onProceedToCheckout={() => setCheckoutOpen(true)}
            onNavigate={navigateToView}
            settings={settings}
          />
        )}

        {/* VIEW 6: WISHLIST PAGE */}
        {currentView === 'wishlist' && (
          <WishlistPage
            wishlistIds={wishlistIds}
            products={products}
            onRemoveFromWishlist={handleToggleWishlist}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            onNavigate={navigateToView}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={navigateToView}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        settings={settings}
      />

      {/* Floating Action Elements */}
      <WhatsAppFloat settings={settings} />

      <MobileNav
        currentView={currentView}
        onNavigate={navigateToView}
        cartCount={totalCartCount}
        onOpenCart={() => navigateToView('cart')}
        onOpenSearch={() => setSearchOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => navigateToView('wishlist')}
        onOpenAdmin={() => setAdminOpen(true)}
        isAdminLoggedIn={isAdminAuthenticated}
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

      {/* 2. Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          if (currentView === 'cart') navigateToView('shop');
        }}
        items={cart}
        onOrderPlaced={handleOrderPlaced}
        settings={settings}
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
