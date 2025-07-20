import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "primary", 
  size = "md",
  className = ""
}: ButtonProps) {
  const baseClasses = "relative rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const sizeClasses = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2 px-4 text-sm",
    lg: "py-3 px-6 text-base"
  };

  const variantClasses = {
    primary: "bg-gradient-to-b from-[#1E3A8A] to-[#3B82F6] text-white",
    secondary: "bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300"
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      style={{ boxShadow: variant === "primary" ? "0 0 12px rgb(59, 130, 246)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="absolute inset-0 rounded-lg">
        <div className="rounded-lg border border-white/20 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>
        <div className="rounded-lg border absolute inset-0 border-white/40 [mask-image:linear-gradient(to_top,black,transparent)]"></div>
        <div className="absolute inset-0 shadow-[0px_0px_10px_0px_rgba(59,130,246,0.7)_inset] rounded-lg"></div>
      </div>
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export default Button;
