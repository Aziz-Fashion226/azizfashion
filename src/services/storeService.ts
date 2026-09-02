import { Product, Order, StoreSettings, Review, CartItem, OrderStatus, ShirtSize } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_SETTINGS } from '../data/initialData';
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  PRODUCTS: 'aziz_fashion_products_v1',
  ORDERS: 'aziz_fashion_orders_v1',
  SETTINGS: 'aziz_fashion_settings_v1',
  REVIEWS: 'aziz_fashion_reviews_v1',
  WISHLIST: 'aziz_fashion_wishlist_v1',
  CART: 'aziz_fashion_cart_v1',
  ADMIN_AUTH: 'aziz_fashion_admin_session_v1',
  CUSTOMER_ORDERS: 'aziz_fashion_customer_orders_v1',
};

export const formatFCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

// --- Mapping Helpers (snake_case DB <-> camelCase TS) ---

const mapProductFromDb = (p: any): Product => ({
  ...p,
  originalPrice: p.original_price,
  isAvailable: p.is_available,
  reviewCount: p.review_count,
  createdAt: p.created_at,
});

const mapProductToDb = (p: Product) => ({
  id: p.id,
  name: p.name,
  reference: p.reference,
  tagline: p.tagline,
  description: p.description,
  features: p.features,
  fabric: p.fabric,
  origin: p.origin,
  fit: p.fit,
  price: p.price,
  original_price: p.originalPrice,
  stock: p.stock,
  category: p.category,
  badge: p.badge,
  images: p.images,
  is_available: p.isAvailable,
  featured: p.featured,
  rating: p.rating,
  review_count: p.reviewCount,
});

const mapSettingsFromDb = (s: any): StoreSettings => ({
  storeName: s.store_name || INITIAL_SETTINGS.storeName,
  brandSlogan: s.brand_slogan || INITIAL_SETTINGS.brandSlogan,
  whatsappNumber: s.whatsapp_number || INITIAL_SETTINGS.whatsappNumber,
  whatsappDisplay: s.whatsapp_display || INITIAL_SETTINGS.whatsappDisplay,
  phoneDisplay: s.phone_display || INITIAL_SETTINGS.phoneDisplay,
  emailContact: s.email_contact || INITIAL_SETTINGS.emailContact,
  addressShowroom: s.address_showroom || INITIAL_SETTINGS.addressShowroom,
  cityCountry: s.city_country || INITIAL_SETTINGS.cityCountry,
  freeShippingThreshold: s.free_shipping_threshold || INITIAL_SETTINGS.freeShippingThreshold,
  defaultDeliveryFee: s.default_delivery_fee || INITIAL_SETTINGS.defaultDeliveryFee,
  bannerAnnouncement: s.banner_announcement || INITIAL_SETTINGS.bannerAnnouncement,
  bannerEnabled: s.banner_enabled ?? INITIAL_SETTINGS.bannerEnabled,
  currency: s.currency || INITIAL_SETTINGS.currency,
});

const mapSettingsToDb = (s: StoreSettings) => ({
  id: 1,
  store_name: s.storeName,
  brand_slogan: s.brandSlogan,
  whatsapp_number: s.whatsappNumber,
  whatsapp_display: s.whatsappDisplay,
  phone_display: s.phoneDisplay,
  email_contact: s.emailContact,
  address_showroom: s.addressShowroom,
  city_country: s.cityCountry,
  free_shipping_threshold: s.freeShippingThreshold,
  default_delivery_fee: s.defaultDeliveryFee,
  banner_announcement: s.bannerAnnouncement,
  banner_enabled: s.bannerEnabled,
  currency: s.currency,
});

const mapOrderFromDb = (o: any): Order => ({
  ...o,
  orderNumber: o.order_number,
  deliveryFee: o.delivery_fee,
  deliveryMethod: o.delivery_method,
  paymentMethod: o.payment_method,
  createdAt: o.created_at,
  updatedAt: o.updated_at,
  items: (o.items || []).map((item: any) => ({
    ...item,
    // Ensure we have a product object for the UI, even if stripped in DB
    product: item.product || {
      name: item.productName || 'Produit archivé',
      reference: item.productReference || 'N/A',
      images: [item.productImage || '']
    }
  }))
});

const mapOrderToDb = (o: Order) => ({
  id: o.id,
  order_number: o.orderNumber,
  customer: o.customer,
  items: o.items.map(item => ({
    productId: item.productId,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    // We store minimal product info for history
    productName: item.product?.name,
    productReference: item.product?.reference,
    productImage: item.product?.images?.[0]
  })),
  subtotal: o.subtotal,
  delivery_fee: o.deliveryFee,
  discount: o.discount,
  total: o.total,
  delivery_method: o.deliveryMethod,
  payment_method: o.paymentMethod,
  status: o.status,
  notes: o.notes,
  created_at: o.createdAt,
  updated_at: o.updatedAt,
});

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

    return data.map(mapProductFromDb);
  } catch (e) {
    console.error('Error fetching products from Supabase:', e);
    return INITIAL_PRODUCTS;
  }
};

