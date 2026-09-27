import { Offcanvas, Button, Row, Col, Alert, Form } from 'react-bootstrap';
import { Trash, X, Cart3, CreditCard } from 'react-bootstrap-icons';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalCount, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'success'>('cart');

  const handleCheckout = () => {
    clearCart();
    setCheckoutStep('success');
  };

  const handleClose = () => {
    closeCart();
    setTimeout(() => setCheckoutStep('cart'), 300);
  };

  return (
    <Offcanvas
      show={isOpen}
      onHide={handleClose}
      placement="end"
      style={{ width: 440, maxWidth: '100vw' }}
    >
      <Offcanvas.Header className="border-bottom pb-3">
        <Offcanvas.Title className="d-flex align-items-center gap-2 fw-bold" style={{ fontSize: '1.1rem' }}>
          <Cart3 size={22} style={{ color: '#c2185b' }} />
          {checkoutStep === 'cart' ? `Shopping Cart (${totalCount})` : 'Order Confirmed'}
        </Offcanvas.Title>
        <Button variant="link" className="p-0 text-dark" onClick={handleClose}>
          <X size={22} />
        </Button>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column p-0">
        {checkoutStep === 'success' ? (
          <div className="text-center p-4 flex-grow-1 d-flex flex-column justify-content-center">
            <div
              className="d-inline-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: 70, height: 70, borderRadius: '50%', backgroundColor: '#e8f5e9' }}
            >
              <CreditCard size={32} style={{ color: '#2e7d32' }} />
            </div>
            <h5 className="fw-bold mb-2">Thank you for your order!</h5>
            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
              Your order has been placed successfully. A confirmation email will be sent shortly.
            </p>
            <Button
              onClick={handleClose}
              className="border-0"
              style={{ backgroundColor: '#c2185b', borderRadius: 0 }}
            >
              Continue Shopping
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-4 flex-grow-1 d-flex flex-column justify-content-center">
            <Cart3 size={48} className="text-muted mx-auto mb-3" />
            <p className="text-muted mb-3">Your cart is empty</p>
            <Button
              onClick={handleClose}
              className="border-0 mx-auto"
              style={{ backgroundColor: '#c2185b', borderRadius: 0, maxWidth: 200 }}
            >
              Browse Dresses
            </Button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-grow-1 overflow-auto px-3">
              {items.map((item, idx) => (
                <div key={idx} className="d-flex gap-3 py-3 border-bottom">
                  <div
                    style={{
                      width: 80,
                      height: 100,
                      overflow: 'hidden',
                      backgroundColor: '#f8f8f8',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.dress.image_url || ''}
                      alt={item.dress.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="flex-grow-1 d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold" style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>
                          {item.dress.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Size: {item.size} · Color: {item.color}
                        </div>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 text-muted"
                        onClick={() => removeItem(idx)}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>

                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center border" style={{ borderRadius: 0 }}>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          style={{ border: 'none', borderRadius: 0, padding: '0.2rem 0.6rem' }}
                        >
                          -
                        </Button>
                        <span className="px-2" style={{ fontSize: '0.85rem', minWidth: 30, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          style={{ border: 'none', borderRadius: 0, padding: '0.2rem 0.6rem' }}
                        >
                          +
                        </Button>
                      </div>
                      <span className="fw-bold" style={{ color: '#c2185b', fontSize: '0.95rem' }}>
                        ${(item.dress.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary + Checkout */}
            <div className="border-top p-3" style={{ backgroundColor: '#fafafa' }}>
              <div className="mb-2 d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
                <span className="text-muted">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="mb-2 d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
                <span className="text-muted">Shipping</span>
                <span className="text-success fw-semibold">Free</span>
              </div>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span className="fw-bold">Total</span>
                <span className="fw-bold" style={{ fontSize: '1.3rem', color: '#c2185b' }}>
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Simple checkout form */}
              <Form className="mb-2">
                <Form.Control
                  placeholder="Email for order updates"
                  className="mb-2"
                  style={{ borderRadius: 0, fontSize: '0.85rem' }}
                />
                <Form.Control
                  placeholder="Shipping address"
                  className="mb-2"
                  style={{ borderRadius: 0, fontSize: '0.85rem' }}
                />
              </Form>

              <Button
                onClick={handleCheckout}
                className="w-100 border-0 d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: '#c2185b',
                  borderRadius: 0,
                  padding: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                }}
              >
                <CreditCard size={18} />
                Checkout · ${totalPrice.toFixed(2)}
              </Button>
              <Button
                variant="link"
                className="w-100 text-muted text-decoration-none mt-1"
                style={{ fontSize: '0.8rem' }}
                onClick={handleClose}
              >
                Continue shopping
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
