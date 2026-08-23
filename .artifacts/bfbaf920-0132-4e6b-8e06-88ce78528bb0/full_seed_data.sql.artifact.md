# Script de Remplissage Complet (Seed)

Exécutez ce script dans le **SQL Editor** de Supabase pour remplir votre base de données avec les données initiales d'Aziz Fashion.

```sql
-- 1. Nettoyage (Optionnel, décommenter si vous voulez repartir à zéro)
-- TRUNCATE public.products, public.reviews, public.store_settings CASCADE;

-- 2. Insertion des Paramètres (ID 1 obligatoire)
INSERT INTO public.store_settings (
    id, store_name, brand_slogan, whatsapp_number, whatsapp_display,
    phone_display, email_contact, address_showroom, city_country,
    free_shipping_threshold, default_delivery_fee, banner_announcement,
    banner_enabled, currency
) VALUES (
    1, 'AZIZ FASHION', 'L''élégance locale, autrement.', '22670844150', '+226 70 84 41 50',
    '+226 70 84 41 50 / +226 76 38 25 32', 'contact@azizfashion.com',
    'Avenue Kwamé N''Krumah, Immeuble Prestige, Ouagadougou', 'Ouagadougou, Burkina Faso',
    60000, 2000, '✨ Livraison offerte dès 60 000 FCFA | Confection 100% locale artisanale',
    true, 'FCFA'
) ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    brand_slogan = EXCLUDED.brand_slogan;

-- 3. Insertion des Produits
INSERT INTO public.products (
    id, name, reference, tagline, description, features, fabric, origin,
    fit, collar, price, original_price, stock, category, badge, images,
    colors, is_available, featured, rating, review_count
) VALUES
(
    'prod-faso-elegance', 'Faso Élégance', 'AZF-FE-001',
    'L''alliance subtile du Faso Danfani noble et de la coupe moderne',
    'Une chemise d''exception confectionnée à partir d''un tissage artisanal Faso Danfani aux motifs géométriques raffinés.',
    ARRAY['Tissage Faso Danfani 100% coton biologique', 'Col officier renforcé', 'Coupe ajustée'],
    '100% Coton peigné tissé main', 'Atelier Aziz Fashion - Ouagadougou',
    'Ajustée (Slim)', 'Col Officier', 28500, 35000,
    '{"S": 4, "M": 8, "L": 6, "XL": 3, "XXL": 0}', 'Faso Danfani', 'Populaire',
    ARRAY['https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80'],
    ARRAY['{"name": "Bleu Nuit & Or", "hex": "#0B192C"}'::jsonb], true, true, 4.9, 28
),
(
    'prod-signature', 'Signature Aziz', 'AZF-SG-007',
    'L''incarnation pure de la maison Aziz Fashion',
    'La quintessence de notre vision : une chemise bleu nuit profond ornée du monogramme AF doré.',
    ARRAY['Gorge de boutonnage cachée', 'Monogramme AF brodé fil or', 'Livrée dans sa boîte prestige'],
    'Popeline de coton d''exception', 'Atelier Principal Aziz Fashion',
    'Ajustée (Slim)', 'Col Mao', 38000, 42000,
    '{"S": 3, "M": 6, "L": 7, "XL": 2, "XXL": 1}', 'Signature', 'Populaire',
    ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'],
    ARRAY['{"name": "Bleu Nuit Profond", "hex": "#0B1325"}'::jsonb], true, true, 5.0, 42
);

-- 4. Insertion des Avis
INSERT INTO public.reviews (
    id, product_id, author_name, city, rating, comment, date, verified_buyer
) VALUES
('rev-1', 'prod-faso-elegance', 'Ibrahim Ouedraogo', 'Ouagadougou', 5, 'La qualité du tissu est remarquable.', '18 Août 2026', true),
('rev-2', 'prod-signature', 'Serge Kaboré', 'Bobo-Dioulasso', 5, 'Commande reçue le lendemain. Top !', '12 Août 2026', true);
```
