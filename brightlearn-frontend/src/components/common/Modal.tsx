import React from 'react';

interface ModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl shadow-black/10 border border-neutral-200 animate-scale-in`}>
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-black tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-neutral-300 hover:text-black transition-colors duration-200 hover:rotate-90 transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
