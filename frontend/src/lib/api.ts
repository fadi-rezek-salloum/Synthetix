const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

export const toApiError = (error: unknown): ApiError => {
  if (error && typeof error === "object") {
    return error as ApiError;
  }

  return { detail: "An unexpected error occurred." };
};

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const executeRequest = async (): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: "Server response was not valid JSON." };
    }

    if (
      response.status === 401 &&
      endpoint !== "/accounts/auth/login/" &&
      endpoint !== "/accounts/auth/token/refresh/"
    ) {
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
            onTokenRefreshed("success");
            return await executeRequest();
          } else {
            // Refresh failed (e.g. 401 or 403)
            isRefreshing = false;
            onTokenRefreshed("failed");
            throw data;
          }
        } catch (refreshErr) {
          isRefreshing = false;
          onTokenRefreshed("failed");
          throw refreshErr;
        }
      }

      return new Promise((resolve, reject) => {
        addRefreshSubscriber((status) => {
          if (status === "success") {
            resolve(executeRequest());
          } else {
            reject(new Error("Refresh failed"));
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
