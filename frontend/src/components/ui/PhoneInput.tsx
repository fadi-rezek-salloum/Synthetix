import React from "react";
import PhoneInput from "react-phone-number-input";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

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

        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="US"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn("phone-input-wrapper", hasError && "has-error", className)}
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
