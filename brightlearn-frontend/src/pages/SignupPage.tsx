import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Toast, ToastType } from '../components/common/Toast';
import { Logo } from '../components/common/Logo';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobileNumber: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.signup(formData);
      setToast({ message: 'Account initialized. Secure login required.', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Registration failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 bg-grid bg-noise p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-10">
          <Logo size="lg" showText className="mb-6" />
          <h1 className="text-2xl font-bold text-black mb-2 tracking-tighter">Join the Collective.</h1>
          <p className="text-neutral-400 text-sm font-medium tracking-tight">Provision your learning profile.</p>
        </div>

        <Card className="p-8 border-none !shadow-2xl !shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Identity" 
              placeholder="Username" 
              value={formData.username} 
              onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
              required 
            />
            <Input 
              label="Communication" 
              type="email" 
              placeholder="Email address" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              required 
            />
            <Input 
              label="Connectivity" 
              placeholder="Mobile number" 
              value={formData.mobileNumber} 
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} 
              required 
            />
            <Input 
              label="Security" 
              type="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required 
            />
            <Button type="submit" className="w-full h-12 mt-4" isLoading={isLoading}>
              Initialize Account
            </Button>
          </form>
          
          <div className="mt-8 flex flex-col space-y-3 items-center">
            <Link to="/login" className="text-neutral-400 hover:text-black text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">
              Existing Identity? Sign In →
            </Link>
            <Link to="/about" className="text-[9px] text-neutral-400 hover:text-black font-bold uppercase tracking-widest transition-colors pt-2 border-t border-neutral-100 w-28 text-center">
              About Platform
            </Link>
          </div>
        </Card>
      </motion.div>

      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-neutral-50 blur-[100px] pointer-events-none opacity-40" />

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

export default SignupPage;
