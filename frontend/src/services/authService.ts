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
    const hasFile = credentials.avatar || credentials.logo;
    
    if (hasFile) {
      const formData = new FormData();
      Object.entries(credentials).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string | Blob);
        }
      });
      return await apiFetch("/accounts/auth/registration/", {
        method: "POST",
        body: formData,
      });
    }

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
  socialCheck: async (provider: "google", accessToken: string) => {
    return await apiFetch(`/accounts/auth/${provider}/check/`, {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    });
  },
  socialRegisterFinish: async (provider: "google", data: {access_token: string, phone_number: string, password: string}) => {
    return await apiFetch(`/accounts/auth/${provider}/register/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
