"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/authService";
import { InputField } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setErrors(err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-[2.5rem] max-w-md w-full"
        >
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MailCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Email Sent</h1>
          <p className="text-zinc-500 mb-8 text-sm">
            Check your inbox for a link to reset your password.
          </p>
          <Link
            href="/auth/login"
            className="text-white hover:underline text-sm font-bold"
          >
            Back to Login
          </Link>
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
        <h1 className="text-3xl font-bold mb-2">Recover Access</h1>
        <p className="text-zinc-500 mb-8 text-sm">
          Enter your email and we will send you a recovery link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            errors={errors.email || errors.detail}
            required
          />
          <button
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-[0.98]"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                Send Recovery Link <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            Remembered? Log In
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
