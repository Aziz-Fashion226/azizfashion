import { Product, Order, StoreSettings, Review, CartItem, OrderStatus, ShirtSize } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_SETTINGS } from '../data/initialData';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  PRODUCTS: 'aziz_fashion_products_v1',
  ORDERS: 'aziz_fashion_orders_v1',
  SETTINGS: 'aziz_fashion_settings_v1',
  REVIEWS: 'aziz_fashion_reviews_v1',
  WISHLIST: 'aziz_fashion_wishlist_v1',
  CART: 'aziz_fashion_cart_v1',
  ADMIN_AUTH: 'aziz_fashion_admin_session_v1',
};

export const formatFCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

// --- Supabase Database Integration ---

// Products
export const getStoredProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return INITIAL_PRODUCTS;

    // Mapping snake_case (DB) to camelCase (TS) if necessary
    return data.map(p => ({
      ...p,
      originalPrice: p.original_price,
      isAvailable: p.is_available,
      reviewCount: p.review_count,
    }));
  } catch (e) {
    console.error('Error fetching products from Supabase:', e);
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = async (products: Product[]) => {
  // En mode DB, on ne sauvegarde généralement pas toute la liste
  // Mais pour rester compatible avec la logique actuelle, on peut faire un upsert
  try {
    const toUpsert = products.map(p => ({
      id: p.id,
      name: p.name,
      reference: p.reference,
      tagline: p.tagline,
      description: p.description,
      features: p.features,
      fabric: p.fabric,
      origin: p.origin,
      fit: p.fit,
      collar: p.collar,
      price: p.price,
      original_price: p.originalPrice,
      stock: p.stock,
      category: p.category,
      badge: p.badge,
      images: p.images,
      colors: p.colors,
      is_available: p.isAvailable,
      featured: p.featured,
      rating: p.rating,
      review_count: p.reviewCount,
    }));

    const { error } = await supabase.from('products').upsert(toUpsert);
    if (error) throw error;
  } catch (e) {
    console.error('Error saving products to Supabase:', e);
  }
};

// Orders
export const getStoredOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching orders:', e);
    return [];
  }
};

export const saveStoredOrders = async (orders: Order[]) => {
  // Ici on upsert généralement la commande modifiée
  try {
    const { error } = await supabase.from('orders').upsert(orders);
    if (error) throw error;
  } catch (e) {
    console.error('Error saving orders:', e);
  }
};

// Settings
export const getStoredSettings = async (): Promise<StoreSettings> => {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error) throw error;
    return data || INITIAL_SETTINGS;
  } catch (e) {
    console.error('Error fetching settings:', e);
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = async (settings: StoreSettings) => {
  try {
    const { error } = await supabase.from('store_settings').upsert({ id: 1, ...settings });
    if (error) throw error;
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

// --- Local Storage Utilities (Cart & Wishlist remain local for UX) ---

export const getStoredReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return INITIAL_REVIEWS;
    return data;
  } catch (e) {
    console.error('Error fetching reviews:', e);
    return INITIAL_REVIEWS;
  }
};

export const saveStoredReviews = async (reviews: Review[]) => {
  try {
    const { error } = await supabase.from('reviews').upsert(reviews);
    if (error) throw error;
  } catch (e) {
    console.error('Error saving reviews:', e);
  }
};

export const getStoredWishlist = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveStoredWishlist = (ids: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(ids));
  } catch (e) {
    console.error('Error saving wishlist:', e);
  }
};

export const getStoredCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveStoredCart = (cart: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
};

