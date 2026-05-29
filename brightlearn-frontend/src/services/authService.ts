import api from './api';
import { SignupRequest } from '../types';

export const authService = {
  signup: (data: SignupRequest) => api.post('/auth/signup', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  submitResetRequest: (data: { username: string; note: string }) => api.post('/auth/reset-request', data),
};
