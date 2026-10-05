import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { processImageFile } from './imageUtils';

const STORAGE_URL_KEY = 'ballonsdei_supabase_url';
const STORAGE_ANON_KEY = 'ballonsdei_supabase_key';

// Read from env or localStorage
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) || '' : '';

  const url = (storedUrl.trim() || envUrl.trim());
  const anonKey = (storedKey.trim() || envKey.trim());

  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(STORAGE_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
    }

    if (anonKey.trim()) {
      localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_ANON_KEY);
    }
  }
}

const { url: initialUrl, anonKey: initialKey } = getSupabaseCredentials();

export const isSupabaseConfigured = Boolean(
  initialUrl && 
  initialKey && 
  initialUrl.startsWith('https://') && 
  initialUrl.includes('.supabase.co') &&
  !initialUrl.includes('your-project') &&
  initialKey.length > 20 &&
  !initialKey.includes('your-anon')
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(initialUrl, initialKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error('Error inicializando Supabase Client:', err);
  }
}

export const supabase = client;

/**
 * Storage helper for uploading images to 'product-images' bucket
 * or falling back to persistent Data URL if storage bucket is not configured.
 */
export async function uploadProductImage(
  file: File, 
  productId: string, 
  position: number
): Promise<{ url: string | null; error: Error | null }> {
  // First, convert to compressed persistent Data URL so we never have broken images
  let fallbackDataUrl: string = '';
  try {
    fallbackDataUrl = await processImageFile(file);
  } catch {
    fallbackDataUrl = '';
  }

  if (!supabase || !isSupabaseConfigured) {
    return {
      url: fallbackDataUrl,
      error: null,
    };
  }

  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `products/${productId}/image-${position}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, using persistent data URL:', uploadError.message);
      // Return the fallback data URL so product creation does not break!
      return { url: fallbackDataUrl, error: null };
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.warn('Storage error, falling back to data URL:', err);
    return { url: fallbackDataUrl, error: null };
  }
}

/**
 * Test connectivity with Supabase project
 */
export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  if (!url || !key) {
    return { success: false, message: 'La URL y la clave anónima son requeridas.' };
  }

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    return { success: false, message: 'La URL debe comenzar con https:// y pertenecer a supabase.co' };
  }

  try {
    const testClient = createClient(url, key);
    // Ping a simple public table or auth
    const { error } = await testClient.from('categories').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "categories" does not exist')) {
      return { success: false, message: `Error de conexión: ${error.message}` };
    }

    return { 
      success: true, 
      message: '¡Conexión exitosa con Supabase! Guarda los cambios para activar la sincronización.' 
    };
  } catch (err: any) {
    return { success: false, message: `Error conectando con Supabase: ${err.message || err}` };
  }
}

/**
 * Returns a complete SQL migration script to setup all tables in Supabase
 */
export function getSupabaseSQLScript(): string {
  return `-- ================================================================
-- BALLONSDEI - ESQUEMA COMPLETO DE BASE DE DATOS PARA SUPABASE
-- Copia y pega este script en el SQL Editor de tu proyecto Supabase
-- ================================================================

-- 1. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || substr(md5(random()::text), 1, 10)),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 99,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || substr(md5(random()::text), 1, 10)),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    previous_price NUMERIC(10, 2),
    sku TEXT,
    category_id TEXT,
    product_type TEXT DEFAULT 'product',
    gift_type TEXT DEFAULT 'none',
    stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 2,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT true,
    available_for_rental BOOLEAN DEFAULT false,
    rental_price NUMERIC(10, 2),
    rental_deposit NUMERIC(10, 2),
    rental_conditions TEXT,
    size TEXT,
    color TEXT,
    tags TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Imágenes de Productos (Hasta 4 fotos por producto)
CREATE TABLE IF NOT EXISTS public.product_images (
    id TEXT PRIMARY KEY DEFAULT ('img-' || substr(md5(random()::text), 1, 10)),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Órdenes / Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord-' || substr(md5(random()::text), 1, 10)),
    order_number TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT,
    delivery_date TEXT,
    delivery_type TEXT DEFAULT 'delivery',
    payment_method TEXT DEFAULT 'Yappy',
    payment_status TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'pending',
    subtotal NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    receipt_url TEXT,
    receipt_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Ítems de Orden
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT ('item-' || substr(md5(random()::text), 1, 10)),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    is_rental BOOLEAN DEFAULT false,
    rental_start_date TEXT,
    rental_end_date TEXT,
    selected_variant TEXT,
    dedication_message TEXT,
    customization JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Alquileres de Mobiliario
CREATE TABLE IF NOT EXISTS public.rentals (
    id TEXT PRIMARY KEY DEFAULT ('rent-' || substr(md5(random()::text), 1, 10)),
    product_id TEXT,
    product_name TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    deposit_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_price NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'reserved',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla de Ajustes de Tienda
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'current_settings',
    store_name TEXT DEFAULT 'Ballonsdei',
    logo_url TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_image TEXT,
    hero_badge_image TEXT,
    hero_badge_title TEXT,
    instagram_url TEXT,
    whatsapp_number TEXT DEFAULT '+50764324750',
    phone TEXT,
    email TEXT,
    address TEXT,
    google_maps_url TEXT,
    schedule_hours TEXT,
    currency TEXT DEFAULT 'USD',
    delivery_fee NUMERIC(10, 2) DEFAULT 5.00,
    footer_photo_1 TEXT,
    footer_photo_2 TEXT,
    footer_photo_3 TEXT,
    footer_photo_4 TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabla de Perfiles de Administrador y Usuarios
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    active BOOLEAN DEFAULT true,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Desactivar Row Level Security (RLS) en todas las tablas
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rentals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos globales en el esquema public a los roles de Supabase (resuelve error 42501)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Permisos explícitos específicos para cada tabla
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.product_images TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.order_items TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.rentals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.settings TO anon, authenticated, service_role;

-- Crear Bucket de Storage para Imágenes de Productos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política de subida pública en el storage
DROP POLICY IF EXISTS "Public Access product-images" ON storage.objects;
CREATE POLICY "Public Access product-images" ON storage.objects
FOR ALL USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');
`;
}

/**
 * Returns a quick SQL snippet to fix error 42501 (permission denied for table profiles)
 */
export function getSupabasePermissionFixScript(): string {
  return `-- RESOLVER ERROR 42501: PERMISSION DENIED FOR TABLE PROFILES
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Crear profiles si no existe y desactivar RLS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    active BOOLEAN DEFAULT true,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.product_images TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
`;
}
