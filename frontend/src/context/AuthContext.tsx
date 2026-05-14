"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { authService } from "@/services/authService";
import { hasAuthSessionHint, setAuthSessionHint } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { user: User }) => void;
  logout: () => void;
  logoutLocal: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      if (!hasAuthSessionHint()) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const user = await authService.getUser();
        setAuthSessionHint(true);
        setUser(user);
      } catch {
        setAuthSessionHint(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Multi-tab synchronization
    const syncTabs = (event: StorageEvent) => {
      if (event.key === "synthetix_auth_sync") {
        if (!hasAuthSessionHint()) {
          setUser(null);
          setLoading(false);
          if (window.location.pathname !== "/auth/login") {
            router.push("/auth/login");
          }
          return;
        }

        setLoading(true);
        const syncUser = async () => {
          try {
            const user = await authService.getUser();
            setAuthSessionHint(true);
            setUser(user);
          } catch {
            setAuthSessionHint(false);
            setUser(null);
            if (window.location.pathname !== "/auth/login") {
              router.push("/auth/login");
            }
          } finally {
            setLoading(false);
          }
        };
        syncUser();
      }
    };

    window.addEventListener("storage", syncTabs);
    return () => window.removeEventListener("storage", syncTabs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = (userData: { user: User }) => {
    setAuthSessionHint(true);
    localStorage.setItem("synthetix_auth_sync", Date.now().toString());
    setUser(userData.user);
    router.push("/");
  };

  const logoutLocal = (redirectTo: string = "/auth/login") => {
    setAuthSessionHint(false);
    setUser(null);
    setLoading(false);
    localStorage.setItem("synthetix_auth_sync", Date.now().toString());
    router.push(redirectTo);
  };

  const logout = async () => {
    try {
      // We call logout but don't care if it fails (e.g. already logged out)
      await authService.logout();
    } catch {
      logger.warn("Logout request failed, clearing local state anyway", { component: "AuthContext" });
    } finally {
      logoutLocal();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, logoutLocal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
