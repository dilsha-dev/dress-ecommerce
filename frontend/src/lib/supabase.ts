import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Dress {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  image_url: string | null;
  gallery: string[];
  is_deleted: boolean;
  created_at: string;
}

export interface CartItem {
  dress: Dress;
  size: string;
  color: string;
  quantity: number;
}

export const CATEGORIES = ['Evening', 'Casual', 'Summer', 'Wedding', 'Cocktail'];
export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
