import { Navbar, Nav, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { Search, Cart3, Person, BoxArrowRight, ShieldLock } from 'react-bootstrap-icons';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/lib/supabase';

interface AppNavbarProps {
  view: 'shop' | 'admin';
  onNavigate: (view: 'shop' | 'admin') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: string;
  onCategorySelect: (cat: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export default function AppNavbar({
  view,
  onNavigate,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategorySelect,
  onOpenAuth,
}: AppNavbarProps) {
  const { totalCount, openCart } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();

  return (
    <Navbar
      expand="lg"
      sticky="top"
      className="shadow-sm py-3"
      style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #eee' }}
    >
      <div className="container">
        <Navbar.Brand
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('shop');
          }}
          className="fw-bold fs-3 d-flex align-items-center gap-2"
          style={{ color: '#1a1a1a', letterSpacing: '0.05em' }}
        >
          <span style={{ color: '#c2185b', fontWeight: 700 }}>ÉLÉGANCE</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          {view === 'shop' && (
            <>
              <Form className="mx-auto" style={{ maxWidth: 420, width: '100%' }}>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: 'none' }}>
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search dresses..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{ backgroundColor: '#f8f9fa', border: 'none' }}
                  />
                </InputGroup>
              </Form>

              <Nav className="ms-auto align-items-lg-center">
                {CATEGORIES.map((cat) => (
                  <Nav.Link
                    key={cat}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onCategorySelect(activeCategory === cat ? 'All' : cat);
                    }}
                    className="px-3 text-uppercase fw-semibold"
                    style={{
                      fontSize: '0.82rem',
                      color: activeCategory === cat ? '#c2185b' : '#444',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {cat}
                  </Nav.Link>
                ))}

                <Button
                  variant="link"
                  className="position-relative ms-2 p-2"
                  onClick={openCart}
                  style={{ color: '#1a1a1a' }}
                >
                  <Cart3 size={22} />
                  {totalCount > 0 && (
                    <Badge
                      pill
                      bg="danger"
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.65rem', backgroundColor: '#c2185b' }}
                    >
                      {totalCount}
                    </Badge>
                  )}
                </Button>
              </Nav>
            </>
          )}

          {view === 'admin' && (
            <Nav className="ms-auto align-items-lg-center">
              <span className="text-uppercase fw-bold me-3 d-flex align-items-center gap-1" style={{ color: '#c2185b', fontSize: '0.85rem' }}>
                <ShieldLock size={16} />
                Admin Dashboard
              </span>
            </Nav>
          )}

          {/* Auth-aware buttons */}
          {user ? (
            <div className="d-flex align-items-center gap-2 ms-3">
              <span className="d-none d-sm-inline text-muted" style={{ fontSize: '0.82rem' }}>
                Hi, {profile?.full_name || 'User'}
                {isAdmin && (
                  <Badge className="ms-1" style={{ backgroundColor: '#c2185b', borderRadius: 0, fontSize: '0.65rem' }}>
                    Admin
                  </Badge>
                )}
              </span>
              {isAdmin && view !== 'admin' && (
                <Button
                  variant="outline-dark"
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={() => onNavigate('admin')}
                  style={{ borderRadius: 0, borderWidth: 1.5 }}
                >
                  <ShieldLock size={16} />
                  Admin
                </Button>
              )}
              {view === 'admin' && (
                <Button
                  variant="outline-dark"
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={() => onNavigate('shop')}
                  style={{ borderRadius: 0, borderWidth: 1.5 }}
                >
                  Store
                </Button>
              )}
              <Button
                variant="link"
                size="sm"
                className="d-flex align-items-center gap-1 text-decoration-none"
                onClick={signOut}
                style={{ color: '#666' }}
              >
                <BoxArrowRight size={16} />
                <span className="d-none d-sm-inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2 ms-3">
              <Button
                variant="link"
                size="sm"
                className="text-decoration-none"
                onClick={() => onOpenAuth('login')}
                style={{ color: '#1a1a1a', fontWeight: 600 }}
              >
                Login
              </Button>
              <Button
                size="sm"
                className="border-0 d-flex align-items-center gap-1"
                onClick={() => onOpenAuth('register')}
                style={{ backgroundColor: '#c2185b', borderRadius: 0, fontWeight: 600 }}
              >
                <Person size={16} />
                Sign Up
              </Button>
            </div>
          )}
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}
