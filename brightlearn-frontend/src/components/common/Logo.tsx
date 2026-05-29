import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = false }) => {
  const sizes = {
    sm: 20,
    md: 32,
    lg: 64,
    xl: 120
  };

  const s = sizes[size];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      {/* Cinematic Silver 'B' Symbol */}
      <svg 
        width={s} 
        height={s} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4D4D8" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#71717A" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Top Curve */}
        <motion.path 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d="M30 25C30 25 75 25 75 40C75 55 30 55 30 55" 
          stroke="url(#silverGradient)" 
          strokeWidth="12" 
          strokeLinecap="round"
          filter="url(#glow)"
        />
        {/* Bottom Curve */}
        <motion.path 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          d="M30 55C30 55 80 55 80 72.5C80 90 30 90 30 90" 
          stroke="url(#silverGradient)" 
          strokeWidth="12" 
          strokeLinecap="round"
          filter="url(#glow)"
        />
        {/* Vertical Backbone */}
        <motion.rect 
          initial={{ height: 0 }}
          animate={{ height: 65 }}
          transition={{ duration: 1, ease: "easeOut" }}
          x="24" y="25" width="12" height="65" 
          fill="url(#silverGradient)" 
          rx="2"
        />
      </svg>

      {showText && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 flex flex-col items-center"
        >
          <span className={`${size === 'xl' ? 'text-4xl' : 'text-xl'} font-bold tracking-tighter text-black`}>
            BrightLearn
          </span>
          {size === 'xl' && (
            <span className="mt-2 text-[8px] uppercase tracking-[0.5em] text-neutral-400 font-black">
              LEARN • UNDERSTAND • TRANSFORM
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
