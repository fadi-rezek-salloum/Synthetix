import { apiFetch } from "@/lib/api";
import { LoginCredentials, RegisterCredentials, User } from "@/types";

interface LoginResponse {
  user: User;
}

interface PasswordResetConfirmData {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}

interface SocialCheckResponse {
  exists: boolean;
  email: string;
  first_name: string;
  last_name: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    return await apiFetch<LoginResponse>("/accounts/auth/login/", {
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
      return await apiFetch<LoginResponse>("/accounts/auth/registration/", {
        method: "POST",
        body: formData,
      });
    }

    return await apiFetch<LoginResponse>("/accounts/auth/registration/", {
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

  passwordResetConfirm: async (data: PasswordResetConfirmData) => {
    return await apiFetch("/accounts/auth/password/reset/confirm/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  socialLogin: async (provider: "google", accessToken: string) => {
    return await apiFetch<LoginResponse>(`/accounts/auth/${provider}/`, {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    });
  },
  socialCredentialLogin: async (provider: "google", credential: string) => {
    return await apiFetch<LoginResponse>(`/accounts/auth/${provider}/credential/`, {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
  },
  socialCheck: async (provider: "google", accessToken: string) => {
    return await apiFetch<SocialCheckResponse>(`/accounts/auth/${provider}/check/`, {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    });
  },
  socialRegisterFinish: async (provider: "google", data: {access_token: string, phone_number: string, password: string}) => {
    return await apiFetch<LoginResponse>(`/accounts/auth/${provider}/register/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  changePassword: async (data: { old_password: string; new_password1: string; new_password2: string }) => {
    return await apiFetch("/accounts/auth/password/change/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateProfile: async (data: { first_name?: string; last_name?: string; phone_number?: string }) => {
    return await apiFetch<User>("/accounts/auth/user/", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteAccount: async () => {
    return await apiFetch("/accounts/account/delete/", {
      method: "DELETE",
    });
  },
};
