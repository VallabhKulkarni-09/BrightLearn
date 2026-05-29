import api from './api';

export interface DiscussionComment {
  id: number;
  content: string;
  authorUsername: string;
  authorRole: string;
  parentId: number | null;
  createdAt: string;
  upvotes: number;
  hasUpvoted: boolean;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number | null;
}

export const discussionService = {
  getComments: (lessonId: number) => api.get<DiscussionComment[]>(`/lessons/${lessonId}/comments`),
  createComment: (lessonId: number, data: CreateCommentRequest) => api.post<DiscussionComment>(`/lessons/${lessonId}/comments`, data),
  upvoteComment: (commentId: number) => api.post<DiscussionComment>(`/lessons/comments/${commentId}/upvote`),
};
