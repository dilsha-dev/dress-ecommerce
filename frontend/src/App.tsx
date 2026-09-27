import { useState, useEffect, useCallback } from 'react';
import { supabase, Dress } from '@/lib/supabase';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider, useToast } from '@/context/ToastContext';
import AppNavbar from '@/components/AppNavbar';
import ProductCatalog from '@/components/ProductCatalog';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import CartDrawer from '@/components/CartDrawer';
import AdminDashboard from '@/components/AdminDashboard';
import AuthModal from '@/components/AuthModal';

function AppContent() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminDenied, setAdminDenied] = useState(false);

  const fetchDresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('dresses')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setDresses((data || []) as Dress[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDresses();
  }, [fetchDresses]);

  const handleSelectDress = (dress: Dress) => {
    setSelectedDress(dress);
    setShowDetails(true);
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleNavigate = (next: 'shop' | 'admin') => {
    if (next === 'admin') {
      if (!user) {
        setAdminDenied(true);
        setView('shop');
        openAuth('login');
        return;
      }
      if (!isAdmin) {
        setAdminDenied(true);
        setView('shop');
        showToast('Access Denied: Admin privileges required.', 'danger');
        return;
      }
      setActiveCategory('All');
      setSearchQuery('');
    }
    setAdminDenied(false);
    setView(next);
  };

  // If user logs out while viewing admin, kick them back to shop
  useEffect(() => {
    if (view === 'admin' && !authLoading && (!user || !isAdmin)) {
      setView('shop');
    }
  }, [view, user, isAdmin, authLoading]);

  const shopDresses = dresses.filter((d) => !d.is_deleted);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <AppNavbar
        view={view}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        onOpenAuth={openAuth}
      />

      {view === 'shop' ? (
        <>
          {/* Hero banner */}
          <div
            className="d-flex align-items-center justify-content-center text-center"
            style={{
              background: 'linear-gradient(135deg, #faf5f5 0%, #f5e9ec 50%, #fce4ec 100%)',
              padding: '4rem 1rem',
              marginBottom: '1rem',
            }}
          >
            <div className="container">
              <h1
                className="fw-bold mb-2"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#1a1a1a', letterSpacing: '-0.02em' }}
              >
                Effortless Elegance, Delivered
              </h1>
              <p
                className="mb-0"
                style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#666', maxWidth: 540, margin: '0 auto' }}
              >
                Discover our curated collection of dresses for every occasion
              </p>
            </div>
          </div>

          {adminDenied && !user && (
            <div
              className="container mt-3"
              style={{
                backgroundColor: '#fce4ec',
                color: '#c2185b',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                borderRadius: 0,
              }}
            >
              Access Denied: Admin privileges required. Please sign in with an admin account.
            </div>
          )}

          <ProductCatalog
            dresses={shopDresses}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
            onSelectDress={handleSelectDress}
          />

          {/* Footer */}
          <footer
            className="mt-5 py-4 border-top"
            style={{ backgroundColor: '#1a1a1a', color: '#aaa' }}
          >
            <div className="container text-center">
              <p className="fw-bold mb-1" style={{ color: '#c2185b', letterSpacing: '0.05em' }}>
                ÉLÉGANCE
              </p>
              <p className="mb-0" style={{ fontSize: '0.8rem' }}>
                © 2026 Élégance. All rights reserved.
              </p>
            </div>
          </footer>
        </>
      ) : (
        <AdminDashboard dresses={dresses} loading={loading} onRefresh={fetchDresses} />
      )}

      <ProductDetailsModal
        dress={selectedDress}
        show={showDetails}
        onClose={() => setShowDetails(false)}
      />
      <CartDrawer />
      <AuthModal
        show={showAuth}
        onClose={() => setShowAuth(false)}
        initialMode={authMode}
      />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
