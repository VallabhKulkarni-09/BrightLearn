import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Toast, ToastType } from '../components/common/Toast';
import { Logo } from '../components/common/Logo';
import { authService } from '../services/authService';

const LoginPage: React.FC = () => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [resetNote, setResetNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Invalid credentials', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUsername.trim()) {
      setToast({ message: 'Please enter your username', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await authService.submitResetRequest({
        username: resetUsername,
        note: resetNote,
      });
      setToast({ message: 'Password reset request submitted successfully.', type: 'success' });
      setResetUsername('');
      setResetNote('');
      setView('login');
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Failed to submit reset request', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 bg-grid bg-noise p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-12">
          <Logo size="xl" showText className="mb-8" />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-black mb-3 tracking-tighter"
          >
            {view === 'login' ? 'Mastery, Engineered.' : 'Recovery Portal'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-neutral-400 text-sm tracking-tight font-medium"
          >
            {view === 'login' 
              ? 'Sign in to your private learning sanctuary.' 
              : 'Submit a password reset request to the administrators.'}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.5 }}
        >
          <Card className="p-10 border-none !shadow-2xl !shadow-black/5">
            {view === 'login' ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input 
                    label="Identity" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                  <div className="space-y-1">
                    <Input 
                      label="Security" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setView('forgot')}
                        className="text-[10px] font-bold text-neutral-400 hover:text-black uppercase tracking-widest transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 !rounded-xl text-base" isLoading={isLoading}>
                    Authorize Access
                  </Button>
                </form>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-10 flex flex-col space-y-3 items-center"
                >
                  <Link to="/signup" className="text-neutral-400 hover:text-black text-xs font-bold uppercase tracking-widest transition-colors">
                    Initialize Account →
                  </Link>
                  <Link to="/about" className="text-[9px] text-neutral-400 hover:text-black font-bold uppercase tracking-widest transition-colors pt-2 border-t border-neutral-100 w-28 text-center">
                    About Platform
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <form onSubmit={handleResetSubmit} className="space-y-6">
                  <Input 
                    label="Username" 
                    placeholder="Username" 
                    value={resetUsername} 
                    onChange={(e) => setResetUsername(e.target.value)} 
                    required 
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Reason / Note
                    </label>
                    <textarea
                      value={resetNote}
                      onChange={(e) => setResetNote(e.target.value)}
                      placeholder="e.g. Forgot my password. Please reset."
                      rows={3}
                      className="w-full px-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 rounded-xl text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 !rounded-xl text-base" isLoading={isLoading}>
                    Submit Request
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <button 
                    type="button" 
                    onClick={() => setView('login')}
                    className="text-neutral-400 hover:text-black text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Atmospheric Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neutral-50 blur-[120px] pointer-events-none opacity-50" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-neutral-50 blur-[120px] pointer-events-none opacity-50" />

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
