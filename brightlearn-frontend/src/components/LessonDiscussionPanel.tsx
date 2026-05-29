import React, { useEffect, useState } from 'react';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { discussionService, DiscussionComment } from '../services/discussionService';

interface LessonDiscussionPanelProps {
  lessonId: number;
}

export const LessonDiscussionPanel: React.FC<LessonDiscussionPanelProps> = ({ lessonId }) => {
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data } = await discussionService.getComments(lessonId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setIsSubmitting(true);
    try {
      await discussionService.createComment(lessonId, { content: newCommentText });
      setNewCommentText('');
      await fetchComments();
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentsByParent = comments.reduce((acc, comment) => {
    const parentId = comment.parentId || 0;
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(comment);
    return acc;
  }, {} as Record<number, DiscussionComment[]>);

  const topLevelComments = commentsByParent[0] || [];

  return (
    <div className="space-y-8 text-left">
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-black tracking-tight flex items-center space-x-2">
            <span>QA Discussion Hub</span>
            <span className="text-xs bg-zinc-100 text-zinc-600 rounded-full px-2.5 py-0.5 font-bold">
              {comments.length} comments
            </span>
          </h3>
          <p className="text-xs text-neutral-400">Ask questions, share breakthroughs, or help out other scholars.</p>
        </div>
      </div>

      <form onSubmit={handleSubmitComment} className="space-y-3">
        <textarea
          className="w-full bg-zinc-50 border border-black/5 rounded-2xl p-4 text-sm text-black placeholder:text-zinc-400 outline-none focus:border-black focus:ring-1 focus:ring-black min-h-[100px] transition-all"
          placeholder="Got a question or insight? Share it with the class..."
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!newCommentText.trim() || isSubmitting}
            isLoading={isSubmitting}
            className="!rounded-xl px-6"
          >
            Publish Comment
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : topLevelComments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-black/5 rounded-2xl bg-zinc-50/50">
          <p className="text-sm text-neutral-400 italic">No comments yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {topLevelComments.map((comment) => (
            <CommentNode 
              key={comment.id}
              comment={comment}
              commentsByParent={commentsByParent}
              lessonId={lessonId}
              onCommentAdded={fetchComments}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommentNodeProps {
  comment: DiscussionComment;
  commentsByParent: Record<number, DiscussionComment[]>;
  lessonId: number;
  onCommentAdded: () => void;
  depth: number;
}

const CommentNode: React.FC<CommentNodeProps> = ({ 
  comment, 
  commentsByParent, 
  lessonId, 
  onCommentAdded, 
  depth 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(comment.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(comment.hasUpvoted);

  // Sync state with comment changes
  useEffect(() => {
    setUpvoteCount(comment.upvotes);
    setHasUpvoted(comment.hasUpvoted);
  }, [comment.upvotes, comment.hasUpvoted]);

  const children = commentsByParent[comment.id] || [];

  const handleUpvote = async () => {
    try {
      const nextHasUpvoted = !hasUpvoted;
      setHasUpvoted(nextHasUpvoted);
      setUpvoteCount(prev => nextHasUpvoted ? prev + 1 : prev - 1);
      await discussionService.upvoteComment(comment.id);
    } catch (err) {
      console.error("Failed to upvote", err);
      // Revert state on failure
      setHasUpvoted(hasUpvoted);
      setUpvoteCount(comment.upvotes);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      await discussionService.createComment(lessonId, { 
        content: replyText,
        parentId: comment.id 
      });
      setReplyText('');
      setIsReplying(false);
      onCommentAdded();
    } catch (err) {
      console.error("Failed to submit reply", err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const isInstructor = comment.authorRole === 'INSTRUCTOR' || comment.authorRole === 'ADMIN';

  return (
    <div className="group relative animate-fade-in text-left">
      {depth > 0 && (
        <div 
          className="absolute top-0 bottom-0 left-[-24px] w-0.5 bg-black/5 group-hover:bg-cyan-500/20 transition-colors cursor-pointer"
          title="Collapse thread"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black select-none ${
          isInstructor 
            ? 'bg-black text-white ring-2 ring-black/10' 
            : 'bg-zinc-100 text-zinc-600 border border-black/5'
        }`}>
          {comment.authorUsername.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2 text-xs flex-wrap">
            <span className="font-bold text-black">@{comment.authorUsername}</span>
            {isInstructor && (
              <span className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full scale-90">
                Staff
              </span>
            )}
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-400">
              {new Date(comment.createdAt).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {!isCollapsed && (
            <div className="text-sm text-zinc-700 leading-relaxed py-1 whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          {isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(false)} 
              className="text-xs text-neutral-400 font-bold hover:text-black transition-colors"
            >
              [Thread collapsed • {children.length + 1} replies hidden]
            </button>
          )}

          {!isCollapsed && (
            <div className="flex items-center space-x-4 pt-1 text-xs">
              <button 
                onClick={handleUpvote}
                className={`flex items-center space-x-1 transition-colors font-bold ${
                  hasUpvoted ? 'text-cyan-500' : 'text-neutral-400 hover:text-black'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
                <span>{upvoteCount}</span>
              </button>

              <button 
                onClick={() => setIsReplying(!isReplying)}
                className={`font-bold transition-colors ${
                  isReplying ? 'text-black' : 'text-neutral-400 hover:text-black'
                }`}
              >
                Reply
              </button>
            </div>
          )}

          {isReplying && !isCollapsed && (
            <form onSubmit={handleSubmitReply} className="mt-3 space-y-2 pl-2 border-l-2 border-black/10">
              <textarea
                className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-xs text-black placeholder:text-zinc-400 outline-none focus:border-black focus:ring-1 focus:ring-black min-h-[70px] transition-all"
                placeholder={`Reply to @${comment.authorUsername}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoFocus
              />
              <div className="flex space-x-2 justify-end">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                  className="!rounded-lg text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!replyText.trim() || isSubmittingReply}
                  isLoading={isSubmittingReply}
                  className="!rounded-lg text-xs px-4"
                >
                  Post Reply
                </Button>
              </div>
            </form>
          )}

          {children.length > 0 && !isCollapsed && (
            <div className="pl-6 mt-4 space-y-4 border-l border-black/5">
              {children.map((childComment) => (
                <CommentNode 
                  key={childComment.id}
                  comment={childComment}
                  commentsByParent={commentsByParent}
                  lessonId={lessonId}
                  onCommentAdded={onCommentAdded}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
