import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from './common/Logo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full mt-auto border-t border-neutral-200/60 bg-white/40 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <Logo size="sm" />
              <span className="text-lg font-bold text-black tracking-tighter">BrightLearn</span>
            </Link>
            <p className="text-sm text-neutral-500 max-w-sm leading-relaxed">
              A premium, role-based learning sanctuary built for engineering mastery. Empowering students, instructors, and administrators to orchestrate education with seamless perfection.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="text-sm text-neutral-400 hover:text-black transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-neutral-400 hover:text-black transition-colors duration-300">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-neutral-400 hover:text-black transition-colors duration-300">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Social / Connect */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Connect</h4>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-black hover:text-white flex items-center justify-center text-neutral-600 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-[#0077b5] hover:text-white flex items-center justify-center text-neutral-600 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-black hover:text-white flex items-center justify-center text-neutral-600 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom border + copyright */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-neutral-400">
            &copy; {currentYear} BrightLearn LMS. Engineered for mastery.
          </p>
          <div className="flex space-x-6 text-xs text-neutral-400">
            <a href="#privacy" className="hover:text-black transition-colors duration-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-black transition-colors duration-300">Terms of Use</a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
