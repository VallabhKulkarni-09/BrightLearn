import api from './api';

export interface StudentNote {
  content: string;
}

export const noteService = {
  getNote: (lessonId: number) => api.get<StudentNote>(`/notes/${lessonId}`),
  saveNote: (lessonId: number, content: string) => api.put(`/notes/${lessonId}`, { content }),
};
