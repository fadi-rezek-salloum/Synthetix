"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  MailCheck,
} from "lucide-react";

const RegisterPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password1: "",
    password2: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [registered, setRegistered] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password1 !== formData.password2) {
      return setErrors({ password2: ["Passwords do not match"] });
    }

    setLoading(true);
    setErrors({});

    try {
      const data = await authService.register({
        ...formData,
        username: formData.email,
        first_name: formData.name,
        role: "CUSTOMER",
      });
      setUserEmail(formData.email);
      setRegistered(true);
    } catch (err: any) {
      // Handle Django/DRF error objects
      if (typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({ non_field_errors: ["An unexpected connection error occurred."] });
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass p-10 rounded-[2.5rem] border-white/5 relative z-10 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <MailCheck className="w-10 h-10 text-green-400" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
          <p className="text-zinc-400 mb-6 text-sm">
            We sent a confirmation link to:
          </p>
          <p className="font-bold text-lg mb-6 text-white">{userEmail}</p>
          <p className="text-xs text-zinc-500 mb-6">
            Click the link in the email to verify your account and finish
            registration.
          </p>

          <div className="flex justify-center">
            <Link
              href="/auth/login"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass p-10 rounded-[2.5rem] border-white/5 relative z-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">
            Claim Your Identity
          </h1>
          <p className="text-zinc-500 text-sm italic">
            "Become part of the curation."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={<User className="w-4 h-4" />}
            type="text"
            placeholder="Full Name"
            error={errors.first_name}
            onChange={(val: string) => setFormData({ ...formData, name: val })}
          />

          <InputField
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="Email Address"
            error={errors.email}
            onChange={(val: string) => setFormData({ ...formData, email: val })}
          />

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-white/20 transition-all text-sm"
              onChange={(e) =>
                setFormData({ ...formData, password1: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            {errors.password1 && (
              <p className="text-red-400 text-[10px] mt-1 ml-4">
                {errors.password1[0]}
              </p>
            )}
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type={showPassword2 ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-white/20 transition-all text-sm"
              onChange={(e) =>
                setFormData({ ...formData, password2: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword2 ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            {errors.password2 && (
              <p className="text-red-400 text-[10px] mt-1 ml-4">
                {errors.password2[0]}
              </p>
            )}
          </div>

          {errors.non_field_errors && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {Array.isArray(errors.non_field_errors) ? errors.non_field_errors[0] : errors.non_field_errors}
            </div>
          )}

          {errors.detail && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {Array.isArray(errors.detail) ? errors.detail[0] : errors.detail}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-[0.98] mt-6"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                Register <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Want to sell?{" "}
          <Link
            href="/auth/register-seller"
            className="text-luxury-gold font-bold hover:underline"
          >
            Open a Boutique
          </Link>
        </p>
      </motion.div>
    </main>
  );
};

const InputField = ({ icon, type, placeholder, error, onChange }: any) => (
  <div className="space-y-1">
    <div className="relative group">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-white/20 transition-all text-sm"
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
    {error && error.length > 0 && (
      <p className="text-red-400 text-[10px] ml-4">{error[0]}</p>
    )}
  </div>
);

export default RegisterPage;
