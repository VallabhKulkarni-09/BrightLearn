import api from './api';

export const quizService = {
  attemptQuiz: (quizId: number, selectedOptionIndex: number) => 
    api.post<boolean>(`/quizzes/${quizId}/attempt?selectedOptionIndex=${selectedOptionIndex}`),
};
