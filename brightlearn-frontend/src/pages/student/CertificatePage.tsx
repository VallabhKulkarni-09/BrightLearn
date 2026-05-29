import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { certificateService } from '../../services/certificateService';
import { Certificate } from '../../types';

const CertificatePage: React.FC = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const { data } = await certificateService.getCertificateByEnrollment(Number(enrollmentId));
        setCertificate(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Certificate not found. Complete the course to earn your certificate.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificate();
  }, [enrollmentId]);

  const handlePrint = () => {
    window.print();
  };

  const verifyUrl = certificate
    ? `${window.location.origin}/verify/${certificate.certificateCode}`
    : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-3 tracking-tighter">Certificate Not Available</h2>
            <p className="text-neutral-500 text-sm mb-8 leading-relaxed">{error}</p>
            <Button onClick={() => navigate(-1)}>← Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Print-hidden controls */}
      <div className="no-print">
        <Navbar />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex flex-col items-center justify-center p-8 no-print-bg">
        {/* Action Bar - hidden on print */}
        <div className="no-print w-full max-w-5xl flex items-center justify-between pt-16 mb-8 z-20">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-neutral-500 hover:text-black">
            ← Back
          </Button>
          <div className="flex items-center space-x-3">
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-neutral-500 hover:text-black underline underline-offset-4 transition-colors"
            >
              Public Verification Link ↗
            </a>
            <Button onClick={handlePrint} className="bg-black text-white hover:bg-black/90 font-bold">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Download PDF
            </Button>
          </div>
        </div>

        {/* The Certificate */}
        <motion.div
          id="certificate"
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="certificate-paper w-full max-w-5xl bg-white shadow-2xl shadow-amber-900/10"
          style={{
            aspectRatio: '297/210',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Outer ornamental border */}
          <div className="absolute inset-0 border-[14px] border-amber-700/20" />
          {/* Inner ornamental border */}
          <div className="absolute inset-4 border-2 border-amber-600/40" />
          {/* Innermost thin border */}
          <div className="absolute inset-5 border border-amber-500/20" />

          {/* Corner ornaments */}
          {[
            'top-3 left-3',
            'top-3 right-3 rotate-90',
            'bottom-3 left-3 -rotate-90',
            'bottom-3 right-3 rotate-180',
          ].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-12 h-12 pointer-events-none`}>
              <svg viewBox="0 0 48 48" fill="none" className="w-full h-full text-amber-600/50">
                <path d="M4 4 L4 20 M4 4 L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M4 4 L12 12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
              </svg>
            </div>
          ))}

          {/* Background watermark pattern */}
          <div className="absolute inset-0 opacity-[0.025] select-none pointer-events-none flex items-center justify-center">
            <div className="text-[160px] font-black text-amber-900 tracking-tighter rotate-[-20deg] whitespace-nowrap">
              BrightLearn
            </div>
          </div>

          {/* Certificate Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-20 py-14 text-center z-10">

            {/* Header: Logo + Title */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <span className="text-lg font-black tracking-[0.3em] text-amber-800 uppercase">BrightLearn</span>
            </div>

            {/* Decorative line */}
            <div className="flex items-center w-64 mb-6">
              <div className="h-px flex-1 bg-amber-300/60" />
              <div className="mx-2 text-amber-400 text-lg">✦</div>
              <div className="h-px flex-1 bg-amber-300/60" />
            </div>

            {/* Certificate headline */}
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-700/70 mb-2">
              Certificate of Completion
            </p>
            <p className="text-sm text-neutral-400 font-medium mb-6">
              This is to certify that
            </p>

            {/* Student Name */}
            <h1
              className="text-5xl font-bold text-amber-900 tracking-tight mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {certificate.studentName}
            </h1>

            {/* Description */}
            <p className="text-sm text-neutral-500 font-medium mb-3">
              has successfully completed the course
            </p>

            {/* Course Title */}
            <h2 className="text-2xl font-bold text-black tracking-tighter mb-6 max-w-lg leading-tight">
              {certificate.courseTitle}
            </h2>

            {/* Decorative line */}
            <div className="flex items-center w-48 mb-6">
              <div className="h-px flex-1 bg-amber-200/80" />
              <div className="mx-2 text-amber-300 text-sm">◆</div>
              <div className="h-px flex-1 bg-amber-200/80" />
            </div>

            {/* Signatures row */}
            <div className="w-full flex items-end justify-between mt-2 px-8">
              {/* Instructor */}
              <div className="text-center">
                <div className="text-base font-bold text-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {certificate.instructorName}
                </div>
                <div className="h-px w-40 bg-neutral-300 my-1 mx-auto" />
                <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">Instructor</div>
              </div>

              {/* Center seal */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 bg-amber-50 flex items-center justify-center mb-1 shadow-md">
                  <svg className="w-8 h-8 text-amber-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-amber-700/60">Verified</div>
              </div>

              {/* Date */}
              <div className="text-center">
                <div className="text-base font-bold text-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {completionDate}
                </div>
                <div className="h-px w-40 bg-neutral-300 my-1 mx-auto" />
                <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">Issue Date</div>
              </div>
            </div>

            {/* Verification code footer */}
            <div className="mt-6 flex items-center space-x-2">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-300">Verification Code:</div>
              <div className="font-mono text-[11px] font-bold tracking-widest text-amber-700/70 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                {certificate.certificateCode}
              </div>
              <div className="text-[9px] text-neutral-300 font-medium">
                Verify at: {window.location.origin}/verify/{certificate.certificateCode}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Print-specific CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .no-print-bg {
            background: white !important;
            padding: 0 !important;
          }
          .certificate-paper {
            box-shadow: none !important;
            width: 100vw !important;
            max-width: 100vw !important;
            aspect-ratio: 297/210 !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
};

export default CertificatePage;
