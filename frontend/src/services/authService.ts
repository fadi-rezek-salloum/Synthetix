import { apiFetch } from "@/lib/api";
import { LoginCredentials, RegisterCredentials, User } from "@/types";

export const authService = {
  login: async (credentials: LoginCredentials) => {
    // Added "/auth/" to the path
    const response = await apiFetch("/accounts/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response;
  },

  register: async (credentials: RegisterCredentials) => {
    // Added "/auth/" to the path
    return await apiFetch("/accounts/auth/registration/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    // Added "/auth/" to the path
    return await apiFetch("/accounts/auth/logout/", {
      method: "POST",
    });
  },

  getUser: async (): Promise<User> => {
    // Added "/auth/" to the path
    return await apiFetch("/accounts/auth/user/");
  },

  forgotPassword: async (email: string) => {
    // Added "/auth/" to the path
    return await apiFetch("/accounts/auth/password/reset/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};
