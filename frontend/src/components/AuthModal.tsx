import { Modal, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ show, onClose, initialMode = 'login' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
        showToast('Welcome back!', 'success');
        handleClose();
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setBusy(false);
          return;
        }
        await signUp(email.trim(), password, fullName.trim());
        showToast('Account created! You are now signed in.', 'success');
        handleClose();
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_CONFIRM_PENDING') {
        setError('Account created. Please check your email to confirm, then log in.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="border-0">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <Tabs
          activeKey={mode}
          onSelect={(k) => {
            setMode((k as 'login' | 'register') || 'login');
            setError(null);
          }}
          className="mb-3 border-0"
          fill
        >
          <Tab eventKey="login" title="Login" />
          <Tab eventKey="register" title="Sign Up" />
        </Tabs>

        {error && (
          <Alert variant="danger" style={{ borderRadius: 0, fontSize: '0.85rem' }}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                Full Name
              </Form.Label>
              <Form.Control
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
                style={{ borderRadius: 0 }}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
              Email
            </Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ borderRadius: 0 }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold" style={{ fontSize: '0.8rem' }}>
              Password
            </Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ borderRadius: 0 }}
            />
          </Form.Group>

          <Button
            type="submit"
            disabled={busy}
            className="w-100 border-0"
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
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
