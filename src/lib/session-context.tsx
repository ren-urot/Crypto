"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type SessionContextValue = {
  isLoggedIn: boolean;
  email: string | null;
  login: (email: string) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);
const STORAGE_KEY = "crypto-demo-session";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { email: string };
      setEmail(parsed.email);
      setIsLoggedIn(true);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function login(nextEmail: string) {
    setEmail(nextEmail);
    setIsLoggedIn(true);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: nextEmail }));
  }

  function logout() {
    setIsLoggedIn(false);
    setEmail(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <SessionContext.Provider value={{ isLoggedIn, email, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
