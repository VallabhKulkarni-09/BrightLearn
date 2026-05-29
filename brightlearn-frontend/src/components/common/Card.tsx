import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the spotlight movement
  const smoothX = useSpring(mouseX, { stiffness: 500, damping: 50 });
  const smoothY = useSpring(mouseY, { stiffness: 500, damping: 50 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        relative group rounded-2xl overflow-hidden bg-white
        border border-neutral-100 hover:border-neutral-200
        shadow-ambient hover:shadow-elevated transition-colors duration-500
        ${className}
      `}
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${smoothX}px ${smoothY}px, rgba(0,0,0,0.03), transparent 40%)`,
        }}
      />
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};
