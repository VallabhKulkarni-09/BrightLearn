import api from './api';
import { Lesson } from '../types';

export const lessonService = {
  getLessons: (courseId: number) => api.get<Lesson[]>(`/courses/${courseId}/lessons`),
  addLesson: (courseId: number, data: Omit<Lesson, 'id'>) => 
    api.post<Lesson>(`/courses/${courseId}/lessons`, data),
  updateLesson: (courseId: number, lessonId: number, data: Omit<Lesson, 'id'>) => 
    api.put<Lesson>(`/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId: number, lessonId: number) => 
    api.delete(`/courses/${courseId}/lessons/${lessonId}`)
};
