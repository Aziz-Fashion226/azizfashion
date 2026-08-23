# Script SQL pour Supabase Aziz Fashion

Copiez et collez ce script dans le **SQL Editor** de votre tableau de bord Supabase pour créer les tables.

```sql
-- 1. Table des Produits
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    reference TEXT,
    tagline TEXT,
    description TEXT,
    features TEXT[],
    fabric TEXT,
    origin TEXT,
    fit TEXT,
    collar TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    stock JSONB NOT NULL DEFAULT '{"S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0}'::jsonb,
    category TEXT,
    badge TEXT,
    images TEXT[],
    colors JSONB[],
    is_available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Paramètres de la Boutique
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    store_name TEXT,
    brand_slogan TEXT,
    whatsapp_number TEXT,
    whatsapp_display TEXT,
    phone_display TEXT,
    email_contact TEXT,
    address_showroom TEXT,
    city_country TEXT,
    free_shipping_threshold NUMERIC,
    default_delivery_fee NUMERIC,
    banner_announcement TEXT,
    banner_enabled BOOLEAN,
    currency TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- 3. Table des Avis Clients
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT,
    author_name TEXT NOT NULL,
    city TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date TEXT,
    verified_buyer BOOLEAN DEFAULT true,
    user_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table des Commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    delivery_method TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'Nouvelle',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique
CREATE POLICY "Lecture publique pour tous" ON public.products FOR SELECT USING (true);
CREATE POLICY "Lecture publique pour tous" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Lecture publique pour tous" ON public.reviews FOR SELECT USING (true);

-- Politiques d'écriture pour les admins (authentifiés)
CREATE POLICY "Admin CRUD" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin CRUD" ON public.store_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin CRUD" ON public.reviews FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin CRUD" ON public.orders FOR ALL TO authenticated USING (true);

-- Permettre l'insertion de commandes par les utilisateurs non connectés
CREATE POLICY "Insertion publique de commandes" ON public.orders FOR INSERT WITH CHECK (true);
```
