import React from 'react';
import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4 border',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center"
    >
      <div className={`
        ${sizes[size]} rounded-full border-neutral-100 border-t-black 
        animate-[spin_0.8s_cubic-bezier(0.16,1,0.3,1)_infinite]
      `} />
    </motion.div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton rounded-lg ${className}`} />
);
