"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// FIX: We must extend HTMLMotionProps<"button">, not standard HTML attributes
// This ensures compatibility with <motion.button>
interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = ({ children, className, variant = "primary", size = "md", isLoading, ...props }: ButtonProps) => {
  const base = "font-bold transition-colors shadow-md border-b-4 active:border-b-0 active:translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:border-b-4 disabled:transform-none";
  
  const variants = {
    primary: "bg-leather-pop text-leather-900 border-leather-popHover hover:bg-leather-popHover",
    secondary: "bg-leather-700 text-leather-accent border-leather-900 hover:bg-leather-600"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl"
  };

  return (
    <motion.button
      whileTap={isLoading || props.disabled ? undefined : { scale: 0.95 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : children}
    </motion.button>
  );
};

