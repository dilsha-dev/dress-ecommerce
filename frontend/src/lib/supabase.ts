import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: UserProfile | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dress-ecommerce-5uv6.onrender.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user profile from Django using stored JWT token
  const fetchProfile = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // Invalid or expired token
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.detail || 'Invalid email or password.');
    }

    const authToken = data.token || data.access;
    localStorage.setItem('token', authToken);
    setToken(authToken);

    if (data.user) {
      setUser(data.user);
    } else {
      await fetchProfile(authToken);
    }
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const response = await fetch(`${API_BASE_URL}/api/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.detail || 'Could not create account. Please try again.');
    }

    // Automatically log in after registration if token is returned
    if (data.token || data.access) {
      const authToken = data.token || data.access;
      localStorage.setItem('token', authToken);
      setToken(authToken);
      if (data.user) setUser(data.user);
    } else {
      // Fallback to logging in manually
      await signIn(email, password);
    }
  }, [signIn]);

  const signOut = useCallback(async () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        isAdmin: user?.role === 'admin',
        loading,
        token,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}