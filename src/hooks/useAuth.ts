"use client";

import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  role: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, nickname: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  openLoginModal: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  openLoginModal: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
