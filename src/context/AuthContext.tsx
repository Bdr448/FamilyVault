import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';

export type UserRole = 'admin' | 'family';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextProps {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  vaultPin: string;
  setVaultPin: (pin: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Initial local storage seeds
const SEED_PROFILES = [
  { id: 'admin-uuid', email: 'admin@familyvault.com', role: 'admin', name: 'Family Admin' },
  { id: 'family-uuid', email: 'family@familyvault.com', role: 'family', name: 'Family User' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaultPin, setVaultPinState] = useState<string>(() => {
    return localStorage.getItem('family-vault-pin') || '1234';
  });

  const setVaultPin = (pin: string) => {
    localStorage.setItem('family-vault-pin', pin);
    setVaultPinState(pin);
  };

  // Demo Login Logic
  const loginDemo = async (email: string, password: string) => {
    const matched = SEED_PROFILES.find((p) => p.email === email.toLowerCase());
    if (!matched) {
      return { success: false, error: 'User profile not found.' };
    }
    // Simple passwords check for demo
    if (matched.role === 'admin' && password !== 'admin123') {
      return { success: false, error: 'Incorrect password for Admin (use: admin123).' };
    }
    if (matched.role === 'family' && password !== 'family123') {
      return { success: false, error: 'Incorrect password for Family (use: family123).' };
    }

    const authUser: AuthUser = {
      id: matched.id,
      email: matched.email,
      role: matched.role as UserRole,
      name: matched.name
    };

    localStorage.setItem('family-vault-session', JSON.stringify(authUser));
    setUser(authUser);
    
    // Log demo activity
    const activityLog = {
      id: Math.random().toString(),
      user_id: authUser.id,
      user_email: authUser.email,
      action: 'login',
      details: `${authUser.email} logged in`,
      entity_type: 'auth',
      created_at: new Date().toISOString()
    };
    const logs = JSON.parse(localStorage.getItem('family-vault-activity_logs') || '[]');
    localStorage.setItem('family-vault-activity_logs', JSON.stringify([activityLog, ...logs]));

    return { success: true };
  };

  // Real Supabase Login
  const loginSupabase = async (email: string, password: string) => {
    if (!supabase) return { success: false, error: 'Supabase is not initialized.' };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // Fetch role from profile table
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile) {
          // If no profile yet, write default based on metadata or fallback
          const defaultRole = data.user.user_metadata?.role || 'family';
          await supabase.from('profiles').insert({ id: data.user.id, role: defaultRole });
          
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || '',
            role: defaultRole as UserRole,
            name: data.user.user_metadata?.name || (defaultRole === 'admin' ? 'Admin User' : 'Family Member')
          };
          setUser(authUser);
        } else {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || '',
            role: profile.role as UserRole,
            name: data.user.user_metadata?.name || (profile.role === 'admin' ? 'Admin User' : 'Family Member')
          };
          setUser(authUser);
        }
        return { success: true };
      }
      return { success: false, error: 'Unknown login error.' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error.' };
    }
  };

  const login = async (email: string, password: string) => {
    if (isDemoMode) {
      return loginDemo(email, password);
    } else {
      return loginSupabase(email, password);
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      localStorage.removeItem('family-vault-session');
      setUser(null);
    } else if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      if (isDemoMode) {
        const stored = localStorage.getItem('family-vault-session');
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            localStorage.removeItem('family-vault-session');
          }
        }
        setLoading(false);
      } else if (supabase) {
        const client = supabase;
        // Fetch current session
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: (profile?.role || 'family') as UserRole,
            name: session.user.user_metadata?.name || (profile?.role === 'admin' ? 'Admin User' : 'Family Member')
          });
        }
        
        // Listen to updates
        const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, newSession) => {
          if (newSession?.user) {
            const { data: profile } = await client
              .from('profiles')
              .select('role')
              .eq('id', newSession.user.id)
              .single();

            setUser({
              id: newSession.user.id,
              email: newSession.user.email || '',
              role: (profile?.role || 'family') as UserRole,
              name: newSession.user.user_metadata?.name || (profile?.role === 'admin' ? 'Admin User' : 'Family Member')
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, vaultPin, setVaultPin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
