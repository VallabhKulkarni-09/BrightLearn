import api from './api';

export interface AnalyticsDataPoint {
  label: string;
  value: number;
}

export interface AnalyticsResponse {
  data: AnalyticsDataPoint[];
  comprehension?: AnalyticsDataPoint[];
  notesLogged?: AnalyticsDataPoint[];
  dwellFocus?: AnalyticsDataPoint[];
  sankeyFlow?: AnalyticsDataPoint[];
  dropoutRate?: number;
  quizFailureRate?: number;
  interactionCount?: number;
}

export const analyticsService = {
  getStudentAnalytics: () => api.get<AnalyticsResponse>('/analytics/student'),
  getInstructorAnalytics: () => api.get<AnalyticsResponse>('/analytics/instructor'),
};
