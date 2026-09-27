import { Container, Table, Button, Form, InputGroup, Modal, Badge, Row, Col } from 'react-bootstrap';
import { useState, useMemo, useEffect } from 'react';
import { Search, Trash, PencilSquare, PlusCircle, Eye, EyeSlash } from 'react-bootstrap-icons';
import { Dress, CATEGORIES, ALL_SIZES, supabase } from '@/lib/supabase';

interface AdminDashboardProps {
  dresses: Dress[];
  loading: boolean;
  onRefresh: () => void;
}

interface DressFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  sizes: string[];
  colors: string[];
  stock: string;
  image_url: string;
}

const EMPTY_FORM: DressFormData = {
  name: '',
  description: '',
  price: '',
  category: CATEGORIES[0],
  sizes: [],
  colors: [],
  stock: '',
  image_url: '',
};

export default function AdminDashboard({ dresses, loading, onRefresh }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDress, setEditingDress] = useState<Dress | null>(null);
  const [formData, setFormData] = useState<DressFormData>(EMPTY_FORM);
  const [colorInput, setColorInput] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Dress | null>(null);
  const [hardDelete, setHardDelete] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredDresses = useMemo(() => {
    let result = showDeleted ? dresses : dresses.filter((d) => !d.is_deleted);
    if (categoryFilter !== 'All') {
      result = result.filter((d) => d.category === categoryFilter);
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
    return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [dresses, searchQuery, categoryFilter, showDeleted]);

  const openCreateModal = () => {
    setEditingDress(null);
    setFormData(EMPTY_FORM);
    setColorInput('');
    setError(null);
    setShowFormModal(true);
  };

  const openEditModal = (dress: Dress) => {
    setEditingDress(dress);
    setFormData({
      name: dress.name,
      description: dress.description || '',
      price: dress.price.toString(),
      category: dress.category,
      sizes: dress.sizes,
      colors: dress.colors,
      stock: dress.stock.toString(),
      image_url: dress.image_url || '',
    });
    setColorInput('');
    setError(null);
    setShowFormModal(true);
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed && !formData.colors.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, trimmed] }));
      setColorInput('');
    }
  };

  const removeColor = (color: string) => {
    setFormData((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== color) }));
  };

  const handleSave = async () => {
    setError(null);

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return;
    }
    if (formData.sizes.length === 0) {
      setError('At least one size is required');
      return;
    }

    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: parseFloat(formData.price),
      category: formData.category,
      sizes: formData.sizes,
      colors: formData.colors.length > 0 ? formData.colors : ['Default'],
      stock: parseInt(formData.stock) || 0,
      image_url: formData.image_url.trim() || null,
    };

    try {
      if (editingDress) {
        const { error: updateError } = await supabase
          .from('dresses')
          .update(payload)
          .eq('id', editingDress.id);
        if (updateError) throw updateError;
        setSuccess(`"${formData.name}" updated successfully`);
      } else {
        const { error: insertError } = await supabase.from('dresses').insert(payload);
        if (insertError) throw insertError;
        setSuccess(`"${formData.name}" added successfully`);
      }
      setShowFormModal(false);
      onRefresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save dress');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      if (hardDelete) {
        const { error: deleteError } = await supabase.from('dresses').delete().eq('id', deleteTarget.id);
        if (deleteError) throw deleteError;
        setSuccess(`"${deleteTarget.name}" permanently deleted`);
      } else {
        const { error: updateError } = await supabase
          .from('dresses')
          .update({ is_deleted: true })
          .eq('id', deleteTarget.id);
        if (updateError) throw updateError;
        setSuccess(`"${deleteTarget.name}" moved to trash (soft deleted)`);
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setHardDelete(false);
      onRefresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dress');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (dress: Dress) => {
    try {
      const { error } = await supabase.from('dresses').update({ is_deleted: false }).eq('id', dress.id);
      if (error) throw error;
      onRefresh();
      setSuccess(`"${dress.name}" restored`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore dress');
    }
  };

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 76px)' }}>
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-0" style={{ color: '#1a1a1a' }}>
              Manage Dresses
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
              {filteredDresses.length} {showDeleted ? 'total' : 'active'} {filteredDresses.length === 1 ? 'dress' : 'dresses'}
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="d-flex align-items-center gap-2 border-0"
            style={{ backgroundColor: '#c2185b', borderRadius: 0, fontWeight: 600 }}
          >
            <PlusCircle size={18} />
            Add New Dress
          </Button>
        </div>

        {/* Success / Error messages */}
        {success && (
          <div
            className="mb-3 p-3 d-flex align-items-center gap-2"
            style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: 0, fontSize: '0.85rem' }}
          >
            {success}
          </div>
        )}
        {error && (
          <div
            className="mb-3 p-3 d-flex align-items-center gap-2"
            style={{ backgroundColor: '#fce4ec', color: '#c2185b', borderRadius: 0, fontSize: '0.85rem' }}
          >
            {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <InputGroup style={{ maxWidth: 350 }}>
            <InputGroup.Text style={{ backgroundColor: '#fff', border: 'none' }}>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', backgroundColor: '#fff' }}
            />
          </InputGroup>

          <Form.Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ maxWidth: 180, border: 'none', backgroundColor: '#fff' }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>

          <Button
            variant={showDeleted ? 'dark' : 'outline-dark'}
            onClick={() => setShowDeleted(!showDeleted)}
            className="d-flex align-items-center gap-1"
            style={{ borderRadius: 0, fontSize: '0.85rem' }}
          >
            {showDeleted ? <Eye size={16} /> : <EyeSlash size={16} />}
            {showDeleted ? 'Showing Trash' : 'Show Trash'}
          </Button>
        </div>

        {/* Data Table */}
        <div className="bg-white border" style={{ borderRadius: 0 }}>
          <Table hover responsive className="mb-0 align-middle">
            <thead>
              <tr style={{ backgroundColor: '#fafafa', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th className="py-3 ps-3">Image</th>
                <th className="py-3">Name</th>
                <th className="py-3">Category</th>
                <th className="py-3">Price</th>
                <th className="py-3">Stock</th>
                <th className="py-3">Sizes</th>
                <th className="py-3">Colors</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && filteredDresses.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    No dresses found. Click "Add New Dress" to create one.
                  </td>
                </tr>
              )}
              {filteredDresses.map((dress) => (
                <tr key={dress.id} style={{ opacity: dress.is_deleted ? 0.5 : 1 }}>
                  <td className="ps-3 py-2">
                    <div
                      style={{
                        width: 50,
                        height: 65,
                        overflow: 'hidden',
                        backgroundColor: '#f0f0f0',
                      }}
                    >
                      <img
                        src={dress.image_url || ''}
                        alt={dress.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                      {dress.name}
                    </div>
                    {dress.description && (
                      <div className="text-muted text-truncate" style={{ fontSize: '0.75rem', maxWidth: 200 }}>
                        {dress.description}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{dress.category}</td>
                  <td className="fw-bold" style={{ color: '#c2185b', fontSize: '0.9rem' }}>
                    ${dress.price.toFixed(2)}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{dress.stock}</span>
                    {dress.stock <= 0 && (
                      <Badge className="ms-1" style={{ backgroundColor: '#fce4ec', color: '#c2185b', borderRadius: 0, fontSize: '0.65rem' }}>
                        Out
                      </Badge>
                    )}
                    {dress.stock > 0 && dress.stock <= 10 && (
                      <Badge className="ms-1" style={{ backgroundColor: '#fff3e0', color: '#e65100', borderRadius: 0, fontSize: '0.65rem' }}>
                        Low
                      </Badge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {dress.sizes.map((s) => (
                        <Badge key={s} style={{ backgroundColor: '#f0f0f0', color: '#555', borderRadius: 0, fontSize: '0.65rem' }}>
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {dress.colors.map((c) => (
                        <Badge key={c} style={{ backgroundColor: '#f0f0f0', color: '#555', borderRadius: 0, fontSize: '0.65rem' }}>
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    {dress.is_deleted ? (
                      <Badge style={{ backgroundColor: '#eee', color: '#999', borderRadius: 0 }}>Deleted</Badge>
                    ) : (
                      <Badge style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: 0 }}>Active</Badge>
                    )}
                  </td>
                  <td className="text-end pe-3">
                    {dress.is_deleted ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-decoration-none"
                        onClick={() => handleRestore(dress)}
                        style={{ color: '#2e7d32', fontSize: '0.8rem' }}
                      >
                        Restore
                      </Button>
                    ) : (
                      <div className="d-flex gap-1 justify-content-end">
                        <Button
                          variant="link"
                          size="sm"
                          className="p-1"
                          onClick={() => openEditModal(dress)}
                          style={{ color: '#1a1a1a' }}
                          title="Edit"
                        >
                          <PencilSquare size={16} />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-1"
                          onClick={() => {
                            setDeleteTarget(dress);
                            setHardDelete(false);
                            setShowDeleteModal(true);
                          }}
                          style={{ color: '#c2185b' }}
                          title="Delete"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>

      {/* Create/Edit Modal */}
      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ fontSize: '1.1rem' }}>
            {editingDress ? 'Edit Dress' : 'Add New Dress'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div
              className="mb-3 p-2"
              style={{ backgroundColor: '#fce4ec', color: '#c2185b', borderRadius: 0, fontSize: '0.85rem' }}
            >
              {error}
            </div>
          )}

          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                    Dress Name *
                  </Form.Label>
                  <Form.Control
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ borderRadius: 0 }}
                    placeholder="e.g. Floral Summer Sundress"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                    Category *
                  </Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ borderRadius: 0 }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                    Price ($) *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ borderRadius: 0 }}
                    placeholder="49.99"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                    Stock Quantity
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{ borderRadius: 0 }}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                    Image URL
                  </Form.Label>
                  <Form.Control
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    style={{ borderRadius: 0, fontSize: '0.85rem' }}
                    placeholder="https://..."
                  />
                </Form.Group>
              </Col>
            </Row>

            {formData.image_url && (
              <div className="mb-3 text-center">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  style={{ maxWidth: 120, maxHeight: 160, objectFit: 'cover', border: '1px solid #eee' }}
                />
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                Sizes *
              </Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                {ALL_SIZES.map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant={formData.sizes.includes(size) ? 'dark' : 'outline-secondary'}
                    onClick={() => toggleSize(size)}
                    style={{
                      borderRadius: 0,
                      minWidth: 45,
                      backgroundColor: formData.sizes.includes(size) ? '#1a1a1a' : undefined,
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                Colors
              </Form.Label>
              <InputGroup className="mb-2" style={{ maxWidth: 300 }}>
                <Form.Control
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addColor();
                    }
                  }}
                  placeholder="Type a color and press Enter"
                  style={{ borderRadius: 0, fontSize: '0.85rem' }}
                />
                <Button variant="dark" onClick={addColor} style={{ borderRadius: 0, backgroundColor: '#1a1a1a' }}>
                  Add
                </Button>
              </InputGroup>
              <div className="d-flex gap-2 flex-wrap">
                {formData.colors.map((color) => (
                  <Badge
                    key={color}
                    className="d-flex align-items-center gap-1 p-2"
                    style={{ backgroundColor: '#f0f0f0', color: '#333', borderRadius: 20, fontSize: '0.8rem' }}
                  >
                    {color}
                    <button
                      onClick={() => removeColor(color)}
                      style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: '#999' }}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ borderRadius: 0, fontSize: '0.85rem' }}
                placeholder="Detailed product description..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowFormModal(false)} style={{ borderRadius: 0 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="border-0"
            style={{ backgroundColor: '#c2185b', borderRadius: 0, fontWeight: 600 }}
          >
            {saving ? 'Saving...' : editingDress ? 'Save Changes' : 'Add Dress'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ fontSize: '1rem' }}>
            Delete Dress
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '0.9rem' }}>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          </p>
          <Form.Check
            type="checkbox"
            id="hard-delete"
            label="Permanently delete (cannot be undone)"
            checked={hardDelete}
            onChange={(e) => setHardDelete(e.target.checked)}
            style={{ fontSize: '0.85rem' }}
            className="text-danger"
          />
          {!hardDelete && (
            <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
              Soft delete will hide this dress from the store. You can restore it later from the trash view.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} style={{ borderRadius: 0 }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={saving}
            style={{ borderRadius: 0, backgroundColor: '#c2185b', borderColor: '#c2185b' }}
          >
            {saving ? 'Deleting...' : hardDelete ? 'Delete Permanently' : 'Soft Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
