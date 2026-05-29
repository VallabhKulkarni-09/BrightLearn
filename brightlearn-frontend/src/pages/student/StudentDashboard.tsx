import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CourseCard } from '../../components/CourseCard';
import { ReviewModal } from '../../components/ReviewModal';
import { Spinner, Skeleton } from '../../components/common/Spinner';
import { Toast, ToastType } from '../../components/common/Toast';
import { courseService } from '../../services/courseService';
import { lessonService } from '../../services/lessonService';
import { enrollmentService } from '../../services/enrollmentService';
import { analyticsService, AnalyticsDataPoint } from '../../services/analyticsService';
import { useAuth } from '../../context/AuthContext';
import { Course, EnrolledCourse, Lesson } from '../../types';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.roles.includes('STUDENT');
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 400], [0, -100]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [reviewCourse, setReviewCourse] = useState<{ id: number, title: string } | null>(null);
  const [analyticsResponse, setAnalyticsResponse] = useState<any | null>(null);
  const [activeMetricTab, setActiveMetricTab] = useState<'progress' | 'comprehension' | 'notes'>('progress');

  const [selectedCoursePreview, setSelectedCoursePreview] = useState<Course | null>(null);
  const [previewSyllabus, setPreviewSyllabus] = useState<Lesson[]>([]);
  const [syllabusLoading, setSyllabusLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [allRes, myRes, analyticsRes] = await Promise.all([
        courseService.getAllCourses(),
        isStudent ? enrollmentService.getMyCourses() : Promise.resolve({ data: [] }),
        isStudent ? analyticsService.getStudentAnalytics() : Promise.resolve({ data: {} })
      ]);
      setCourses(allRes.data);
      if (isStudent) {
        setMyCourses(myRes.data);
        setAnalyticsResponse(analyticsRes.data);
      }
    } catch {
      setToast({ message: 'System connectivity interruption.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCoursePreview) {
      const fetchSyllabus = async () => {
        setSyllabusLoading(true);
        try {
          const { data } = await lessonService.getLessons(selectedCoursePreview.id);
          setPreviewSyllabus(data);
        } catch (err) {
          console.error("Failed to fetch syllabus", err);
          setPreviewSyllabus([]);
        } finally {
          setSyllabusLoading(false);
        }
      };
      fetchSyllabus();
    } else {
      setPreviewSyllabus([]);
    }
  }, [selectedCoursePreview]);

  const handleEnroll = async (courseId: number) => {
    setEnrollLoading(courseId);
    try {
      await enrollmentService.enrollInCourse(courseId);
      setToast({ message: 'Enrollment sequence complete. Welcome to the course!', type: 'success' });
      setSelectedCoursePreview(null);
      // refresh enrollments and navigate to the new enrollment's classroom
      const { data: myRes } = await enrollmentService.getMyCourses();
      setMyCourses(myRes);
      const newEnrollment = myRes.find((e: any) => e.courseId === courseId);
      if (newEnrollment) {
        navigate(`/student/courses/${newEnrollment.enrollmentId}`);
      } else {
        // fallback: refresh data and navigate to course preview
        await fetchData();
        navigate(`/student/courses/${courseId}`);
      }
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Authorization failed.', type: 'error' });
    } finally {
      setEnrollLoading(null);
    }
  };

  const handleUnenroll = async (courseId: number, courseTitle: string) => {
    if (!confirm(`Are you sure you want to unenroll from "${courseTitle}"? All your progress and personal notes for this course will be permanently cleared.`)) return;
    try {
      await enrollmentService.unenrollSelf(courseId);
      setToast({ message: 'Unenrolled successfully.', type: 'success' });
      await fetchData();
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Failed to unenroll.', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white bg-noise">
        <Navbar />
        <main className="max-w-7xl mx-auto px-12 pt-32">
          <div className="space-y-4 mb-16">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 w-full" />)}
          </div>
        </main>
      </div>
    );
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 bg-noise pb-32">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-12 pt-40">
        {/* The Welcome Experience */}
        <motion.header 
          style={{ y: headerY, opacity: headerOpacity }}
          className="mb-24 flex items-end justify-between"
        >
          <div>
            <h1 className="text-5xl font-bold text-black mb-4 tracking-tighter">
              Good morning, {user?.username}.
            </h1>
            <p className="text-neutral-400 text-lg font-medium tracking-tight">
              Ready to continue your transformation?
            </p>
          </div>
          <div className="hidden lg:block text-right">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 block mb-2">Active Catalog</span>
            <span className="text-3xl font-bold text-black">{courses.length}</span>
          </div>
        </motion.header>

        {/* My Learning Path (If Student) */}
        {isStudent && myCourses.length > 0 && (
          <section className="mb-32">
            <div className="flex items-center space-x-4 mb-10">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-400">My Cockpit</h2>
              <div className="h-px flex-1 bg-black/5" />
            </div>
            
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {myCourses.map((mc) => (
                <motion.div key={mc.enrollmentId} variants={item}>
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') navigate(`/student/courses/${mc.enrollmentId}`); }}
                  >
                    <Card
                      className="p-8 border-none !bg-zinc-50/50 group cursor-pointer"
                      onClick={() => navigate(`/student/courses/${mc.enrollmentId}`)}
                    >
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-xl font-bold text-black tracking-tighter mb-1">{mc.title}</h3>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">@{mc.instructorUsername}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {!(mc.progress === 100 || mc.enrollmentStatus === 'COMPLETED') && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-neutral-400 hover:text-red-500 transition-colors"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleUnenroll(mc.courseId, mc.title); }}
                          >
                            Leave
                          </Button>
                        )}
                        {mc.progress === 100 || mc.enrollmentStatus === 'COMPLETED' ? (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/student/courses/${mc.enrollmentId}/certificate`); }}
                          >
                            View Certificate 🎓
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/student/courses/${mc.enrollmentId}`); }}>
                            Resume Sequence →
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                        <span>Progress</span>
                        <span className="text-black">{mc.progress || 0}%</span>
                      </div>
                      <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${mc.progress || 0}%` }}
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-black relative"
                        >
                          <div className="absolute right-0 top-0 h-full w-4 bg-white/20 blur-sm" />
                        </motion.div>
                      </div>
                    </div>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Analytics Section (If Student) */}
        {isStudent && analyticsResponse && (
          <section className="mb-32">
            <div className="flex items-center space-x-4 mb-10">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-400">Activity Analytics</h2>
              <div className="h-px flex-1 bg-black/5" />
            </div>

            {/* Metric Tabs */}
            <div className="flex space-x-2 mb-6">
              {[
                { id: 'progress', label: 'Lessons Completed' },
                { id: 'comprehension', label: 'Quiz Comprehension' },
                { id: 'notes', label: 'Study Notes Volume' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMetricTab(tab.id as any)}
                  className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 border border-black/5 ${
                    activeMetricTab === tab.id 
                      ? 'bg-black text-white border-black shadow-ambient' 
                      : 'bg-white text-neutral-400 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <Card className="p-8 border-none bg-white">
              {(() => {
                const points = activeMetricTab === 'progress' 
                  ? (analyticsResponse.data || []) 
                  : activeMetricTab === 'comprehension' 
                    ? (analyticsResponse.comprehension || []) 
                    : (analyticsResponse.notesLogged || []);
                
                if (points.length === 0) return null;

                const maxVal = Math.max(...points.map((p: any) => p.value), 1);
                const w = 800;
                const h = 200;
                const px = 50;
                const py = 30;

                let linePath = '';
                let areaPath = '';
                points.forEach((p: any, i: number) => {
                  const x = px + i * ((w - 2 * px) / (points.length - 1));
                  const y = h - py - (p.value / maxVal) * (h - 2 * py);
                  if (i === 0) {
                    linePath += `M ${x} ${y}`;
                  } else {
                    linePath += ` L ${x} ${y}`;
                  }
                });

                const startX = px;
                const endX = px + (points.length - 1) * ((w - 2 * px) / (points.length - 1));
                const bottomY = h - py;
                areaPath = `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;

                return (
                  <div className="relative w-full overflow-x-auto">
                    <svg viewBox="0 0 800 200" className="w-full h-auto overflow-visible select-none">
                      <defs>
                        <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(0, 0, 0, 0.12)" />
                          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      {[0, 1, 2, 3, 4].map(line => {
                        const y = py + line * ((h - 2 * py) / 4);
                        return (
                          <line 
                            key={line} 
                            x1={px} 
                            y1={y} 
                            x2={w - px} 
                            y2={y} 
                            stroke="rgba(0,0,0,0.05)" 
                            strokeWidth="1" 
                            strokeDasharray="4 4" 
                          />
                        );
                      })}

                      {/* Area */}
                      {areaPath && (
                        <motion.path 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8 }}
                          d={areaPath} 
                          fill="url(#area-gradient)" 
                        />
                      )}

                      {/* Line */}
                      {linePath && (
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          d={linePath} 
                          fill="none" 
                          stroke="black" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                        />
                      )}

                      {/* Points & Tooltips */}
                      {points.map((p: any, i: number) => {
                        const x = px + i * ((w - 2 * px) / (points.length - 1));
                        const y = h - py - (p.value / maxVal) * (h - 2 * py);
                        return (
                          <g key={i} className="group/point">
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="5" 
                              fill="black" 
                              stroke="white" 
                              strokeWidth="2" 
                              className="transition-all duration-300 hover:r-7 cursor-pointer"
                            />
                            <text
                              x={x}
                              y={y - 12}
                              textAnchor="middle"
                              className="text-[10px] font-black fill-black opacity-0 group-hover/point:opacity-100 transition-opacity duration-300 bg-white"
                            >
                              {p.value}{activeMetricTab === 'comprehension' ? '%' : ''}
                            </text>
                            <text
                              x={x}
                              y={h - 10}
                              textAnchor="middle"
                              className="text-[9px] font-bold fill-neutral-400 uppercase tracking-wider"
                            >
                              {p.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}
            </Card>
          </section>
        )}

        {/* Explore Courses */}
        <section>
          <div className="flex items-center space-x-4 mb-12">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-400">Global Catalog</h2>
            <div className="h-px flex-1 bg-black/5" />
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {courses.map((course) => (
              <motion.div 
                key={course.id} 
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              >
                <CourseCard 
                  course={course} 
                  isEnrolled={myCourses.some(mc => mc.courseId === course.id)} 
                  onEnroll={isStudent ? handleEnroll : undefined}
                  isLoading={enrollLoading === course.id}
                  onClick={() => setSelectedCoursePreview(course)}
                />
              </motion.div>
            ))}
          </motion.div>

          {courses.length === 0 && (
            <div className="text-center py-32 border border-dashed border-neutral-100 rounded-3xl">
              <p className="text-neutral-300 font-medium italic">Catalog is currently empty.</p>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {reviewCourse && (
          <ReviewModal 
            isOpen={!!reviewCourse} 
            onClose={() => setReviewCourse(null)} 
            courseId={reviewCourse.id} 
            courseTitle={reviewCourse.title} 
          />
        )}
      </AnimatePresence>

      {/* Course Detail & Curriculum Preview Modal */}
      <Modal
        isOpen={!!selectedCoursePreview}
        onClose={() => setSelectedCoursePreview(null)}
        title="Course Syllabus & Overview"
        size="xl"
      >
        {selectedCoursePreview && (
          <div className="space-y-6 -mt-2">
            {/* Header Banner */}
            <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-neutral-100/10 shadow-ambient flex items-center justify-center">
              {selectedCoursePreview.thumbnailUrl ? (
                <img 
                  src={selectedCoursePreview.thumbnailUrl} 
                  alt={selectedCoursePreview.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-neutral-900 to-black opacity-90" />
              )}
              <div className="relative z-10 px-8 text-center max-w-2xl">
                <span className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em] mb-2 block">Premium Curated Catalog</span>
                <h2 className="text-2xl font-black text-white tracking-tight line-clamp-2">{selectedCoursePreview.title}</h2>
                <p className="text-[11px] text-neutral-400 font-bold mt-2">Instructed by @{selectedCoursePreview.instructorUsername}</p>
              </div>
            </div>

            {/* Split Content layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Left Column: Description & Outcomes */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">About this Course</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedCoursePreview.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3">What you will learn</h3>
                  {selectedCoursePreview.learningOutcomes ? (
                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedCoursePreview.learningOutcomes.split('\n').filter(line => line.trim().length > 0).map((outcome, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 text-sm text-neutral-700 font-medium">
                          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black mt-0.5">✓</span>
                          <span>{outcome.replace(/^-\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-400 italic text-sm">No specific outcomes provided by the instructor yet.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Syllabus Curriculum timeline */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3">Course Curriculum</h3>
                {syllabusLoading ? (
                  <div className="py-12 flex justify-center"><Spinner /></div>
                ) : previewSyllabus.length === 0 ? (
                  <p className="text-neutral-400 italic text-sm py-8 text-center border border-dashed border-neutral-100 rounded-2xl">
                    No curriculum lessons drafted yet.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar relative pl-3 border-l-2 border-neutral-100">
                    {previewSyllabus.map((lesson, idx) => (
                      <div key={lesson.id} className="relative group animate-fade-in">
                        {/* Dot marker */}
                        <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-neutral-300 group-hover:bg-cyan-500 transition-colors duration-300 ring-4 ring-white" />
                        
                        <div>
                          <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Lesson {idx + 1}</div>
                          <h4 className="font-bold text-black text-sm tracking-tight">{lesson.title}</h4>
                          {lesson.description && (
                            <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="pt-6 border-t border-black/5 flex items-center justify-between">
              <div className="text-neutral-400 text-xs">
                {previewSyllabus.length} {previewSyllabus.length === 1 ? 'lesson' : 'lessons'} available
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedCoursePreview(null)}>
                  Close
                </Button>
                {myCourses.some(mc => mc.courseId === selectedCoursePreview.id) ? (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => {
                      setSelectedCoursePreview(null);
                      const enrolled = myCourses.find(mc => mc.courseId === selectedCoursePreview.id);
                      if (enrolled) {
                        navigate(`/student/courses/${enrolled.enrollmentId}`);
                      } else {
                        navigate(`/student/courses/${selectedCoursePreview.id}`);
                      }
                    }}
                  >
                    Go to Classroom
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleEnroll(selectedCoursePreview.id)}
                    isLoading={enrollLoading === selectedCoursePreview.id}
                  >
                    Enroll Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

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

export default StudentDashboard;
