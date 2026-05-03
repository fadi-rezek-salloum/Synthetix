"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { authService } from "@/services/authService";
import { InputField } from "@/components/ui/Input";
import { toApiError } from "@/lib/api";

export default function PasswordResetConfirmPage() {
  const { uid, token } = useParams();
  const uidParam = Array.isArray(uid) ? uid[0] : uid;
  const tokenParam = Array.isArray(token) ? token[0] : token;
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!uidParam || !tokenParam) {
      setErrors({ non_field_errors: ["Password reset link is invalid."] });
      setLoading(false);
      return;
    }

    try {
      await authService.passwordResetConfirm({
        uid: uidParam,
        token: tokenParam,
        new_password1: password,
        new_password2: password,
      });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: unknown) {
      setErrors(toApiError(err) as Record<string, string[]>);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-[2.5rem] max-w-md w-full"
        >
          <ShieldCheck className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Password Updated</h1>
          <p className="text-zinc-500 text-sm">Redirecting you to login...</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[2.5rem] max-w-md w-full"
      >
        <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
        <p className="text-zinc-500 mb-8 text-sm">
          Choose a strong password for your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <InputField
              icon={<Lock className="w-4 h-4" />}
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errors={errors.new_password1 || errors.new_password2 || errors.non_field_errors}
              required
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
          <button
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
