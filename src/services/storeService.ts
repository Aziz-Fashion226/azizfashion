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

// --- Mapping Helpers (snake_case DB <-> camelCase TS) ---

const mapProductFromDb = (p: any): Product => ({
  ...p,
  originalPrice: p.original_price,
  isAvailable: p.is_available,
  reviewCount: p.review_count,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
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
      images: ['']
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
    productName: item.product.name,
    productReference: item.product.reference
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
  const toUpdate = {
    ...mapProductToDb(product),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('products').update(toUpdate).eq('id', product.id);
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

    return data[0];
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

// Stock management helpers
export const updateProductStockInDb = async (
  productId: string,
  size: ShirtSize,
  quantityToSubtract: number
) => {
  const { data: prod, error: fetchError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single();

  if (fetchError || !prod) throw fetchError || new Error('Product not found');

  const newStock = { ...prod.stock };
  const currentVal = newStock[size] || 0;

  if (currentVal < quantityToSubtract) {
    throw new Error(`Stock insuffisant pour la taille ${size}`);
  }

  newStock[size] = currentVal - quantityToSubtract;

  const totalStock = (Object.values(newStock) as number[]).reduce((a, b) => a + b, 0);
  const { error: updateError } = await supabase
    .from('products')
    .update({
      stock: newStock,
      is_available: totalStock > 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);

  if (updateError) throw updateError;
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

// Aliases for cleaner imports
export const getProducts = getStoredProducts;
export const getOrders = getStoredOrders;
export const getSettings = getStoredSettings;
export const saveSettings = saveStoredSettings;
export const getWishlist = getStoredWishlist;
export const saveWishlist = saveStoredWishlist;
export const getCart = getStoredCart;
export const saveCart = saveStoredCart;
