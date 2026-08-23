import { supabase } from './supabaseClient';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_REVIEWS } from '../data/initialData';

export const seedDatabase = async () => {
  console.log('🚀 Démarrage de la synchronisation Supabase...');

  try {
    // 1. Sync Settings
    const { error: settingsError } = await supabase
      .from('store_settings')
      .upsert({
        id: 1,
        store_name: INITIAL_SETTINGS.storeName,
        brand_slogan: INITIAL_SETTINGS.brandSlogan,
        whatsapp_number: INITIAL_SETTINGS.whatsappNumber,
        whatsapp_display: INITIAL_SETTINGS.whatsappDisplay,
        phone_display: INITIAL_SETTINGS.phoneDisplay,
        email_contact: INITIAL_SETTINGS.emailContact,
        address_showroom: INITIAL_SETTINGS.addressShowroom,
        city_country: INITIAL_SETTINGS.cityCountry,
        free_shipping_threshold: INITIAL_SETTINGS.freeShippingThreshold,
        default_delivery_fee: INITIAL_SETTINGS.defaultDeliveryFee,
        banner_announcement: INITIAL_SETTINGS.bannerAnnouncement,
        banner_enabled: INITIAL_SETTINGS.bannerEnabled,
        currency: INITIAL_SETTINGS.currency
      });
    if (settingsError) console.error('❌ Erreur Settings:', settingsError.message);
    else console.log('✅ Paramètres synchronisés');

    // 2. Sync Products
    const productsToInsert = INITIAL_PRODUCTS.map(p => ({
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
      created_at: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
    }));

    const { error: productsError } = await supabase
      .from('products')
      .upsert(productsToInsert);

    if (productsError) console.error('❌ Erreur Produits:', productsError.message);
    else console.log('✅ Produits synchronisés');

    // 3. Sync Reviews
    const reviewsToInsert = INITIAL_REVIEWS.map(r => ({
      id: r.id,
      product_id: r.productId,
      product_name: r.productName,
      author_name: r.authorName,
      city: r.city,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      verified_buyer: r.verifiedBuyer,
      user_photo: r.userPhoto
    }));

    const { error: reviewsError } = await supabase
      .from('reviews')
      .upsert(reviewsToInsert);

    if (reviewsError) console.error('❌ Erreur Avis:', reviewsError.message);
    else console.log('✅ Avis synchronisés');

    console.log('✨ Synchronisation terminée avec succès !');
    if (typeof window !== 'undefined') alert('✅ Base de données actualisée avec succès sur Supabase !');
    return { success: true };
  } catch (error) {
    console.error('💥 Erreur fatale de synchronisation:', error);
    if (typeof window !== 'undefined') alert('❌ Erreur lors de l\'actualisation : ' + (error as any).message);
    return { success: false, error };
  }
};

// Auto-exécution si lancé via CLI (compatible tsx)
seedDatabase().then(() => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test' && typeof window === 'undefined') {
    // Si on est dans un terminal, on peut forcer la sortie après succès
    // process.exit(0);
  }
});
