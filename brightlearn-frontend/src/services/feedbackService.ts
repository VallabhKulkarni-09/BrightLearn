import api from './api';
import { SubmitFeedbackRequest, Feedback } from '../types';

export const feedbackService = {
  submitFeedback: (data: SubmitFeedbackRequest) => api.post<Feedback>('/feedback', data),
  getInstructorFeedback: () => api.get<Feedback[]>('/feedback/instructor'),
  getAllFeedback: () => api.get<Feedback[]>('/feedback/admin'),
};
