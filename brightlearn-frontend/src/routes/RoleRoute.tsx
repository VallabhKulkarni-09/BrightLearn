import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasPermission = user.roles.some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    // Redirect to their default dashboard if they have the wrong role
    const defaultPath = user.roles.includes('ADMIN') ? '/admin' : 
                        user.roles.includes('INSTRUCTOR') ? '/instructor' : '/student';
    return <Navigate to={defaultPath} replace />;
  }

  return <>{children}</>;
};
