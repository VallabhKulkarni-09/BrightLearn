import api from './api';
import { CreateCourseRequest, Course } from '../types';

export const courseService = {
  getAllCourses: () => api.get<Course[]>('/courses'),
  createCourse: (data: CreateCourseRequest) => api.post<Course>('/courses', data),
  updateCourse: (id: number, data: CreateCourseRequest) => api.put<Course>(`/courses/${id}`, data),
  deleteCourse: (id: number) => api.delete(`/courses/${id}`),
};
