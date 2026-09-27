// Upgraded Django REST API wrapper with safe error parsing and JSON validation

export interface Dress {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  image_url?: string;
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

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://dress-ecommerce-5uv6.onrender.com').replace(/\/$/, '');

export const supabase = {
  from: (table: string) => {
    if (table !== 'dresses') {
      throw new Error(`Unsupported table: ${table}`);
    }
    
    const fetchData = async () => {
      try {
        const url = `${API_BASE_URL}/api/dresses/`;
        const res = await fetch(url);
        const text = await res.text();
        
        // Check if response is HTML instead of JSON
        if (text.trim().startsWith('<') || !res.ok) {
          console.error(`API Error [${res.status}] from ${url}:`, text);
          throw new Error(`Server returned HTML/Error (${res.status}). Check backend routes.`);
        }
        
        const data = JSON.parse(text);
        return { data, error: null };
      } catch (err: any) {
        console.error("Fetch dresses error:", err);
        return { data: [], error: err };
      }
    };

    return {
      select: (_query?: string) => {
        let chainablePromise: any = fetchData().then(result => result);
        
        chainablePromise.order = function(column: string, options?: { ascending?: boolean }) {
          chainablePromise = chainablePromise.then((res: any) => {
            if (!res.data || !Array.isArray(res.data)) return res;
            const sortedData = [...res.data].sort((a, b) => {
              let valA = a[column];
              let valB = b[column];
              if (valA < valB) return options?.ascending ? -1 : 1;
              if (valA > valB) return options?.ascending ? 1 : -1;
              return 0;
            });
            return { ...res, data: sortedData };
          });
          chainablePromise.order = this.order;
          return chainablePromise;
        };

        return chainablePromise;
      },
      
      insert: async (payload: any) => {
        try {
          const token = localStorage.getItem('token');
          const formattedPayload = {
            name: payload.name || 'Untitled Dress',
            description: payload.description || 'A stunning piece curated for your collection.',
            price: !isNaN(parseFloat(payload.price)) ? parseFloat(payload.price) : 49.99,
            stock: !isNaN(parseInt(payload.stock, 10)) ? parseInt(payload.stock, 10) : 10,
            category: payload.category && payload.category !== 'All' ? payload.category : 'Casual',
            image_url: payload.image_url || payload.image || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
            image: payload.image || payload.image_url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
          };

          const url = `${API_BASE_URL}/api/dresses/`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(formattedPayload),
          });
          
          const text = await res.text();
          if (text.trim().startsWith('<') || !res.ok) {
            throw new Error(`Server error [${res.status}]: ${text.slice(0, 150)}`);
          }
          
          const data = JSON.parse(text);
          return { data, error: null };
        } catch (err: any) {
          console.error("Insert dress error:", err);
          return { data: null, error: err };
        }
      },

      update: (payload: any) => ({
        eq: async (_field: string, value: any) => {
          try {
            const token = localStorage.getItem('token');
            const formattedPayload = { ...payload };
            if (formattedPayload.image && !formattedPayload.image_url) {
              formattedPayload.image_url = formattedPayload.image;
            }

            const url = `${API_BASE_URL}/api/dresses/${value}/`;
            const res = await fetch(url, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(formattedPayload),
            });
            const text = await res.text();
            if (text.trim().startsWith('<') || !res.ok) {
              throw new Error(`Server error [${res.status}]`);
            }
            const data = JSON.parse(text);
            return { data, error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
      }),

      delete: () => ({
        eq: async (_field: string, value: any) => {
          try {
            const token = localStorage.getItem('token');
            const url = `${API_BASE_URL}/api/dresses/${value}/`;
            const res = await fetch(url, {
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