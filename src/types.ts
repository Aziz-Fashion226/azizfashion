export type ShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface SizeStock {
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface ColorVariant {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  reference: string;
  tagline: string;
  description: string;
  features: string[];
  fabric: string;
  origin: string;
  fit: 'Ajustée (Slim)' | 'Droite (Regular)' | 'Moderne Relax';
  price: number; // in FCFA
  originalPrice?: number; // for promo
  stock: SizeStock;
  category: 'Faso Danfani' | 'Pathé\'O' | 'Lin' | 'Lin cassé';
  badge?: 'Nouveau' | 'Promo' | 'Populaire' | 'Édition Limitée';
  images: string[];
  colors?: ColorVariant[]; // Made optional
  isAvailable: boolean;
  featured?: boolean;
  createdAt: string;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  productId: string;
  product?: Product; // Made optional to support lightweight history
  productName?: string; // Stored in history
  productReference?: string; // Stored in history
  size: ShirtSize;
  color: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'Commande reçue' | 'Commande livrée' | 'Annulée';

export type PaymentMethod = 'Paiement à la livraison' | 'Orange Money' | 'Moov Money' | 'Wave' | 'MTN Mobile Money' | 'Paiement par carte (CinetPay)';

export type DeliveryMethod = 'Livraison à domicile' | 'Récupération en boutique';

export interface CustomerInfo {
  fullName: string;
  phone: string;
  whatsapp: string;
  city: string;
  district: string;
  landmark: string;
  deliveryInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId?: string;
  productName?: string;
  authorName: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
  avatarUrl?: string;
  userPhoto?: string;
}

export interface StoreSettings {
  storeName: string;
  brandSlogan: string;
  whatsappNumber: string; // e.g. "22670000000"
  whatsappDisplay: string; // e.g. "+226 70 00 00 00"
  phoneDisplay: string;
  emailContact: string;
  addressShowroom: string;
  cityCountry: string;
  freeShippingThreshold: number; // in FCFA
  defaultDeliveryFee: number; // in FCFA
  bannerAnnouncement: string;
  bannerEnabled: boolean;
  currency: string;
}

export interface FilterState {
  search: string;
  category: string;
  sizes: ShirtSize[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
}
