"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { signIn, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { AuthContext, AuthUser } from "@/hooks/useAuth";
import LoginModal from "./LoginModal";

function AuthProviderInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setUser(json.data);
          return;
        }
      }
    } catch {
      // not logged in
    }
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: "邮箱或密码错误" };
      }

      await fetchUser();
      setShowLogin(false);
      return { success: true };
    },
    [fetchUser]
  );

  const register = useCallback(
    async (email: string, password: string, nickname: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });
      const json = await res.json();

      if (!json.success) {
        return { success: false, error: json.error?.message || "注册失败" };
      }

      return { success: true };
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    setUser(null);
  }, []);

  const openLoginModal = useCallback(() => setShowLogin(true), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, openLoginModal }}
    >
      {children}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </AuthContext.Provider>
  );
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}
