import React from "react";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  errors?: string[];
}

export const InputField = ({
  icon,
  errors,
  className,
  ...props
}: InputProps) => {
  const hasError = errors && errors.length > 0;

  return (
    <div className="space-y-1 w-full">
      <div className="relative group">
        <span
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
            hasError
              ? "text-red-400"
              : "text-zinc-500 group-focus-within:text-white"
          }`}
        >
          {icon}
        </span>
        <input
          {...props}
          className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm ${
            hasError
              ? "border-red-500/50 focus:border-red-500 bg-red-500/5"
              : "border-white/10 focus:border-white/20"
          } ${className}`}
        />
      </div>
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 ml-4 text-red-400 text-[10px]"
        >
          <AlertCircle className="w-3 h-3" />
          <span>{errors[0]}</span>
        </motion.div>
      )}
    </div>
  );
};
