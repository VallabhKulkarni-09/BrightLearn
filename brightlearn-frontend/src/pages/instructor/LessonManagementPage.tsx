import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { Toast, ToastType } from '../../components/common/Toast';
import { lessonService } from '../../services/lessonService';
import { Lesson } from '../../types';
import { LessonDiscussionPanel } from '../../components/LessonDiscussionPanel';
import { motion } from 'framer-motion';

const LessonManagementPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  
  const [activeDiscussionLesson, setActiveDiscussionLesson] = useState<Lesson | null>(null);
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);

  const handleOpenDiscussion = (lesson: Lesson) => {
    setActiveDiscussionLesson(lesson);
    setIsDiscussionModalOpen(true);
  };

  const [formData, setFormData] = useState<Omit<Lesson, 'id'>>({
    title: '',
    content: '',
    sortOrder: 0
  });

  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizzesList, setQuizzesList] = useState<Array<{
    id?: number;
    question: string;
    options: string[];
    correctAnswerIndex: number;
  }>>([]);

  const [currentQuestionData, setCurrentQuestionData] = useState<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
  }>({
    question: '',
    options: ['Option A', 'Option B'],
    correctAnswerIndex: 0
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const handleAddQuestionOption = () => {
    if (currentQuestionData.options.length >= 4) return;
    setCurrentQuestionData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const handleRemoveQuestionOption = (index: number) => {
    if (currentQuestionData.options.length <= 2) return;
    const newOptions = currentQuestionData.options.filter((_, i) => i !== index);
    setCurrentQuestionData(prev => ({
      ...prev,
      options: newOptions,
      correctAnswerIndex: prev.correctAnswerIndex >= newOptions.length ? 0 : prev.correctAnswerIndex
    }));
  };

  const handleQuestionOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestionData.options];
    newOptions[index] = value;
    setCurrentQuestionData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSaveQuestion = () => {
    if (!currentQuestionData.question.trim()) return;
    if (currentQuestionData.options.some(opt => !opt.trim())) return;

    if (editingQuestionIndex !== null) {
      const updated = [...quizzesList];
      updated[editingQuestionIndex] = currentQuestionData;
      setQuizzesList(updated);
      setEditingQuestionIndex(null);
    } else {
      setQuizzesList(prev => [...prev, currentQuestionData]);
    }

    // Reset workspace
    setCurrentQuestionData({
      question: '',
      options: ['Option A', 'Option B'],
      correctAnswerIndex: 0
    });
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index);
    setCurrentQuestionData(quizzesList[index]);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuizzesList(prev => prev.filter((_, i) => i !== index));
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
      setCurrentQuestionData({
        question: '',
        options: ['Option A', 'Option B'],
        correctAnswerIndex: 0
      });
    }
  };

  const fetchLessons = async () => {
    try {
      const { data } = await lessonService.getLessons(Number(courseId));
      setLessons(data);
    } catch (err) {
      setToast({ message: 'Failed to fetch lessons', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    // Validate quizzes if quiz is enabled
    if (hasQuiz) {
      if (quizzesList.length === 0) {
        setToast({ message: 'Please add at least one question to the quiz.', type: 'error' });
        setFormLoading(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        quizzes: hasQuiz ? quizzesList.map(q => ({
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswerIndex: q.correctAnswerIndex
        })) : []
      };

      if (editingLesson) {
        await lessonService.updateLesson(Number(courseId), editingLesson.id, payload);
        setToast({ message: 'Lesson updated!', type: 'success' });
      } else {
        await lessonService.addLesson(Number(courseId), {
          ...payload,
          sortOrder: lessons.length + 1
        });
        setToast({ message: 'Lesson added!', type: 'success' });
      }
      closeModal();
      fetchLessons();
    } catch (err) {
      setToast({ message: 'Action failed', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content,
      sortOrder: lesson.sortOrder
    });
    // @ts-ignore
    if (lesson.quizzes && lesson.quizzes.length > 0) {
      setHasQuiz(true);
      // @ts-ignore
      setQuizzesList(lesson.quizzes.map(q => ({
        id: q.id,
        question: q.question,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctAnswerIndex: q.correctAnswerIndex
      })));
    } else {
      setHasQuiz(false);
      setQuizzesList([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
    setFormData({ title: '', content: '', sortOrder: 0 });
    setHasQuiz(false);
    setQuizzesList([]);
    setEditingQuestionIndex(null);
    setCurrentQuestionData({ question: '', options: ['Option A', 'Option B'], correctAnswerIndex: 0 });
  };

  const handleDelete = async (lessonId: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await lessonService.deleteLesson(Number(courseId), lessonId);
      setToast({ message: 'Lesson deleted', type: 'success' });
      fetchLessons();
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 bg-grid bg-noise pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-28">
        <header className="flex items-center justify-between mb-12">
          <div>
            <Button variant="ghost" className="mb-4 text-neutral-600" onClick={() => navigate('/instructor')}>
              ← Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-black tracking-tight">Manage Lessons</h1>
            <p className="text-neutral-400 text-sm">Curate the learning content for your course</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lesson
          </Button>
        </header>

        <section className="space-y-4">
          {lessons.map((lesson, idx) => (
            <Card key={lesson.id} className="p-4 flex items-center justify-between bg-neutral-50 border-black/5">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-xs font-bold text-neutral-400 border border-neutral-200">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-black">{lesson.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black bg-black/5 px-2 py-0.5 rounded border border-black/10">
                      MARKDOWN
                    </span>
                    <span className="text-xs text-neutral-400 truncate max-w-xs">
                      {lesson.content?.substring(0, 50) || ''}...
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenDiscussion(lesson)}
                  className="p-2 text-neutral-400 hover:text-black hover:bg-black/5 rounded-lg transition-all duration-300 flex items-center space-x-1"
                  title="Lesson Q&A Discussion"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-widest pl-1">Q&A</span>
                </button>
                <button
                  onClick={() => handleEdit(lesson)}
                  className="p-2 text-neutral-400 hover:text-black hover:bg-black/5 rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}

          {lessons.length === 0 && (
            <div className="text-center py-32 border border-dashed border-neutral-100 rounded-3xl">
              <p className="text-neutral-300 font-medium italic">No lessons added yet. Click "Add Lesson" to start building your content.</p>
            </div>
          )}
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingLesson ? "Refine Lesson" : "Add New Phase"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Lesson Title"
            placeholder="e.g. Introduction to React Hooks"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Lesson Content (Markdown)
            </label>
            <textarea
              className="w-full bg-zinc-50/50 border border-black/5 rounded-2xl px-6 py-5 text-black min-h-[300px] outline-none focus:border-black transition-all duration-300 font-mono text-sm leading-relaxed"
              placeholder="# Introduction\n\nWrite your lesson here using Markdown..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
            <p className="text-[10px] text-neutral-400">Supports headers, code, images, and links.</p>
          </div>

          <div className="pt-8 border-t border-black/5">
            <div className="flex items-center space-x-3 mb-8 bg-zinc-50 p-4 rounded-xl border border-black/5">
              <input
                type="checkbox"
                id="hasQuiz"
                checked={hasQuiz}
                onChange={(e) => setHasQuiz(e.target.checked)}
                className="w-5 h-5 rounded-lg border-neutral-300 text-black focus:ring-black cursor-pointer"
              />
              <label htmlFor="hasQuiz" className="text-sm font-black text-black cursor-pointer uppercase tracking-tight">Include Knowledge Check (Quiz)</label>
            </div>

            {hasQuiz && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-6 pt-4 border-t border-black/5"
              >
                {/* Drafted Questions List */}
                {quizzesList.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                      Drafted Questions ({quizzesList.length})
                    </label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                      {quizzesList.map((q, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-black/5 bg-zinc-50/50 hover:bg-zinc-50 transition-all">
                          <div className="flex items-start space-x-3 flex-1 min-w-0 mr-4">
                            <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-black truncate">{q.question}</p>
                              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold mt-0.5">
                                {q.options.length} options • Correct: {q.options[q.correctAnswerIndex] || `Option ${q.correctAnswerIndex + 1}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditQuestion(idx)}
                              className="p-2 text-neutral-400 hover:text-black hover:bg-black/5 rounded-lg transition-all"
                              title="Edit Question"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(idx)}
                              className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Question"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question builder panel */}
                <div className="p-5 rounded-2xl border border-black/5 bg-zinc-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black">
                      {editingQuestionIndex !== null ? `Edit Question #${editingQuestionIndex + 1}` : 'Create New Question'}
                    </label>
                    {editingQuestionIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuestionIndex(null);
                          setCurrentQuestionData({ question: '', options: ['Option A', 'Option B'], correctAnswerIndex: 0 });
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-black transition-all"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <Input
                    label="Question Text"
                    placeholder="e.g. What does the useEffect dependency array regulate?"
                    value={currentQuestionData.question}
                    onChange={(e) => setCurrentQuestionData(prev => ({ ...prev, question: e.target.value }))}
                  />

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                      Options (Select correct radio)
                    </label>
                    {currentQuestionData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 group/opt">
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionData(prev => ({ ...prev, correctAnswerIndex: index }))}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            currentQuestionData.correctAnswerIndex === index
                              ? 'border-black bg-black text-white'
                              : 'border-neutral-200 text-transparent hover:border-neutral-400'
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all"
                          value={option}
                          onChange={(e) => handleQuestionOptionChange(index, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionOption(index)}
                          disabled={currentQuestionData.options.length <= 2}
                          className="p-2 text-neutral-300 hover:text-red-500 disabled:opacity-0 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddQuestionOption}
                      disabled={currentQuestionData.options.length >= 4}
                      className="w-full py-3 mt-2 border border-dashed border-neutral-200 rounded-xl text-xs font-bold text-neutral-400 hover:border-black hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neutral-200"
                    >
                      {currentQuestionData.options.length >= 4 ? 'Maximum 4 Options Reached' : '+ Add Another Option'}
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 !rounded-xl !h-11"
                    onClick={handleSaveQuestion}
                    disabled={!currentQuestionData.question.trim() || currentQuestionData.options.some(opt => !opt.trim())}
                  >
                    {editingQuestionIndex !== null ? '✓ Save Question Changes' : '+ Add Question to Quiz'}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button className="flex-1" isLoading={formLoading} type="submit">
              {editingLesson ? 'Save Changes' : 'Add Lesson'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDiscussionModalOpen}
        onClose={() => {
          setIsDiscussionModalOpen(false);
          setActiveDiscussionLesson(null);
        }}
        title={`Q&A Discussion Hub - ${activeDiscussionLesson?.title || ''}`}
      >
        {activeDiscussionLesson && (
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <LessonDiscussionPanel lessonId={activeDiscussionLesson.id} />
          </div>
        )}
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default LessonManagementPage;
