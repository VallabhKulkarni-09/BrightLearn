import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { reviewService } from '../services/reviewService';
import { Toast, ToastType } from '../components/common/Toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, courseId, courseTitle }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await reviewService.submitReview(courseId, rating, comment);
      setToast({ message: 'Review submitted! Thank you.', type: 'success' });
      setTimeout(onClose, 2000);
    } catch (err) {
      setToast({ message: 'Failed to submit review', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review: ${courseTitle}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Rating (1-5)</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 
                  ${rating >= star ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-300 hover:bg-neutral-100'}`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Your Feedback</label>
          <textarea
            className="w-full bg-transparent border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 outline-none focus:border-white/30 focus:bg-white/[0.02] transition-all duration-300 min-h-[100px]"
            placeholder="Tell us what you thought about the course..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <div className="flex space-x-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose} type="button">Cancel</Button>
          <Button className="flex-1" isLoading={isLoading} type="submit">Submit Review</Button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Modal>
  );
};
