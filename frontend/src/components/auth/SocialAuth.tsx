import React, { useState } from "react";
import { authService } from "@/services/authService";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/lib/logger";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, User as UserIcon, X } from "lucide-react";
import { InputField } from "@/components/ui/Input";
import { PhoneInputField } from "@/components/ui/PhoneInput";
import { toApiError } from "@/lib/api";
import { isValidPhoneNumber } from "libphonenumber-js";
import { User } from "@/types";

type GoogleUserData = {
  email: string;
  first_name: string;
  last_name: string;
};

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
  
  // Multi-step social registration state
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [tempGoogleToken, setTempGoogleToken] = useState<string | null>(null);
  const [googleUserData, setGoogleUserData] = useState<GoogleUserData | null>(null);
  const [completionData, setCompletionData] = useState({
    phone_number: "",
    password: "",
  });

  const hasGoogleConfig = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempGoogleToken) return;

    if (!isValidPhoneNumber(completionData.phone_number)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (completionData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const hasNumber = /\d/.test(completionData.password);
    const hasLetter = /[a-zA-Z]/.test(completionData.password);
    if (!hasNumber || !hasLetter) {
      setError("Password must contain both letters and numbers.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await authService.socialRegisterFinish("google", {
        access_token: tempGoogleToken,
        phone_number: completionData.phone_number,
        password: completionData.password
      });
      login(data);
    } catch (err: unknown) {
      // Handle the array of errors from Django
      const apiError = toApiError(err);
      const errorValue = apiError.error;
      const errorMsg = Array.isArray(errorValue)
        ? errorValue[0]
        : errorValue || "Failed to complete your profile.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
          or continue with
        </span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {error && !showCompletionForm && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center mb-4">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {!hasGoogleConfig && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-[10px] text-center mb-4 font-mono">
          Google Authentication is not configured.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {hasGoogleConfig ? (
          <GoogleLoginButton 
            setLoading={setLoading}
            setError={setError}
            login={login}
            setTempGoogleToken={setTempGoogleToken}
            setGoogleUserData={setGoogleUserData}
            setShowCompletionForm={setShowCompletionForm}
            loading={loading}
          />
        ) : (
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl opacity-50 cursor-not-allowed text-sm font-bold"
          >
            <GoogleIcon />
            <span className="text-zinc-500">Google Login Unavailable</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showCompletionForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass p-10 rounded-[2.5rem] max-w-md w-full border-white/10 relative"
            >
              <button 
                onClick={() => setShowCompletionForm(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <UserIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Finish Setting Up Your Account</h2>
                <p className="text-sm text-zinc-500">
                  Welcome, <span className="text-white font-bold">{googleUserData?.first_name}</span>! 
                  Just a few more details to get you started.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleCompletionSubmit} className="space-y-4">
              <PhoneInputField
                value={completionData.phone_number}
                onChange={(value) => setCompletionData({...completionData, phone_number: value})}
                placeholder="Phone Number"
                required
              />
                <InputField
                  icon={<Lock className="w-4 h-4" />}
                  type="password"
                  placeholder="Create a Password"
                  value={completionData.password}
                  onChange={(e) => setCompletionData({...completionData, password: e.target.value})}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-[0.98] mt-6 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Complete Signup"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface GoogleLoginButtonProps {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (data: { user: User }) => void;
  setTempGoogleToken: (token: string | null) => void;
  setGoogleUserData: (data: GoogleUserData | null) => void;
  setShowCompletionForm: (show: boolean) => void;
  loading: boolean;
}

const GoogleLoginButton = ({
  setLoading,
  setError,
  login,
  setTempGoogleToken,
  setGoogleUserData,
  setShowCompletionForm,
  loading
}: GoogleLoginButtonProps) => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const token = tokenResponse.access_token;
        const checkRes = await authService.socialCheck("google", token);

        if (checkRes.exists) {
          const data = await authService.socialLogin("google", token);
          login(data);
        } else {
          setTempGoogleToken(token);
          setGoogleUserData({
            email: checkRes.email,
            first_name: checkRes.first_name,
            last_name: checkRes.last_name
          });
          setShowCompletionForm(true);
        }
      } catch (err: unknown) {
        logger.error("Social Auth failed", err, { component: "SocialAuth", provider: "google" });
        setError("Failed to authenticate with Google. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      logger.error("Google Login failed", new Error(JSON.stringify(errorResponse)), { component: "SocialAuth" });
      setError("Google Login was cancelled or failed.");
    },
    onNonOAuthError: (errorResponse) => {
      logger.error("Google non-OAuth login failed", new Error(JSON.stringify(errorResponse)), { component: "SocialAuth" });
      setError("Google Login was cancelled or failed.");
    },
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={loading}
      className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-sm font-bold group disabled:opacity-50 w-full"
    >
      <GoogleIcon />
      <span className="text-zinc-400 group-hover:text-white transition-colors">
        {loading ? "Authenticating..." : "Continue with Google"}
      </span>
    </button>
  );
};
