import api from './api';
import { Review } from '../types';

export const reviewService = {
  // Submit review: rating (int 1-5) and comment as query params
  submitReview: (courseId: number, rating: number, comment: string) =>
    api.post(`/reviews/${courseId}`, null, { params: { rating, comment } }),

  getCourseReviews: (courseId: number) =>
    api.get<Review[]>(`/reviews/course/${courseId}`),
};
