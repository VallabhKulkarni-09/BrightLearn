import api from './api';
import { EnrolledCourse, LessonProgress, AdminUser } from '../types';

export const enrollmentService = {
  enrollInCourse: (courseId: number) => api.post(`/enrollments/${courseId}`),
  getMyCourses: () => api.get<EnrolledCourse[]>('/enrollments/my'),
  getCourseProgress: (enrollmentId: number) =>
    api.get<LessonProgress[]>(`/enrollments/${enrollmentId}/progress`),
  updateLessonProgress: (enrollmentId: number, lessonId: number, completed: boolean) =>
    api.put(`/enrollments/${enrollmentId}/progress/${lessonId}`, { completed }),
  
  // New administrative & instructor enrollment actions
  unenrollSelf: (courseId: number) => api.delete(`/enrollments/${courseId}`),
  getEnrolledStudents: (courseId: number) => api.get<AdminUser[]>(`/enrollments/courses/${courseId}/students`),
  enrollStudentByAdmin: (courseId: number, studentId: number) => api.post(`/enrollments/courses/${courseId}/students/${studentId}`),
  removeStudent: (courseId: number, studentId: number) => api.delete(`/enrollments/courses/${courseId}/students/${studentId}`)
};
