import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner, Skeleton } from '../../components/common/Spinner';
import { Toast, ToastType } from '../../components/common/Toast';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';
import { enrollmentService } from '../../services/enrollmentService';
import { noteService } from '../../services/noteService';
import { quizService } from '../../services/quizService';
import { LessonDiscussionPanel } from '../../components/LessonDiscussionPanel';
import { LessonProgress, EnrolledCourse } from '../../types';
import { FeedbackModal } from '../../components/FeedbackModal';
import confetti from 'canvas-confetti';


const CourseDetailPage: React.FC = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [activeLesson, setActiveLesson] = useState<LessonProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [courseInfo, setCourseInfo] = useState<EnrolledCourse | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);

  
  // Notes State
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const saveTimeoutRef = useRef<any | null>(null);

  // Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [localPassedQuizzes, setLocalPassedQuizzes] = useState<Set<number>>(new Set());
  const [showAnswer, setShowAnswer] = useState(false);

  const fetchProgress = async () => {
    try {
      const { data } = await enrollmentService.getCourseProgress(Number(enrollmentId));
      setLessons(data);
      if (!activeLesson && data.length > 0) setActiveLesson(data[0]);
      else if (activeLesson) {
        const updated = data.find(l => l.lessonId === activeLesson.lessonId);
        if (updated) setActiveLesson(updated);
      }

      // Fetch course metadata to find title and courseId
      const { data: myCourses } = await enrollmentService.getMyCourses();
      const currentCourse = myCourses.find(c => c.enrollmentId === Number(enrollmentId));
      if (currentCourse) {
        setCourseInfo(currentCourse);
      }

      return data;
    } catch {
      setToast({ message: 'Content stream interrupted.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };


  // Fetch note when active lesson changes
  useEffect(() => {
    if (!activeLesson) return;
    
    // Reset Quiz state
    setSelectedOption(null);
    setQuizError(null);
    setActiveQuizIndex(0);
    setLocalPassedQuizzes(new Set());
    setShowAnswer(false);
    
    const fetchNote = async () => {
      try {
        const { data } = await noteService.getNote(activeLesson.lessonId);
        setNoteContent(data.content || '');
      } catch (err) {
        // fail silently if note fetch fails
      }
    };
    fetchNote();
  }, [activeLesson?.lessonId]);

  // Auto-save note
  const handleNoteChange = (content: string) => {
    setNoteContent(content);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (!activeLesson) return;
      setIsSavingNote(true);
      try {
        await noteService.saveNote(activeLesson.lessonId, content);
      } catch (err) {
        setToast({ message: 'Failed to save note.', type: 'error' });
      } finally {
        setIsSavingNote(false);
      }
    }, 1000); // 1s debounce
  };

  useEffect(() => {
    fetchProgress();
  }, [enrollmentId]);

  const progressPercent = lessons.length > 0 
    ? Math.round((lessons.filter(l => l.completed).length / lessons.length) * 100) 
    : 0;

  useEffect(() => {
    if (progressPercent === 100 && !confettiFired && !isLoading) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setConfettiFired(true);
    }
  }, [progressPercent, confettiFired, isLoading]);


  // Auto-complete lessons without quizzes when viewed
  useEffect(() => {
    if (!activeLesson || !enrollmentId) return;
    
    if (activeLesson?.quizzes?.length === 0 && !activeLesson.completed) {
      const autoMarkComplete = async () => {
        try {
          await enrollmentService.updateLessonProgress(
            Number(enrollmentId),
            activeLesson.lessonId,
            true
          );
          await fetchProgress();
        } catch (err) {
          console.error("Auto-completion on view failed", err);
        }
      };
      autoMarkComplete();
    }
  }, [activeLesson?.lessonId, enrollmentId]);

  const handleSubmitQuiz = async () => {
    if (!activeLesson || activeLesson?.quizzes?.length === 0 || selectedOption === null) return;
    const currentQuiz = activeLesson.quizzes[activeQuizIndex];
    if (!currentQuiz) return;

    setIsSubmittingQuiz(true);
    setQuizError(null);
    try {
      const { data: isCorrect } = await quizService.attemptQuiz(currentQuiz.id, selectedOption);
      if (isCorrect) {
        setSelectedOption(null);
        
        const newPassed = new Set(localPassedQuizzes);
        newPassed.add(currentQuiz.id);
        setLocalPassedQuizzes(newPassed);
        
        const allPassed = activeLesson.quizzes.length > 0 && activeLesson.quizzes.every(q => newPassed.has(q.id));
        
        if (allPassed && !activeLesson.completed) {
          // All quizzes passed locally — auto-complete the lesson
          try {
            await enrollmentService.updateLessonProgress(
              Number(enrollmentId), 
              activeLesson.lessonId, 
              true
            );
            setToast({ 
              message: 'All questions answered correctly. Lesson mastery achieved!', 
              type: 'success' 
            });
            await fetchProgress();
          } catch (err) {
            console.error("Auto-completion update failed", err);
          }
        } else if (!allPassed) {
          setToast({ message: 'Correct! Keep going.', type: 'success' });

          // Auto-advance to the next incomplete question
          const nextIdx = activeLesson.quizzes.findIndex((q, idx) => idx > activeQuizIndex && !newPassed.has(q.id));
          if (nextIdx !== -1) {
            setActiveQuizIndex(nextIdx);
          } else {
            const firstIdx = activeLesson.quizzes.findIndex(q => !newPassed.has(q.id));
            if (firstIdx !== -1) {
              setActiveQuizIndex(firstIdx);
            }
          }
        }
      } else {
        setQuizError('Incorrect answer. Review the material and try again.');
      }
    } catch (err) {
      setToast({ message: 'Submission failed.', type: 'error' });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  // progressPercent is computed above, before the confetti useEffect

  const activeIndex = lessons.findIndex(l => l.lessonId === activeLesson?.lessonId);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col bg-noise overflow-hidden">
      {/* Immersive Top Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 h-1 px-0"
      >
        <div className="h-full bg-black/5 w-full">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.2)]"
          />
        </div>
      </motion.div>

      <Navbar />

      <div className="flex-1 flex pt-24 relative">
        {/* Dynamic Frosted Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-80 border-r border-black/5 glass relative z-40 h-[calc(100vh-6rem)] overflow-y-auto m-6 rounded-3xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-400">Curriculum</h2>
                  <span className="text-xs font-bold text-black">{progressPercent}%</span>
                </div>
                
                <div className="space-y-2">
                  {lessons.map((lesson, idx) => {
                    const isActive = activeLesson?.lessonId === lesson.lessonId;
                    
                    return (
                      <motion.button
                        key={lesson.lessonId}
                        onClick={() => setActiveLesson(lesson)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center space-x-4
                          ${isActive
                            ? 'bg-black text-white shadow-elevated' 
                            : 'hover:bg-zinc-50 text-neutral-400 cursor-pointer'}
                        `}
                      >
                        <div className={`
                          flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500
                          ${lesson.completed 
                            ? (isActive ? 'bg-white border-white' : 'bg-black border-black') 
                            : 'border-neutral-200'}
                        `}>
                          {lesson.completed && (
                            <motion.svg 
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className={`w-3 h-3 ${isActive ? 'text-black' : 'text-white'}`} 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <motion.path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M5 13l4 4L19 7" 
                              />
                            </motion.svg>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isActive ? 'text-white/50' : 'text-neutral-300'}`}>
                            Lesson {idx + 1}
                          </div>
                          <div className="text-xs font-bold truncate">{lesson.title}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* The Theatre View */}
        <main className="flex-1 relative overflow-y-auto px-12 pb-20">
          <AnimatePresence mode="wait">
            {activeLesson ? (
              <motion.div 
                key={activeLesson.lessonId}
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="max-w-5xl mx-auto"
              >
                <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
                      {activeLesson.contentType} Phase
                    </span>
                    <h1 className="text-4xl font-bold text-black tracking-tighter">
                      {activeLesson.title}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeedbackModalOpen(true)}
                      className="text-neutral-500 hover:text-black font-semibold text-xs border-black/10 hover:border-black/30"
                    >
                      Give Course Feedback
                    </Button>
                    {(progressPercent === 100 || courseInfo?.progress === 100) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/student/courses/${enrollmentId}/certificate`)}
                        className="bg-black text-white hover:bg-black/90 font-bold text-xs"
                      >
                        View Certificate 🎓
                      </Button>
                    )}
                  </div>
                </header>


                <div className="w-full relative group">
                  <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-elevated overflow-hidden min-h-[600px] flex flex-col">
                    <div className="flex-1 p-16 overflow-y-auto custom-scrollbar">
                      <motion.div 
                        key={activeLesson?.lessonId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                      >
                        <MarkdownRenderer content={activeLesson?.content || ''} />
                      </motion.div>
                    </div>                    {/* Quiz Section */}
                    {activeLesson?.quizzes && activeLesson.quizzes.length > 0 && (
                      <div className="p-12 border-t border-black/5 bg-white">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-400">Knowledge Check</h3>
                            <p className="text-xs text-neutral-400 mt-1">Master all questions to finish this lesson.</p>
                          </div>
                          
                          {/* Stepper Dots */}
                          <div className="flex items-center space-x-2">
                            {activeLesson?.quizzes?.map((q, idx) => {
                              const isPassed = activeLesson.completed || localPassedQuizzes.has(q.id);
                              return (
                                <button
                                  key={q.id}
                                  onClick={() => {
                                    setActiveQuizIndex(idx);
                                    setSelectedOption(null);
                                    setQuizError(null);
                                    setShowAnswer(false);
                                  }}
                                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                                    activeQuizIndex === idx 
                                      ? 'bg-black border-black text-white shadow-ambientScale scale-110' 
                                      : isPassed
                                        ? 'bg-green-50 border-green-200 text-green-600'
                                        : 'bg-zinc-50 border-neutral-200 text-neutral-400 hover:border-neutral-400'
                                  }`}
                                >
                                  {isPassed ? '✓' : idx + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Render Active Quiz Question */}
                        {(() => {
                          const currentQuiz = activeLesson.quizzes?.[activeQuizIndex];
                          if (!currentQuiz) return null;
                          const isPassed = activeLesson.completed || localPassedQuizzes.has(currentQuiz.id);

                          return (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <h4 className="text-xl font-bold text-black tracking-tight">{currentQuiz.question}</h4>
                                {isPassed && !activeLesson.completed && (
                                  <span className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center space-x-1">
                                    <span>✓ PASSED</span>
                                  </span>
                                )}
                                {activeLesson.completed && (
                                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center space-x-1">
                                    <span>✓ COMPLETED (REVIEW)</span>
                                  </span>
                                )}
                              </div>

                              <div className="space-y-3">
                                {JSON.parse(currentQuiz.options).map((option: string, i: number) => {
                                  const isSelected = selectedOption === i;
                                  const isCorrectOption = activeLesson.completed && showAnswer && i === currentQuiz.correctAnswerIndex;
                                  const isIncorrectOption = activeLesson.completed && showAnswer && isSelected && i !== currentQuiz.correctAnswerIndex;

                                  return (
                                    <button
                                      key={i}
                                      disabled={isPassed && !activeLesson.completed}
                                      onClick={() => setSelectedOption(i)}
                                      className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center space-x-4 ${
                                        isPassed && !activeLesson.completed
                                          ? 'border-neutral-100 bg-neutral-50/50 text-neutral-400 cursor-not-allowed'
                                          : isCorrectOption
                                            ? 'border-green-500 bg-green-50 text-green-800 shadow-elevated'
                                            : isIncorrectOption
                                              ? 'border-red-500 bg-red-50 text-red-800 shadow-elevated'
                                              : isSelected 
                                                ? 'border-black bg-black text-white shadow-elevated' 
                                                : 'border-black/10 hover:border-black/30 hover:bg-zinc-50 text-neutral-600'
                                      }`}
                                    >
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        isSelected ? 'border-white' : 'border-neutral-300'
                                      }`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>
                                      <span className="font-medium text-sm leading-relaxed">{option}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {quizError && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm font-medium mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
                                  {quizError}
                                </motion.div>
                              )}

                              {!activeLesson.completed && !isPassed && (
                                <Button 
                                  className="w-full mt-6" 
                                  onClick={handleSubmitQuiz} 
                                  disabled={selectedOption === null}
                                  isLoading={isSubmittingQuiz}
                                >
                                  Submit Answer
                                </Button>
                              )}

                              {activeLesson.completed && !showAnswer && (
                                <Button 
                                  variant="outline" 
                                  className="w-full mt-6" 
                                  onClick={() => setShowAnswer(true)}
                                >
                                  Show Answer
                                </Button>
                              )}

                              {isPassed && activeQuizIndex < (activeLesson?.quizzes?.length || 0) - 1 && (
                                <Button 
                                  variant="outline"
                                  className="w-full mt-6" 
                                  onClick={() => {
                                    setActiveQuizIndex(prev => prev + 1);
                                    setSelectedOption(null);
                                    setQuizError(null);
                                    setShowAnswer(false);
                                  }}
                                >
                                  Next Question →
                                </Button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Note Button at the bottom of lesson */}
                    <div className="p-8 border-t border-black/5 bg-zinc-50/50 flex justify-end">
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsNotesOpen(!isNotesOpen)}
                        className={`transition-all duration-300 ${isNotesOpen ? 'bg-black text-white' : 'text-neutral-400 hover:text-black'}`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {isNotesOpen ? 'Hide Notes' : 'Personal Notes'}
                      </Button>
                    </div>

                    {/* Integrated Notes Panel */}
                    <AnimatePresence>
                      {isNotesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                          className="overflow-hidden border-t border-black/5 bg-zinc-50"
                        >
                          <div className="p-12 space-y-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Your Private Workspace</h3>
                              <div className="flex items-center space-x-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isSavingNote ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                  {isSavingNote ? 'Syncing...' : 'Saved'}
                                </span>
                              </div>
                            </div>
                            <textarea
                              className="w-full min-h-[200px] bg-transparent resize-none outline-none text-base leading-relaxed text-neutral-600 placeholder:text-neutral-300"
                              placeholder="Capturing a breakthrough? Type it here... your notes are private and auto-saved."
                              value={noteContent}
                              onChange={(e) => handleNoteChange(e.target.value)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Reddit-Style QA/Discussion Panel */}
                <div className="mt-8 bg-white rounded-[2.5rem] border border-black/5 p-16 shadow-elevated">
                  <LessonDiscussionPanel lessonId={activeLesson.lessonId} />
                </div>

                <footer className="mt-16 flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveLesson(lessons[activeIndex - 1])}
                    disabled={activeIndex === 0}
                    className="space-x-4"
                  >
                    <span>←</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Previous Phase</span>
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {lessons.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'bg-black w-4' : 'bg-neutral-200'}`} 
                      />
                    ))}
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveLesson(lessons[activeIndex + 1])}
                    disabled={activeIndex === lessons.length - 1 || (activeLesson.quizzes && activeLesson.quizzes.length > 0 && !activeLesson.completed && !activeLesson.quizzes.every(q => localPassedQuizzes.has(q.id)))}
                    className="space-x-4 disabled:opacity-50"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {(activeLesson.quizzes && activeLesson.quizzes.length > 0 && !activeLesson.completed && !activeLesson.quizzes.every(q => localPassedQuizzes.has(q.id))) ? 'Complete Quiz to Advance' : 'Next Phase'}
                    </span>
                    <span>→</span>
                  </Button>
                </footer>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-neutral-300 font-medium italic">Select a sequence to begin.</p>
              </div>
            )}
          </AnimatePresence>
        </main>

        {/* Sidebar Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed bottom-12 left-12 z-50 w-12 h-12 glass rounded-full flex items-center justify-center shadow-elevated hover:scale-110 transition-transform duration-300"
        >
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      </div>

      {courseInfo && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          courseId={courseInfo.courseId}
          courseTitle={courseInfo.title}
          onSuccess={() => setToast({ message: 'Feedback submitted successfully!', type: 'success' })}
        />
      )}

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetailPage;
