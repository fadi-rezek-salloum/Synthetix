import { apiFetch } from "@/lib/api";
import { LoginCredentials, RegisterCredentials, User } from "@/types";

export const authService = {
  login: async (credentials: LoginCredentials) => {
    return await apiFetch("/accounts/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (credentials: RegisterCredentials) => {
    return await apiFetch("/accounts/auth/registration/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return await apiFetch("/accounts/auth/logout/", {
      method: "POST",
    });
  },

  getUser: async (): Promise<User> => {
    return await apiFetch("/accounts/auth/user/");
  },

  forgotPassword: async (email: string) => {
    return await apiFetch("/accounts/auth/password/reset/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  passwordResetConfirm: async (data: any) => {
    return await apiFetch("/accounts/auth/password/reset/confirm/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  socialLogin: async (provider: "google", accessToken: string) => {
    return await apiFetch(`/accounts/auth/${provider}/`, {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    });
  },
};
