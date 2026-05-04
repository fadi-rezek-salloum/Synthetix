import React from "react";
import PhoneInput from "react-phone-number-input";
import { AlertCircle, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import "react-phone-number-input/style.css";

interface PhoneInputFieldProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PhoneInputField = ({
  value,
  onChange,
  error,
  placeholder = "Phone Number",
  required = false,
  disabled = false,
  className,
}: PhoneInputFieldProps) => {
  const hasError = error && error.length > 0;

  const handleChange = (phoneValue: string | undefined) => {
    onChange(phoneValue || "");
  };

  return (
    <div className="space-y-1 w-full">
      <div className="relative group">
        <span
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors pointer-events-none ${
            hasError
              ? "text-red-400"
              : "text-zinc-500 group-focus-within:text-white"
          }`}
        >
          <Smartphone className="w-4 h-4" />
        </span>
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="US"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`phone-input-wrapper ${hasError ? "has-error" : ""} ${className || ""}`}
        />
      </div>
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 ml-4 text-red-400 text-[10px]"
        >
          <AlertCircle className="w-3 h-3" />
          <span>{error[0]}</span>
        </motion.div>
      )}
    </div>
  );
};