// WhatsApp Link Generators
export const generateProductWhatsAppUrl = (
  product: Product,
  size: ShirtSize,
  quantity: number,
  settings: StoreSettings
): string => {
  const priceFormatted = formatFCFA(product.price);
  const totalFormatted = formatFCFA(product.price * quantity);
  
  const text = `Bonjour Aziz Fashion 👋🏾

Je souhaite commander :

Chemise : ${product.name}
Taille : ${size}
Quantité : ${quantity}
Prix : ${priceFormatted}

Total : ${totalFormatted}

Je souhaite avoir plus d'informations pour la livraison.`;

  const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const generateCartWhatsAppUrl = (
  items: CartItem[],
  totalAmount: number,
  settings: StoreSettings,
  customerName?: string
): string => {
  const itemsList = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.name}* (Taille: ${item.size}, Couleur: ${item.color}) x${item.quantity} = ${formatFCFA(item.unitPrice * item.quantity)}`
    )
    .join('\n');

  const greeting = customerName ? `Bonjour Aziz Fashion 👋🏾, je suis ${customerName}.` : `Bonjour Aziz Fashion 👋🏾`;

  const text = `${greeting}

Je souhaite finaliser ma commande sur le site :

${itemsList}

*Montant Total Estimé :* ${formatFCFA(totalAmount)}

Pouvez-vous confirmer la disponibilité et les modalités de livraison ? Merci !`;

  const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const generateOrderConfirmationWhatsAppUrl = (
  order: Order,
  settings: StoreSettings
): string => {
  const itemsText = order.items
    .map(
      (item) => `• ${item.product.name} (${item.size}) x${item.quantity} - ${formatFCFA(item.unitPrice * item.quantity)}`
    )
    .join('\n');

  const text = `Bonjour Aziz Fashion 👋🏾

Je viens de passer la commande *#${order.orderNumber}* sur votre boutique en ligne.

*Client :* ${order.customer.fullName}
*Téléphone :* ${order.customer.phone}
*Ville & Quartier :* ${order.customer.city}, ${order.customer.district}
*Mode de livraison :* ${order.deliveryMethod}
*Paiement :* ${order.paymentMethod}

*Articles commandés :*
${itemsText}

*Total à régler :* ${formatFCFA(order.total)}

Merci de me confirmer la prise en charge et le créneau de livraison !`;

  const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const generateCustomerDirectWhatsAppUrl = (
  customerPhone: string,
  orderNumber: string,
  customerName: string,
  status: OrderStatus
): string => {
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const text = `Bonjour ${customerName} 👋🏾, ici la maison AZIZ FASHION.

Nous vous contactons concernant votre commande #${orderNumber}.
Son statut actuel est : *${status}*.

Restons à votre disposition pour toute question. Merci pour votre confiance !`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

// Stock deduction helper
export const processOrderStockDeduction = (products: Product[], items: CartItem[]): Product[] => {
  const updatedProducts = [...products];

  for (const item of items) {
    const pIndex = updatedProducts.findIndex((p) => p.id === item.productId);
    if (pIndex !== -1) {
      const prod = { ...updatedProducts[pIndex] };
      const currentStock = prod.stock[item.size] || 0;
      prod.stock = {
        ...prod.stock,
        [item.size]: Math.max(0, currentStock - item.quantity),
      };

      // Check if completely out of stock across all sizes
      const totalStock = (Object.values(prod.stock) as number[]).reduce((a, b) => a + b, 0);
      if (totalStock === 0) {
        prod.isAvailable = false;
      }

      updatedProducts[pIndex] = prod;
    }
  }

  return updatedProducts;
};

// Stock management helpers
export const updateProductStock = (
  products: Product[],
  productId: string,
  size: ShirtSize,
  delta: number
): Product[] => {
  return products.map((p) => {
    if (p.id === productId) {
      const currentStock = p.stock[size] || 0;
      const newStock = Math.max(0, currentStock + delta);
      const updatedStock = { ...p.stock, [size]: newStock };

      // Auto-update availability
      const totalStock = (Object.values(updatedStock) as number[]).reduce((a, b) => a + b, 0);

      return {
        ...p,
        stock: updatedStock,
        isAvailable: totalStock > 0,
      };
    }
    return p;
  });
};

// Aliases for cleaner imports
export const getProducts = getStoredProducts;
export const saveProducts = saveStoredProducts;
export const getOrders = getStoredOrders;
export const saveOrders = saveStoredOrders;
export const getSettings = getStoredSettings;
export const saveSettings = saveStoredSettings;
export const getWishlist = getStoredWishlist;
export const saveWishlist = saveStoredWishlist;
export const getCart = getStoredCart;
export const saveCart = saveStoredCart;
