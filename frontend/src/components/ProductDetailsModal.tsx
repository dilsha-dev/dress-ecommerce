import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Cart2, CheckCircle } from 'react-bootstrap-icons';
import { Dress } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

interface ProductDetailsModalProps {
  dress: Dress | null;
  show: boolean;
  onClose: () => void;
}

const COLOR_SWATCHES: Record<string, string> = {
  Black: '#1a1a1a',
  White: '#ffffff',
  Red: '#d32f2f',
  Blue: '#1976d2',
  Navy: '#1a237e',
  Green: '#388e3c',
  Pink: '#e91e63',
  Yellow: '#fbc02d',
  Cream: '#fff8e1',
  Ivory: '#fffff0',
  Champagne: '#f7e7c4',
  Burgundy: '#800020',
  Olive: '#808000',
  Lavender: '#e6e6fa',
};

export default function ProductDetailsModal({ dress, show, onClose }: ProductDetailsModalProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (dress) {
      setSelectedSize(dress.sizes[0] || '');
      setSelectedColor(dress.colors[0] || '');
      setSelectedImage(dress.image_url || '');
      setAdded(false);
    }
  }, [dress]);

  if (!dress) return null;

  const galleryImages = [dress.image_url, ...dress.gallery].filter(Boolean) as string[];
  const uniqueGallery = [...new Set(galleryImages)];

  const outOfStock = dress.stock <= 0;
  const lowStock = dress.stock > 0 && dress.stock <= 10;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor || outOfStock) return;
    addItem(dress, selectedSize, selectedColor, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      contentClassName="border-0"
      style={{ borderRadius: 0 }}
    >
      <Modal.Header closeButton className="border-0 pb-0" />
      <Modal.Body className="pt-0">
        <Row>
          {/* Image Gallery */}
          <Col md={6}>
            <div
              style={{
                overflow: 'hidden',
                aspectRatio: '3/4',
                backgroundColor: '#f8f8f8',
              }}
            >
              <img
                src={selectedImage || dress.image_url || ''}
                alt={dress.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {uniqueGallery.length > 1 && (
              <div className="d-flex gap-2 mt-2">
                {uniqueGallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: 60,
                      height: 80,
                      border: selectedImage === img ? '2px solid #c2185b' : '2px solid transparent',
                      borderRadius: 0,
                      padding: 0,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: 'none',
                    }}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </Col>

          {/* Product Info */}
          <Col md={6} className="ps-md-4">
            <div className="text-uppercase mb-2" style={{ fontSize: '0.75rem', color: '#999', letterSpacing: '0.08em' }}>
              {dress.category}
            </div>
            <h3 className="fw-bold mb-2" style={{ color: '#1a1a1a' }}>
              {dress.name}
            </h3>
            <p className="fw-bold mb-3" style={{ fontSize: '1.6rem', color: '#c2185b' }}>
              ${dress.price.toFixed(2)}
            </p>

            {dress.description && (
              <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                {dress.description}
              </p>
            )}

            {/* Stock indicator */}
            <div className="mb-3">
              {outOfStock ? (
                <Badge style={{ backgroundColor: '#fce4ec', color: '#c2185b', borderRadius: 0, padding: '0.4rem 0.8rem' }}>
                  Out of Stock
                </Badge>
              ) : lowStock ? (
                <Badge style={{ backgroundColor: '#fff3e0', color: '#e65100', borderRadius: 0, padding: '0.4rem 0.8rem' }}>
                  Only {dress.stock} left in stock
                </Badge>
              ) : (
                <Badge style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: 0, padding: '0.4rem 0.8rem' }}>
                  In Stock ({dress.stock} available)
                </Badge>
              )}
            </div>

            {/* Size selector */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Size
                </span>
                {selectedSize && (
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Selected: {selectedSize}
                  </span>
                )}
              </div>
              <div className="d-flex flex-wrap gap-2">
                {dress.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'dark' : 'outline-dark'}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      borderRadius: 0,
                      minWidth: 50,
                      fontSize: '0.85rem',
                      backgroundColor: selectedSize === size ? '#1a1a1a' : undefined,
                      borderColor: '#ccc',
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            {dress.colors.length > 0 && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    Color
                  </span>
                  {selectedColor && (
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Selected: {selectedColor}
                    </span>
                  )}
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {dress.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        border: selectedColor === color ? '2px solid #c2185b' : '2px solid #ddd',
                        backgroundColor: COLOR_SWATCHES[color] || '#ccc',
                        cursor: 'pointer',
                        position: 'relative',
                        outline: selectedColor === color ? '1px solid #c2185b' : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart button */}
            <Button
              onClick={handleAddToCart}
              disabled={outOfStock || !selectedSize}
              className="w-100 d-flex align-items-center justify-content-center gap-2 border-0"
              style={{
                backgroundColor: added ? '#2e7d32' : '#c2185b',
                borderRadius: 0,
                padding: '0.85rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {added ? (
                <>
                  <CheckCircle size={18} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <Cart2 size={18} />
                  {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </Button>
            {!selectedSize && !outOfStock && (
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                Please select a size
              </p>
            )}
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}
