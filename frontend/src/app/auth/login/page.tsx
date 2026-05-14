"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, EyeOff, Eye, AlertCircle } from "lucide-react";
import { InputField } from "@/components/ui/Input";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { toApiError } from "@/lib/api";

const LoginPage = () => {
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (user && !authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = await authService.login({ email, password });
      login(data);
    } catch (err: unknown) {
      if (err && typeof err === "object") {
        setErrors(toApiError(err) as Record<string, string[]>);
      } else {
        setErrors({
          non_field_errors: ["An unexpected connection error occurred."],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-10 rounded-[2.5rem] border-white/5 relative z-10"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-500 text-sm">
            Sign in to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="Email Address"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            errors={errors.email || errors.detail}
          />
          <div className="relative">
            <InputField
              icon={<Lock className="w-4 h-4" />}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errors={errors.password || errors.non_field_errors}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[18px] text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex justify-end px-2">
            <Link
              href="/auth/forgot-password"
              className="text-[10px] text-zinc-500 hover:text-white transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {errors.detail && !errors.email && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {typeof errors.detail === 'string' ? errors.detail : JSON.stringify(errors.detail)}
            </div>
          )}
          <button
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-[0.98] mt-6 disabled:opacity-50"
          >
            {loading ? (
              "Authenticating..."
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        <div className="mt-8 space-y-4 text-center text-sm text-zinc-500">
          <p>
            New here?{" "}
            <Link
              href="/auth/register"
              className="text-white font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-xs text-zinc-600 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <SocialAuth />
      </motion.div>
    </main>
  );
};

export default LoginPage;
