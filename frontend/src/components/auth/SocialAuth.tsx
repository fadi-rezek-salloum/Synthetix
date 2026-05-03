import React, { useState } from "react";
import { authService } from "@/services/authService";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const SocialAuth = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const data = await authService.socialLogin(
          "google",
          tokenResponse.access_token
        );
        login(data); // Assuming socialLogin returns { user: ... } exactly like normal login
      } catch (err: any) {
        console.error("Social Auth Error:", err);
        setError("Failed to authenticate with Google. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error(errorResponse);
      setError("Google Login was cancelled or failed.");
    },
  });

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
          or continue with
        </span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={loading}
          className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-sm font-bold group disabled:opacity-50"
        >
          <GoogleIcon />
          <span className="text-zinc-400 group-hover:text-white transition-colors">
            {loading ? "Authenticating..." : "Continue with Google"}
          </span>
        </button>
      </div>
    </div>
  );
};
