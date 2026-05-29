import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { RoleRoute } from './RoleRoute';
import { Spinner } from '../components/common/Spinner';

// Pages
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import CourseDetailPage from '../pages/student/CourseDetailPage';
import InstructorDashboard from '../pages/instructor/InstructorDashboard';
import LessonManagementPage from '../pages/instructor/LessonManagementPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProfilePage from '../pages/ProfilePage';
import CertificatePage from '../pages/student/CertificatePage';
import VerifyCertificatePage from '../pages/VerifyCertificatePage';
import AboutPage from '../pages/AboutPage';

export const AppRouter = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white bg-noise">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" replace />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Protected Student Routes */}
        <Route path="/student" element={
          <RoleRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
            <StudentDashboard />
          </RoleRoute>
        } />
        <Route path="/student/courses/:enrollmentId" element={
          <RoleRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
            <CourseDetailPage />
          </RoleRoute>
        } />
        <Route path="/student/courses/:enrollmentId/certificate" element={
          <RoleRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
            <CertificatePage />
          </RoleRoute>
        } />
        <Route path="/profile" element={
          <RoleRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
            <ProfilePage />
          </RoleRoute>
        } />

        {/* Protected Instructor Routes */}
        <Route path="/instructor" element={
          <RoleRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
            <InstructorDashboard />
          </RoleRoute>
        } />
        <Route path="/instructor/courses/:courseId/lessons" element={
          <RoleRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
            <LessonManagementPage />
          </RoleRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </RoleRoute>
        } />
        
        {/* Public Certificate Verification Route */}
        <Route path="/verify/:code" element={<VerifyCertificatePage />} />

        {/* Root Redirect Logic */}
        <Route path="/" element={
          !user ? <Navigate to="/login" replace /> :
          user.roles.includes('ADMIN') ? <Navigate to="/admin" replace /> :
          user.roles.includes('INSTRUCTOR') ? <Navigate to="/instructor" replace /> :
          <Navigate to="/student" replace />
        } />

        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};
