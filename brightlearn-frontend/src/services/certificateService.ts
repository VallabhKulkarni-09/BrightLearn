import api from './api';
import { Certificate } from '../types';

export const certificateService = {
  getMyCertificates: () => api.get<Certificate[]>('/certificates/my'),
  getCertificateByEnrollment: (enrollmentId: number) => api.get<Certificate>(`/certificates/enrollment/${enrollmentId}`),
  verifyCertificate: (code: string) => api.get<Certificate>(`/certificates/verify/${code}`),
};
