import React, { useState } from 'react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { feedbackService } from '../services/feedbackService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: number;
  courseTitle?: string;
  onSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  onSuccess,
}) => {
  const isCourseFeedback = !!courseId;
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Feedback content cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await feedbackService.submitFeedback({
        type: isCourseFeedback ? 'COURSE' : 'PLATFORM',
        courseId,
        content,
        rating: isCourseFeedback ? rating : 0,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setContent('');
        setRating(5);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCourseFeedback ? `Course Feedback: ${courseTitle}` : 'Share Your Feedback'}
      size="md"
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-black mb-1">Thank you!</h3>
          <p className="text-sm text-neutral-500">Your feedback helps us make BrightLearn better.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {isCourseFeedback && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Rate this course
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="text-2xl transition-transform duration-150 hover:scale-125 focus:outline-none"
                  >
                    <span
                      className={
                        star <= (hoverRating ?? rating)
                          ? 'text-yellow-400'
                          : 'text-neutral-200'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
                <span className="text-xs font-bold text-neutral-500 ml-2">
                  {rating} of 5
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {isCourseFeedback ? 'Your Review' : 'Tell us about your experience'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isCourseFeedback
                  ? 'What did you like? What can be improved?'
                  : 'Let us know if you have any issues or suggestions...'
              }
              rows={4}
              className="w-full px-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 rounded-xl text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black transition-all duration-300 resize-none"
              required
            />
          </div>

          <div className="flex space-x-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Submit Feedback
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
