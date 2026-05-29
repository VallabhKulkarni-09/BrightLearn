import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from './common/Button';
import { Logo } from './common/Logo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/student', label: 'Explore', roles: ['STUDENT'] },
    { path: '/instructor', label: 'Instructor', roles: ['INSTRUCTOR'] },
    { path: '/admin', label: 'Admin', roles: ['ADMIN'] },
    { path: '/about', label: 'About', roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-8 py-6"
    >
      <div className="max-w-7xl mx-auto glass rounded-2xl px-8 py-4 flex items-center justify-between shadow-ambient">
        <Link to="/" className="flex items-center space-x-3 group">
          <Logo size="sm" />
          <span className="text-lg font-bold text-black tracking-tighter">BrightLearn</span>
        </Link>

        <div className="flex items-center space-x-12">
          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.filter(link => link.roles.some(r => user.roles.includes(r))).map(link => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`
                      text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group
                      ${location.pathname === link.path ? 'text-black' : 'text-neutral-400 hover:text-black'}
                    `}
                  >
                    {link.label}
                    <motion.div 
                      initial={false}
                      animate={{ width: location.pathname === link.path ? '100%' : '0%' }}
                      className="absolute -bottom-1 left-0 h-px bg-black group-hover:w-full transition-all duration-300"
                    />
                  </Link>
                ))}
              </div>

              <div className="flex items-center space-x-6 border-l border-neutral-100 pl-12">
                <div 
                  className="flex flex-col items-end cursor-pointer group"
                  onClick={() => navigate('/profile')}
                >
                  <span className="text-xs font-bold text-black group-hover:underline">{user.username}</span>
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-black">{user.roles[0]}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="!px-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-8">
                <Link 
                  to="/about" 
                  className={`
                    text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group
                    ${location.pathname === '/about' ? 'text-black' : 'text-neutral-400 hover:text-black'}
                  `}
                >
                  About
                  <motion.div 
                    initial={false}
                    animate={{ width: location.pathname === '/about' ? '100%' : '0%' }}
                    className="absolute -bottom-1 left-0 h-px bg-black group-hover:w-full transition-all duration-300"
                  />
                </Link>
              </div>

              <div className="flex items-center space-x-4 border-l border-neutral-100 pl-8">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-xs uppercase tracking-wider font-bold !px-4">
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')} className="text-xs uppercase tracking-wider font-bold !px-4">
                  Sign Up
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};
