import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-zoom-blue text-white hover:bg-blue-700 disabled:bg-blue-300",
  secondary: "border border-zoom-line bg-white text-zoom-ink hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
};

export function Button({ className = "", variant = "primary", icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