export const addProduct = async (product: Product) => {
  const { error } = await supabase.from('products').insert(mapProductToDb(product));
  if (error) throw error;
};

export const updateProduct = async (product: Product) => {
  const toUpdate = mapProductToDb(product);
  const { error } = await supabase.from('products').upsert(toUpdate);
  if (error) throw error;
};

export const deleteProduct = async (productId: string) => {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
};

// Orders
export const getStoredOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapOrderFromDb);
  } catch (e) {
    console.error('Error fetching orders:', e);
    return [];
  }
};

export const saveOrder = async (order: Order) => {
  try {
    const { error } = await supabase.from('orders').upsert(mapOrderToDb(order));
    if (error) throw error;
  } catch (e) {
    console.error('Error saving order:', e);
    throw e;
  }
};

export const saveStoredOrders = async (orders: Order[]) => {
  // Keeping this for compatibility but ideally we should update record by record
  try {
    const { error } = await supabase.from('orders').upsert(orders.map(mapOrderToDb));
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
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn('⚠️ store_settings vide sur Supabase, utilisation des données locales.');
      return INITIAL_SETTINGS;
    }

    return mapSettingsFromDb(data[0]);
  } catch (e) {
    console.error('Error fetching settings:', e);
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = async (settings: StoreSettings) => {
  try {
    const { error } = await supabase.from('store_settings').upsert(mapSettingsToDb(settings));
    if (error) throw error;
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

// Reviews
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

// --- Local Storage Utilities (Cart & Wishlist remain local for UX) ---

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

export const getStoredCustomerOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCustomerOrderLocally = (order: Order) => {
  try {
    const existing = getStoredCustomerOrders();
    const updated = [order, ...existing].slice(0, 10); // Keep last 10 orders
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving order locally:', e);
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
        `${idx + 1}. *${item.product?.name || item.productName || 'Chemise'}* (Taille: ${item.size}) x${item.quantity} = ${formatFCFA(item.unitPrice * item.quantity)}`
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
      (item) => `• ${item.product?.name || item.productName || 'Chemise'} (${item.size}) x${item.quantity} - ${formatFCFA(item.unitPrice * item.quantity)}`
    )
    .join('\n');

  const text = `Bonjour Aziz Fashion 👋🏾

Je viens de valider ma commande *#${order.orderNumber}* sur votre boutique en ligne.

Merci de m'accuser réception et de me confirmer les prochaines étapes.

*Détails de la commande :*
*Client :* ${order.customer.fullName}
*Téléphone :* ${order.customer.phone}
*Mode de livraison :* ${order.deliveryMethod}
*Articles :*
${itemsText}

*Total :* ${formatFCFA(order.total)}

Merci pour votre professionnalisme !`;

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
  const text = `Bonjour ${customerName} 👋🏾,

La boutique *AZIZ FASHION* a bien reçu votre commande *#${orderNumber}*.

Nous vous remercions pour votre confiance envers notre savoir-faire. ✨

Votre commande est actuellement en cours de traitement. Nous préparons vos articles avec le plus grand soin.

Nous restons à votre entière disposition pour toute question.

À très bientôt ! 👔`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};


// --- Storage / Image Upload ---
export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

// Specific order fetch for tracking
export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) throw error;
    return mapOrderFromDb(data);
  } catch (e) {
    console.error('Error fetching order for tracking:', e);
    return null;
  }
};

// --- Statistics ---
export const incrementVisitCount = async () => {
  try {
    const { error } = await supabase.rpc('increment_visit_count');
    if (error) {
      // Fallback if RPC is not created yet
      const { data } = await supabase.from('site_stats').select('visit_count').eq('id', 'total_visits').single();
      const current = data?.visit_count || 0;
      await supabase.from('site_stats').update({ visit_count: Number(current) + 1 }).eq('id', 'total_visits');
    }
  } catch (e) {
    console.error('Error incrementing visits:', e);
  }
};

export const getVisitCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('site_stats')
      .select('visit_count')
      .eq('id', 'total_visits')
      .single();

    if (error) throw error;
    return Number(data?.visit_count || 0);
  } catch (e) {
    console.error('Error fetching visit count:', e);
    return 0;
  }
};

export interface VisitStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  total: number;
}

export const getDetailedVisitStats = async (): Promise<VisitStats> => {
  try {
    const { data, error } = await supabase.rpc('get_detailed_stats');
    if (error) throw error;
    return data as VisitStats;
  } catch (e) {
    console.error('Error fetching detailed stats:', e);
    // Fallback simple si l'internaute n'a pas encore créé la fonction RPC
    const total = await getVisitCount();
    return { today: 0, thisWeek: 0, thisMonth: 0, thisYear: 0, total };
  }
};

// Aliases for cleaner imports
export const getProducts = getStoredProducts;
export const getOrders = getStoredOrders;
export const getSettings = getStoredSettings;
export const saveSettings = saveStoredSettings;
export const getWishlist = getStoredWishlist;
export const saveWishlist = saveStoredWishlist;
export const getCart = getStoredCart;
export const saveCart = saveStoredCart;
export const getCustomerOrders = getStoredCustomerOrders;
export const saveCustomerOrder = saveCustomerOrderLocally;
