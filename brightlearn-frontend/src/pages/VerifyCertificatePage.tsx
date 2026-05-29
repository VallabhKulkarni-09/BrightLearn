import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Spinner } from '../components/common/Spinner';
import { certificateService } from '../services/certificateService';
import { Certificate } from '../types';

const VerifyCertificatePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!code) {
        setError('No verification code provided.');
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await certificateService.verifyCertificate(code);
        setCertificate(data);
      } catch (err: any) {
        setError(
          err.response?.status === 404
            ? 'This certificate code is not valid. Please check the code and try again.'
            : 'Unable to verify certificate at this time. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [code]);

  const completionDate = certificate
    ? new Date(certificate.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 flex flex-col">
      {/* Slim branded header */}
      <header className="w-full border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="text-sm font-black tracking-[0.2em] text-black uppercase">BrightLearn</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Certificate Verification
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            <Spinner size="lg" />
            <p className="text-sm text-neutral-400 font-medium">Verifying certificate authenticity…</p>
          </motion.div>
        ) : error ? (
          /* Invalid / Error State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md text-center"
          >
            <div className="bg-white rounded-3xl border border-red-100 shadow-lg shadow-red-500/5 p-10">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-black mb-2 tracking-tight">Verification Failed</h2>
              <p className="text-sm text-neutral-500 mb-6 leading-relaxed">{error}</p>
              <div className="bg-neutral-50 rounded-xl p-4 mb-6 border border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                  Code Checked
                </span>
                <span className="font-mono text-sm font-bold text-neutral-600 tracking-wider">{code}</span>
              </div>
              <Link
                to="/login"
                className="text-xs font-bold text-neutral-500 hover:text-black underline underline-offset-4 transition-colors"
              >
                Go to BrightLearn →
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Verified State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            <div className="bg-white rounded-3xl border border-green-100 shadow-xl shadow-green-500/5 overflow-hidden">
              {/* Green success header */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-100 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-200/50 shadow-lg shadow-green-500/10"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h2 className="text-xl font-bold text-green-900 mb-1 tracking-tight">Certificate Verified</h2>
                <p className="text-sm text-green-700/70 font-medium">
                  This certificate is authentic and issued by BrightLearn.
                </p>
              </div>

              {/* Certificate details */}
              <div className="p-8 space-y-6">
                <div className="space-y-5">
                  {/* Student */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-300 block mb-1">
                        Awarded To
                      </span>
                      <span className="text-lg font-bold text-black tracking-tight">
                        {certificate!.studentName}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="h-px bg-black/5" />

                  {/* Course */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-300 block mb-1">
                        Course Completed
                      </span>
                      <span className="text-base font-bold text-black tracking-tight">
                        {certificate!.courseTitle}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>

                  <div className="h-px bg-black/5" />

                  {/* Instructor */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-300 block mb-1">
                        Instructor
                      </span>
                      <span className="text-sm font-bold text-neutral-700">
                        {certificate!.instructorName}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center border border-violet-100">
                      <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>

                  <div className="h-px bg-black/5" />

                  {/* Date + Code */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-300 block mb-1">
                        Issued On
                      </span>
                      <span className="text-sm font-bold text-neutral-700">{completionDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-300 block mb-1 text-right">
                        Verification Code
                      </span>
                      <span className="font-mono text-sm font-bold tracking-wider text-black bg-green-50 px-2.5 py-1 rounded-lg border border-green-200/50 block text-right">
                        {certificate!.certificateCode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-neutral-50/50 border-t border-black/5 px-8 py-4 flex items-center justify-between">
                <span className="text-[10px] text-neutral-300 font-bold">
                  Powered by BrightLearn
                </span>
                <Link
                  to="/login"
                  className="text-[10px] font-bold text-neutral-400 hover:text-black uppercase tracking-widest transition-colors"
                >
                  Visit Platform →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white/50 backdrop-blur-xl py-4">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[10px] text-neutral-300 font-bold tracking-wider">
            © {new Date().getFullYear()} BrightLearn · Certificate Verification System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VerifyCertificatePage;
