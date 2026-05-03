"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
  Smartphone,
  Camera,
  Upload,
} from "lucide-react";
import { InputField } from "@/components/ui/Input";
import { SocialAuth } from "@/components/auth/SocialAuth";

const RegisterPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password1: "",
    password2: "",
    phone_number: "",
    avatar: null as File | null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [registered, setRegistered] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (user && !authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);

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
        role: "customer",
      });
      setUserEmail(formData.email);
      setRegistered(true);
    } catch (err: any) {
      if (err && typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({ non_field_errors: ["An unexpected error occurred."] });
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
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="relative group mb-6">
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, avatar: file });
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
            />
            <label
              htmlFor="avatar-upload"
              className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer overflow-hidden group-hover:border-indigo-500/50 transition-all relative"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-zinc-500 flex flex-col items-center gap-1">
                  <Camera className="w-6 h-6" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Add Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </label>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tighter mb-2">
            Join Synthetix
          </h1>
          <p className="text-zinc-500 text-sm italic">
            Create your account to start shopping.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              icon={<User className="w-4 h-4" />}
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e: any) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              errors={errors.first_name}
              required
            />
            <InputField
              icon={<User className="w-4 h-4" />}
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e: any) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              errors={errors.last_name}
              required
            />
          </div>

          <InputField
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e: any) =>
              setFormData({ ...formData, email: e.target.value })
            }
            errors={errors.email}
            required
          />

          <InputField
            icon={<Smartphone className="w-4 h-4" />}
            type="tel"
            placeholder="Phone Number (Optional)"
            value={formData.phone_number}
            onChange={(e: any) =>
              setFormData({ ...formData, phone_number: e.target.value })
            }
            errors={errors.phone_number}
          />

          <div className="relative group">
            <InputField
              icon={<Lock className="w-4 h-4" />}
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              errors={errors.password1}
              onChange={(e: any) => setFormData({ ...formData, password1: e.target.value })}
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

          <div className="relative group">
            <InputField
              icon={<Lock className="w-4 h-4" />}
              type={showPassword2 ? "text" : "password"}
              placeholder="Confirm Password"
              errors={errors.password2}
              onChange={(e: any) => setFormData({ ...formData, password2: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              className="absolute right-4 top-[18px] text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword2 ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {errors.non_field_errors && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {Array.isArray(errors.non_field_errors)
                ? errors.non_field_errors[0]
                : errors.non_field_errors}
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
        <div className="mt-8 space-y-4 text-center text-sm text-zinc-500">
          <p>
            Already part of the curation?{" "}
            <Link
              href="/auth/login"
              className="text-white font-bold hover:underline"
            >
              Log In
            </Link>
          </p>

          <p>
            Want to sell?{" "}
            <Link
              href="/auth/register-seller"
              className="text-luxury-gold font-bold hover:underline"
            >
              Open a Boutique
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

export default RegisterPage;
