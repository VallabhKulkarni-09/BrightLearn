import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Toast, ToastType } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { certificateService } from '../services/certificateService';
import { FeedbackModal } from '../components/FeedbackModal';
import { Certificate } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'certificates'>('profile');
  const [profileForm, setProfileForm] = useState({
    email: '',
    mobileNumber: '',
    bio: '',
    avatarUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    skills: '',
    specialization: '',
    experience: '',
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        twitterUrl: user.twitterUrl || '',
        skills: user.skills || '',
        specialization: user.specialization || '',
        experience: user.experience || '',
      });

      if (user.roles.includes('STUDENT')) {
        fetchCertificates();
      }
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const { data } = await certificateService.getMyCertificates();
      setCertificates(data);
    } catch (err) {
      console.error('Failed to fetch certificates', err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authService.updateProfile(profileForm);
      await refreshUser();
      setToast({ message: 'Profile updated successfully.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setToast({ message: 'Passwords do not match.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setToast({ message: 'Password changed successfully.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Failed to change password.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintCertificate = (code: string) => {
    // Navigate to verification/display page or open custom tab
    window.open(`/verify/${code}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-50 bg-noise pb-32">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-40">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-black tracking-tighter mb-2">My Account</h1>
            <p className="text-neutral-400 text-sm">Manage your profile, settings, and credentials.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsFeedbackOpen(true)}>
            Platform Feedback
          </Button>
        </header>

        {/* Tab Selection */}
        <div className="flex space-x-2 mb-8 border-b border-neutral-200 pb-px">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'security', label: 'Security' },
            ...(user?.roles.includes('STUDENT') ? [{ id: 'certificates', label: 'Certificates' }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest relative ${
                activeTab === tab.id ? 'text-black' : 'text-neutral-400 hover:text-black'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeProfileTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="p-8 border-none bg-white">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Email Address"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                    <Input
                      label="Mobile Number"
                      type="text"
                      value={profileForm.mobileNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })}
                      required
                    />
                    <Input
                      label="Avatar Image URL"
                      type="text"
                      value={profileForm.avatarUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                    />
                    <Input
                      label="GitHub Profile URL"
                      type="text"
                      value={profileForm.githubUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                    />
                    <Input
                      label="LinkedIn Profile URL"
                      type="text"
                      value={profileForm.linkedinUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                    />
                    <Input
                      label="Twitter Profile URL"
                      type="text"
                      value={profileForm.twitterUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, twitterUrl: e.target.value })}
                    />
                    <Input
                      label="Specialization / Title"
                      type="text"
                      placeholder="e.g. Frontend Engineer, Data Scientist"
                      value={profileForm.specialization}
                      onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    />
                    <Input
                      label="Experience Details"
                      type="text"
                      placeholder="e.g. 5+ Years, Senior Developer"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Skills (comma separated)
                    </label>
                    <textarea
                      value={profileForm.skills}
                      onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                      placeholder="React, Java, Spring Boot, UI/UX"
                      rows={2}
                      className="w-full px-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 rounded-xl text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 rounded-xl text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button variant="primary" type="submit" isLoading={isSubmitting}>
                      Save Profile
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="p-8 border-none bg-white max-w-xl mx-auto">
                <form onSubmit={handleSecuritySubmit} className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    required
                  />
                  <div className="flex justify-end">
                    <Button variant="primary" type="submit" isLoading={isSubmitting}>
                      Change Password
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {certificates.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-200 rounded-3xl bg-white">
                  <p className="text-neutral-400 italic text-sm">You haven't earned any certificates yet.</p>
                  <p className="text-xs text-neutral-400 mt-2">Complete all lessons in a course to earn a certificate.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {certificates.map((cert) => (
                    <Card key={cert.certificateCode} className="p-6 border-none bg-white flex justify-between items-center group">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                          Verified Credential
                        </span>
                        <h3 className="text-lg font-bold text-black tracking-tight mt-1 mb-2">
                          {cert.courseTitle}
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Code: <span className="font-mono text-black font-semibold">{cert.certificateCode}</span>
                          <span className="mx-2">•</span>
                          Issued: {new Date(cert.completionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintCertificate(cert.certificateCode)}
                        >
                          View & Print
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
