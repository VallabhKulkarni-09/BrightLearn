import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-black text-white hover:bg-neutral-900 shadow-ambient hover:shadow-elevated',
    secondary: 'bg-neutral-100 text-black hover:bg-neutral-200',
    outline: 'border border-neutral-200 text-neutral-600 hover:border-black hover:text-black',
    ghost: 'text-neutral-500 hover:text-black hover:bg-neutral-50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        inline-flex items-center justify-center rounded-lg font-semibold tracking-tight 
        transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none 
        cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-black/20
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props as any}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
