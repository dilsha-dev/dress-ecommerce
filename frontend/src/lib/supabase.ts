// Centralized configuration and types replacing Supabase with Django REST API

export interface Dress {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  is_deleted?: boolean;
  created_at?: string;
}

export type CartItem = {
  dress: Dress;
  quantity: number;
  size?: string;
};

export const CATEGORIES = ['All', 'Evening', 'Casual', 'Cocktail', 'Maxi'];
export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dress-ecommerce-5uv6.onrender.com';

// Mock/compatibility client wrapper to prevent breaking imports across your components
export const supabase = {
  from: (table: string) => {
    if (table !== 'dresses') {
      throw new Error(`Unsupported table: ${table}`);
    }
    return {
      select: async (_query?: string) => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/dresses/`);
          if (!res.ok) throw new Error('Failed to fetch dresses');
          const data = await res.json();
          return { data, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },
      insert: async (payload: any) => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/api/dresses/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(JSON.stringify(data));
          return { data, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },
      update: (payload: any) => ({
        eq: async (field: string, value: any) => {
          try {
            const token = localStorage.getItem('token');
            // If it's a restore action or update action
            const url = `${API_BASE_URL}/api/dresses/${value}/`;
            const res = await fetch(url, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(data));
            return { data, error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
      }),
      delete: () => ({
        eq: async (field: string, value: any) => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/dresses/${value}/`, {
              method: 'DELETE',
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            });
            if (!res.ok) throw new Error('Failed to delete dress');
            return { data: null, error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
      }),
    };
  },
};