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
  Store,
  Smartphone,
  Camera,
  Upload,
} from "lucide-react";
import { InputField } from "@/components/ui/Input";
import { SocialAuth } from "@/components/auth/SocialAuth";

const RegisterSellerPage = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password1: "",
    password2: "",
    phone_number: "",
    store_name: "",
    logo: null as File | null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
      await authService.register({
        ...formData,
        username: formData.email,
        role: "seller", // Hardcoded for this page
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
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-[2.5rem] max-w-md w-full"
        >
          <div className="w-20 h-20 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <MailCheck className="w-10 h-10 text-luxury-gold" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Verification Sent</h1>
          <p className="text-zinc-500 mb-8 text-sm">
            Check <span className="text-white font-bold">{userEmail}</span> to
            verify your seller account.
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
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-luxury-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-10 rounded-[2.5rem] border-white/5 relative z-10"
      >
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="relative group mb-6">
            <input
              type="file"
              id="logo-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, logo: file });
                  setLogoPreview(URL.createObjectURL(file));
                }
              }}
            />
            <label
              htmlFor="logo-upload"
              className="w-24 h-24 rounded-full bg-luxury-gold/5 border-2 border-dashed border-luxury-gold/20 flex items-center justify-center cursor-pointer overflow-hidden group-hover:border-luxury-gold/50 transition-all relative"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-luxury-gold/50 flex flex-col items-center gap-1">
                  <Camera className="w-6 h-6" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Store Logo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </label>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold text-[10px] font-bold uppercase tracking-widest mb-4">
            <Store className="w-3 h-3" /> Become a Seller
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">
            Start Your Store
          </h1>
          <p className="text-zinc-500 text-sm">
            Sell your products on the Synthetix marketplace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              icon={<User className="w-4 h-4" />}
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              errors={errors.first_name}
              required
            />
            <InputField
              icon={<User className="w-4 h-4" />}
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              errors={errors.last_name}
              required
            />
          </div>

          <InputField
            icon={<Store className="w-4 h-4" />}
            placeholder="Store Name (e.g. Aether Collection)"
            value={formData.store_name}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
            errors={errors.store_name}
            required
          />

          <InputField
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="Business Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            errors={errors.email}
            required
          />

          <InputField
            icon={<Smartphone className="w-4 h-4" />}
            type="tel"
            placeholder="Business Phone"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            errors={errors.phone_number}
            required
          />

          <InputField
            icon={<Lock className="w-4 h-4" />}
            type={showPassword ? "text" : "password"}
            placeholder="Secure Password"
            value={formData.password1}
            onChange={(e) =>
              setFormData({ ...formData, password1: e.target.value })
            }
            errors={errors.password1}
            required
          />
          <InputField
            icon={<Lock className="w-4 h-4" />}
            type={showPassword2 ? "text" : "password"}
            placeholder="Confirm Password"
            value={formData.password2}
            onChange={(e) =>
              setFormData({ ...formData, password2: e.target.value })
            }
            errors={errors.password2}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-[0.98] mt-6 disabled:opacity-50"
          >
            {loading ? "Initializing..." : "Begin Partnership"}
          </button>
        </form>

        <SocialAuth />

        <div className="mt-8 text-center">
          <Link
            href="/auth/register"
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            Not a seller? Register as Customer
          </Link>
        </div>
      </motion.div>
    </main>
  );
};

export default RegisterSellerPage;
