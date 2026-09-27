import { Container, Row, Col, Form, InputGroup, Button, Badge, Alert } from 'react-bootstrap';
import { Funnel, X, Grid3x3 } from 'react-bootstrap-icons';
import { useState, useMemo } from 'react';
import { Dress, CATEGORIES, ALL_SIZES } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

interface ProductCatalogProps {
  dresses: Dress[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: string;
  onCategorySelect: (cat: string) => void;
  onSelectDress: (dress: Dress) => void;
}

const PRICE_RANGES = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: Infinity },
];

const COLORS = ['Black', 'White', 'Red', 'Blue', 'Navy', 'Green', 'Pink', 'Yellow', 'Cream', 'Ivory', 'Champagne', 'Burgundy', 'Olive', 'Lavender'];

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name';

export default function ProductCatalog({
  dresses,
  loading,
  error,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategorySelect,
  onSelectDress,
}: ProductCatalogProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(PRICE_RANGES[0]);
    onCategorySelect('All');
    onSearchChange('');
  };

  const filteredDresses = useMemo(() => {
    let result = [...dresses];

    if (activeCategory !== 'All') {
      result = result.filter((d) => d.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q),
      );
    }

    if (selectedSizes.length > 0) {
      result = result.filter((d) => d.sizes.some((s) => selectedSizes.includes(s)));
    }

    if (selectedColors.length > 0) {
      result = result.filter((d) => d.colors.some((c) => selectedColors.includes(c)));
    }

    result = result.filter((d) => d.price >= priceRange.min && d.price < priceRange.max);

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [dresses, activeCategory, searchQuery, selectedSizes, selectedColors, priceRange, sortBy]);

  const activeFilterCount =
    selectedSizes.length +
    selectedColors.length +
    (activeCategory !== 'All' ? 1 : 0) +
    (priceRange.label !== 'All' ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const FilterPanel = (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          Filters
        </h6>
        {activeFilterCount > 0 && (
          <Button
            variant="link"
            size="sm"
            className="text-decoration-none p-0"
            style={{ color: '#c2185b', fontSize: '0.8rem' }}
            onClick={clearFilters}
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="mb-4">
        <div className="text-uppercase mb-2 fw-semibold" style={{ fontSize: '0.75rem', color: '#888' }}>
          Category
        </div>
        <div className="d-flex flex-wrap gap-2">
          <FilterChip label="All" active={activeCategory === 'All'} onClick={() => onCategorySelect('All')} />
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => onCategorySelect(cat)}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-uppercase mb-2 fw-semibold" style={{ fontSize: '0.75rem', color: '#888' }}>
          Size
        </div>
        <div className="d-flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <Button
              key={size}
              size="sm"
              variant={selectedSizes.includes(size) ? 'dark' : 'outline-secondary'}
              onClick={() => toggleSize(size)}
              style={{
                borderRadius: 0,
                minWidth: 42,
                fontSize: '0.8rem',
                backgroundColor: selectedSizes.includes(size) ? '#1a1a1a' : undefined,
                borderColor: selectedSizes.includes(size) ? '#1a1a1a' : '#ddd',
              }}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-uppercase mb-2 fw-semibold" style={{ fontSize: '0.75rem', color: '#888' }}>
          Price Range
        </div>
        <div className="d-flex flex-column gap-2">
          {PRICE_RANGES.map((range) => (
            <Form.Check
              key={range.label}
              type="radio"
              id={`price-${range.label}`}
              label={range.label}
              checked={priceRange.label === range.label}
              onChange={() => setPriceRange(range)}
              style={{ fontSize: '0.85rem', cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-uppercase mb-2 fw-semibold" style={{ fontSize: '0.75rem', color: '#888' }}>
          Color
        </div>
        <div className="d-flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <FilterChip
              key={color}
              label={color}
              active={selectedColors.includes(color)}
              onClick={() => toggleColor(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Container className="py-4">
      {/* Mobile search + filter toggle */}
      <Row className="d-lg-none mb-3 g-2">
        <Col xs={8}>
          <Form.Control
            placeholder="Search dresses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ borderRadius: 0 }}
          />
        </Col>
        <Col xs={4}>
          <Button
            variant="dark"
            className="w-100 d-flex align-items-center justify-content-center gap-1"
            style={{ borderRadius: 0, backgroundColor: '#1a1a1a' }}
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          >
            <Funnel size={16} />
            Filters
            {activeFilterCount > 0 && (
              <Badge pill style={{ backgroundColor: '#c2185b', fontSize: '0.65rem' }}>
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </Col>
      </Row>

      {showFiltersMobile && (
        <div className="d-lg-none mb-4 p-3 border rounded" style={{ borderRadius: 0 }}>
          {FilterPanel}
        </div>
      )}

      <Row>
        {/* Desktop sidebar filters */}
        <Col lg={3} className="d-none d-lg-block">
          <div className="sticky-top" style={{ top: 100 }}>
            <div className="p-4 border" style={{ borderRadius: 0, borderColor: '#eee' }}>
              {FilterPanel}
            </div>
          </div>
        </Col>

        <Col lg={9}>
          {/* Toolbar */}
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <Grid3x3 size={18} className="text-muted" />
              <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                {filteredDresses.length} {filteredDresses.length === 1 ? 'item' : 'items'}
              </span>
              {activeCategory !== 'All' && (
                <Badge style={{ backgroundColor: '#f5f5f5', color: '#c2185b', borderRadius: 0, fontWeight: 500 }}>
                  {activeCategory}
                </Badge>
              )}
            </div>
            <InputGroup style={{ maxWidth: 220 }}>
              <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: 'none', fontSize: '0.8rem' }}>
                Sort
              </InputGroup.Text>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{ border: 'none', backgroundColor: '#f8f9fa', fontSize: '0.85rem' }}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </Form.Select>
            </InputGroup>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#c2185b' }} />
              <p className="mt-3 text-muted">Loading dresses...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger" style={{ borderRadius: 0 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && filteredDresses.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted mb-2">No dresses match your filters.</p>
              <Button variant="link" style={{ color: '#c2185b' }} onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}

          {!loading && !error && filteredDresses.length > 0 && (
            <Row className="g-3">
              {filteredDresses.map((dress) => (
                <Col key={dress.id} xs={6} md={4} xl={3}>
                  <ProductCard dress={dress} onSelect={onSelectDress} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size="sm"
      variant={active ? 'dark' : 'outline-secondary'}
      onClick={onClick}
      style={{
        borderRadius: 20,
        fontSize: '0.75rem',
        padding: '0.25rem 0.75rem',
        backgroundColor: active ? '#1a1a1a' : undefined,
        borderColor: active ? '#1a1a1a' : '#ddd',
      }}
    >
      {active && <X size={12} className="me-1" />}
      {label}
    </Button>
  );
}
