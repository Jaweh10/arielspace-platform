'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, role?: 'user' | 'admin') => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  showWelcome: boolean;
  dismissWelcome: () => void;
  showSessionWarning: boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout: 5 minutes (300000 ms)
const SESSION_TIMEOUT = 5 * 60 * 1000;
// Warning before timeout: 1 minute before (60000 ms)
const WARNING_TIME = 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (storedUser && lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
      
      // If more than 5 minutes since last activity, logout
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        logout();
      } else {
        setUser(JSON.parse(storedUser));
        startSessionTimer();
      }
    }
  }, []);

  // Track user activity
  const resetSessionTimer = useCallback(() => {
    if (!user) return;

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    
    // Hide warning if showing
    setShowSessionWarning(false);

    // Update last activity timestamp
    localStorage.setItem('lastActivity', Date.now().toString());

    // Set warning timer (1 minute before logout)
    warningRef.current = setTimeout(() => {
      setShowSessionWarning(true);
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set logout timer (5 minutes)
    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, SESSION_TIMEOUT);
  }, [user]);

  const startSessionTimer = () => {
    resetSessionTimer();
  };

  const handleSessionTimeout = () => {
    setShowSessionWarning(false);
    logout();
    
    // Show alert to user
    alert('Your session has expired due to inactivity. Please log in again.');
    
    // Redirect to login if not already there
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
      window.location.href = '/auth/login';
    }
  };

  const extendSession = () => {
    resetSessionTimer();
  };

  // Listen for user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetSessionTimer();
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Start initial timer
    startSessionTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, resetSessionTimer]);

  const login = (email: string, name?: string, role?: 'user' | 'admin') => {
    // Check if this email should be an admin
    const adminEmails = ['admin@arielspace.com', 'admin@example.com'];
    const isAdminEmail = adminEmails.includes(email.toLowerCase());
    
    const newUser = {
      id: Date.now().toString(),
      email,
      name: name || email.split('@')[0],
      role: role || (isAdminEmail ? 'admin' : 'user'),
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('lastActivity', Date.now().toString());
    setShowWelcome(true);
    startSessionTimer();
  };

  const logout = () => {
    setUser(null);
    setShowSessionWarning(false);
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    
    // Clear timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: !!user && user.role === 'admin',
        showWelcome,
        dismissWelcome,
        showSessionWarning,
        extendSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
