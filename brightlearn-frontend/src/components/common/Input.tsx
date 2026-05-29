import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2 group">
      {label && (
        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors group-focus-within:text-black">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full bg-transparent border-b ${error ? 'border-red-400' : 'border-neutral-200'} 
            py-3 text-black placeholder:text-neutral-300 outline-none 
            transition-all duration-500 ease-spring
            focus:border-black focus:bg-zinc-50/50
            ${className}
          `}
          {...props}
        />
        <motion.div 
          className="absolute bottom-0 left-0 h-0.5 bg-black w-0 group-focus-within:w-full transition-all duration-500 ease-spring"
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-red-500 font-bold uppercase tracking-wider"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
