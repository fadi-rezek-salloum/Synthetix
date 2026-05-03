"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const verify = async () => {
      if (!key) {
        setStatus("error");
        return;
      }
      try {
        await apiFetch("/accounts/auth/registration/verify-email/", {
          method: "POST",
          body: JSON.stringify({ key }),
        });
        setStatus("success");
        setTimeout(() => router.push("/auth/login?verified=true"), 3000);
      } catch {
        setStatus("error");
      }
    };
    verify();
  }, [key, router]);

  return (
    <div className="w-full max-w-md text-center">
      {status === "loading" && (
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-zinc-500" />
      )}
      {status === "success" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ShieldCheck className="w-16 h-16 mx-auto text-white mb-6" />
          <h1 className="text-2xl font-bold mb-2">Identity Verified</h1>
          <p className="text-zinc-500">
            Welcome to the inner circle. Redirecting...
          </p>
        </motion.div>
      )}
      {status === "error" && (
        <p className="text-red-400">Verification link expired or invalid.</p>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <Suspense fallback={<Loader2 className="w-12 h-12 animate-spin mx-auto text-zinc-500" />}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
