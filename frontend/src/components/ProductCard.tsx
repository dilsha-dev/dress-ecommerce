import { Card, Button, Badge } from 'react-bootstrap';
import { Cart2 } from 'react-bootstrap-icons';
import { Dress } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  dress: Dress;
  onSelect: (dress: Dress) => void;
}

export default function ProductCard({ dress, onSelect }: ProductCardProps) {
  const { addItem } = useCart();

  const outOfStock = dress.stock <= 0;
  const lowStock = dress.stock > 0 && dress.stock <= 10;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addItem(dress, dress.sizes[0] || 'M', dress.colors[0] || 'Default', 1);
  };

  return (
    <Card
      className="border-0 h-100 product-card shadow-sm"
      onClick={() => onSelect(dress)}
      style={{ cursor: 'pointer', borderRadius: 0, overflow: 'hidden' }}
    >
      <div className="product-image-wrapper" style={{ overflow: 'hidden', aspectRatio: '3/4' }}>
        <Card.Img
          variant="top"
          src={dress.image_url || 'https://via.placeholder.com/300x400'}
          style={{
            objectFit: 'cover',
            height: '100%',
            transition: 'transform 0.5s ease',
          }}
          className="product-img"
        />
        {outOfStock && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
          >
            <span className="text-uppercase fw-bold text-secondary">Out of Stock</span>
          </div>
        )}
        {lowStock && (
          <Badge
            className="position-absolute top-0 end-0 m-2"
            style={{ backgroundColor: '#e9ecef', color: '#666', borderRadius: 0, fontSize: '0.7rem' }}
          >
            Only {dress.stock} left
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column p-3">
        <div className="mb-1 text-uppercase" style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.05em' }}>
          {dress.category}
        </div>
        <Card.Title
          className="mb-1"
          style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}
        >
          {dress.name}
        </Card.Title>
        <div className="mb-2" style={{ fontSize: '0.75rem', color: '#888' }}>
          {dress.colors.join(', ')}
        </div>

        <div className="mt-auto d-flex align-items-center justify-content-between">
          <span className="fw-bold" style={{ fontSize: '1.1rem', color: '#c2185b' }}>
            ${dress.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={handleQuickAdd}
            disabled={outOfStock}
            className="d-flex align-items-center gap-1 border-0"
            style={{
              backgroundColor: outOfStock ? '#ccc' : '#1a1a1a',
              borderRadius: 0,
              fontSize: '0.75rem',
              padding: '0.4rem 0.8rem',
            }}
          >
            <Cart2 size={14} />
            Add
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
