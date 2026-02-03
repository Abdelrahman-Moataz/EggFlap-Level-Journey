
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  className = '', 
  variant = 'primary',
  disabled = false
}) => {
  const baseStyles = "px-6 py-3 rounded-2xl font-game text-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px]";
  const variants = {
    primary: "bg-yellow-400 text-yellow-900 hover:bg-yellow-300",
    secondary: "bg-blue-500 text-white hover:bg-blue-400",
    danger: "bg-red-500 text-white hover:bg-red-400"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
