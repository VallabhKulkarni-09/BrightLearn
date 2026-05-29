import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';
interface ToastProps { message: string; type?: ToastType; onClose: () => void; }

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const icons = { success: '✓', error: '✕', info: '→' };

  return (
    <div className="fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-lg border border-neutral-200 
    bg-white text-black animate-slide-in-right shadow-xl shadow-black/5 flex items-center space-x-3">
      <span className="w-6 h-6 rounded-full border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-400">
        {icons[type]}
      </span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 opacity-30 hover:opacity-100 transition-opacity">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
