const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const AUTH_SESSION_HINT_KEY = "synthetix_has_session";
const AUTH_SESSION_HINT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Global locks and queues for silent refresh
let isRefreshing = false;
let refreshSubscribers: ((status: string) => void)[] = [];

const onTokenRefreshed = (status: string) => {
  refreshSubscribers.forEach((callback) => callback(status));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (status: string) => void) => {
  refreshSubscribers.push(callback);
};

export type ApiError = Record<string, string | string[]> & {
  detail?: string | string[];
  non_field_errors?: string | string[];
};

type ApiFetchOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

const hasBrowserStorage = () => typeof window !== "undefined";

export const hasAuthSessionHint = (): boolean => {
  if (!hasBrowserStorage()) return false;

  try {
    const hint = window.localStorage.getItem(AUTH_SESSION_HINT_KEY);
    if (!hint) return false;

    const parsed = JSON.parse(hint) as { expiresAt?: number };
    if (typeof parsed.expiresAt !== "number") return false;

    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const setAuthSessionHint = (hasSession: boolean): void => {
  if (!hasBrowserStorage()) return;

  try {
    if (hasSession) {
      window.localStorage.setItem(
        AUTH_SESSION_HINT_KEY,
        JSON.stringify({ expiresAt: Date.now() + AUTH_SESSION_HINT_TTL_MS }),
      );
    } else {
      window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
    }
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
};

export const toApiError = (error: unknown): ApiError => {
  if (error && typeof error === "object") {
    return error as ApiError;
  }

  return { detail: "An unexpected error occurred." };
};

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuthRefresh = false, ...requestOptions } = options;

  const executeRequest = async (hasRetried = false): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...requestOptions,
      credentials: "include",
      headers: {
        ...(requestOptions.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...requestOptions.headers,
      },
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: "Server response was not valid JSON." };
    }

    const canAttemptRefresh =
      (response.status === 401 || response.status === 403) &&
      !hasRetried &&
      !skipAuthRefresh &&
      hasAuthSessionHint() &&
      endpoint !== "/accounts/auth/login/" &&
      endpoint !== "/accounts/auth/token/refresh/" &&
      endpoint !== "/accounts/auth/password/change/" &&
      endpoint !== "/accounts/account/delete/";

    if (canAttemptRefresh) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshRes = await fetch(
            `${API_URL}/accounts/auth/token/refresh/`,
            {
              method: "POST",
              credentials: "include",
            },
          );

          if (refreshRes.ok) {
            isRefreshing = false;
            setAuthSessionHint(true);
            onTokenRefreshed("success");
            return await executeRequest(true);
          } else {
            // Refresh failed (e.g. 401 or 403)
            isRefreshing = false;
            setAuthSessionHint(false);
            onTokenRefreshed("failed");
            throw data;
          }
        } catch (refreshErr) {
          isRefreshing = false;
          setAuthSessionHint(false);
          onTokenRefreshed("failed");
          throw refreshErr;
        }
      }

      return new Promise((resolve, reject) => {
        addRefreshSubscriber((status) => {
          if (status === "success") {
            resolve(executeRequest(true));
          } else {
            reject({ detail: "Refresh failed" });
          }
        });
      });
    }

    if (!response.ok) {
      if (typeof data === "string") data = { detail: data };
      throw data;
    }

    return data as T;
  };

  return executeRequest();
}
