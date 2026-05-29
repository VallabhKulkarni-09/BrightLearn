import api from './api';
import { 
  AdminUser, 
  CreateInstructorRequest, 
  AuditLog, 
  UpdateUserRoleRequest, 
  UpdateUserStatusRequest,
  PasswordResetRequest
} from '../types';

export const adminService = {
  getAllUsers: () => api.get<AdminUser[]>('/admin/users'),
  getUser: (id: number) => api.get<AdminUser>(`/admin/users/${id}`),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  createInstructor: (data: CreateInstructorRequest) => api.post('/admin/instructor', data),
  updateUserRole: (userId: number, data: UpdateUserRoleRequest) =>
    api.put(`/admin/role/${userId}`, { roleName: data.role }),
  updateUserStatus: (userId: number, data: UpdateUserStatusRequest) =>
    api.put(`/admin/status/${userId}`, data),
  getAuditLogs: () => api.get<AuditLog[]>('/admin/audit'),
  getPasswordResets: () => api.get<PasswordResetRequest[]>('/admin/password-resets'),
  resolvePasswordReset: (requestId: number) => api.post<{ tempPassword: string }>(`/admin/password-resets/${requestId}/resolve`),
};
