// src/components/ui/button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${props.className}`}
    >
      {children}
    </button>
  );
};
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string; // Thêm variant
  size?: string;   // Thêm size
}