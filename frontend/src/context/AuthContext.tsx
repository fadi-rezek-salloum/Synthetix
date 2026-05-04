"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { authService } from "@/services/authService";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { user: User }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initial user fetch
    authService
      .getUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    // Multi-tab synchronization
    const syncTabs = (event: StorageEvent) => {
      if (event.key === "synthetix_auth_sync") {
        setLoading(true);
        authService
          .getUser()
          .then(setUser)
          .catch(() => {
            setUser(null);
            if (window.location.pathname !== "/auth/login") {
              router.push("/auth/login");
            }
          })
          .finally(() => setLoading(false));
      }
    };

    window.addEventListener("storage", syncTabs);
    return () => window.removeEventListener("storage", syncTabs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = (userData: { user: User }) => {
    localStorage.setItem("synthetix_auth_sync", Date.now().toString());
    setUser(userData.user);
    router.push("/");
  };

  const logout = async () => {
    localStorage.setItem("synthetix_auth_sync", Date.now().toString());
    try {
      // We call logout but don't care if it fails (e.g. already logged out)
      await authService.logout();
    } catch (err) {
      logger.warn("Logout request failed, clearing local state anyway", { component: "AuthContext" });
    } finally {
      setUser(null);
      router.push("/auth/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
