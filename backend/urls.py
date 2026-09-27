import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id?: string;
  email: string;
  full_name?: string;
  role?: UserRole;
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
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Sign In using Django SimpleJWT (/api/token/)
  const signIn = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email, // SimpleJWT standard
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Invalid email or password.');
    }

    const accessToken = data.access;
    const userData = { email, full_name: data.full_name || '', role: data.role || 'customer' };

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  }, []);

  // Sign Up using Django Register endpoint (/api/register/)
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const response = await fetch(`${API_BASE_URL}/api/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email,
        email: email,
        password: password,
        full_name: fullName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return specific Django field error if available
      const errorMsg = data.email?.[0] || data.username?.[0] || data.detail || data.message || 'Could not create account.';
      throw new Error(errorMsg);
    }

    // Automatically log in after successful registration
    await signIn(email, password);
  }, [signIn]);

  // Sign Out
  const signOut = useCallback(async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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