// Upgraded Django REST API wrapper preserving Supabase method chaining (select, order, insert, update, delete)

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

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dress-ecommerce-5uv6.onrender.com';

export const supabase = {
  from: (table: string) => {
    if (table !== 'dresses') {
      throw new Error(`Unsupported table: ${table}`);
    }
    
    // Helper to fetch data
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dresses/`);
        if (!res.ok) throw new Error('Failed to fetch dresses');
        const data = await res.json();
        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    };

    return {
      select: (_query?: string) => {
        let chainablePromise: any = fetchData().then(result => result);
        
        // Add chainable .order() method to fix "order is not a function"
        chainablePromise.order = function(column: string, options?: { ascending?: boolean }) {
          chainablePromise = chainablePromise.then((res: any) => {
            if (!res.data) return res;
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
          
          // Clean up payload fields to match Django backend expectations
          const formattedPayload = { ...payload };
          if (formattedPayload.image && !formattedPayload.image_url) {
            formattedPayload.image_url = formattedPayload.image;
          }
          // Prevent sending "All" as a valid category option on creation
          if (formattedPayload.category === 'All' || !formattedPayload.category) {
            formattedPayload.category = 'Casual'; 
          }

          const res = await fetch(`${API_BASE_URL}/api/dresses/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(formattedPayload),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(JSON.stringify(data));
          return { data, error: null };
        } catch (err: any) {
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

            const res = await fetch(`${API_BASE_URL}/api/dresses/${value}/`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(formattedPayload),
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
        eq: async (_field: string, value: any) => {
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