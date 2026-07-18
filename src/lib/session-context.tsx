"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SessionContextValue = {
  isLoggedIn: boolean;
  email: string | null;
  login: (email: string) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  function login(nextEmail: string) {
    setEmail(nextEmail);
    setIsLoggedIn(true);
  }

  function logout() {
    setIsLoggedIn(false);
    setEmail(null);
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
