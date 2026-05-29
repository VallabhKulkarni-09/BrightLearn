import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { Toast, ToastType } from '../../components/common/Toast';
import { courseService } from '../../services/courseService';
import { analyticsService, AnalyticsDataPoint } from '../../services/analyticsService';
import { enrollmentService } from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';
import { Course, Feedback } from '../../types';
import { feedbackService } from '../../services/feedbackService';
import { motion } from 'framer-motion';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [analyticsResponse, setAnalyticsResponse] = useState<any | null>(null);
  const [instructorFeedback, setInstructorFeedback] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showFeedbackSection, setShowFeedbackSection] = useState(false);

  const [formData, setFormData] = useState({ title: '', description: '', thumbnailUrl: '', learningOutcomes: '' });
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Only image files are supported.', type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image size must be less than 5MB.', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setFormData(prev => ({ ...prev, thumbnailUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Student Enrollment Management States
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const handleManageStudents = async (course: Course) => {
    setSelectedCourse(course);
    setStudentModalOpen(true);
    setModalLoading(true);
    try {
      const { data } = await enrollmentService.getEnrolledStudents(course.id);
      setEnrolledStudents(data);
    } catch (err) {
      setToast({ message: 'Failed to retrieve active course roster.', type: 'error' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: number, studentUsername: string) => {
    if (!selectedCourse) return;
    if (!confirm(`Are you sure you want to unenroll student @${studentUsername} from "${selectedCourse.title}"?`)) return;
    try {
      await enrollmentService.removeStudent(selectedCourse.id, studentId);
      setToast({ message: `Successfully unenrolled @${studentUsername}.`, type: 'success' });
      // Refresh list
      const { data } = await enrollmentService.getEnrolledStudents(selectedCourse.id);
      setEnrolledStudents(data);
    } catch (err) {
      setToast({ message: 'Failed to unenroll student.', type: 'error' });
    }
  };

  const fetchCourses = async () => {
    try {
      const [{ data }, analyticsRes] = await Promise.all([
        courseService.getAllCourses(),
        analyticsService.getInstructorAnalytics()
      ]);
      setCourses(data);
      setAnalyticsResponse(analyticsRes.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch courses', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFeedback = async () => {
    if (showFeedbackSection) {
      setShowFeedbackSection(false);
      return;
    }
    setFeedbackLoading(true);
    setShowFeedbackSection(true);
    try {
      const { data } = await feedbackService.getInstructorFeedback();
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setInstructorFeedback(sorted);
    } catch (err) {
      setToast({ message: 'Failed to load course feedback', type: 'error' });
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({ title: '', description: '', thumbnailUrl: '', learningOutcomes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({ 
      title: course.title, 
      description: course.description, 
      thumbnailUrl: course.thumbnailUrl || '',
      learningOutcomes: course.learningOutcomes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, formData);
        setToast({ message: 'Course updated!', type: 'success' });
      } else {
        await courseService.createCourse(formData);
        setToast({ message: 'Course created!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      setToast({ message: 'Operation failed', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseService.deleteCourse(id);
      setToast({ message: 'Course deleted', type: 'success' });
      fetchCourses();
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Spinner size="lg" /></div>;

  const myCourses = courses.filter(c => c.instructorUsername === user?.username);

  return (
    <div className="min-h-screen bg-zinc-50 bg-grid bg-noise pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-28">
        <header className="flex items-center justify-between mb-12">
          <header className="mb-24 animate-fade-in-up">
            <h1 className="text-5xl font-bold text-black mb-4 tracking-tighter">Teaching Studio.</h1>
            <p className="text-neutral-400 text-lg font-medium tracking-tight">Curate your high-fidelity educational catalog.</p>
          </header>
          <Button onClick={openCreateModal}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Course
          </Button>
        </header>

        {/* Analytics Section */}
        {analyticsResponse && (
          <section className="mb-16">
            <div className="flex items-center space-x-4 mb-8">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-400">Classroom Funnel Analysis</h2>
              <div className="h-px flex-1 bg-black/5" />
            </div>

            {/* Metric KPI cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-black/5 flex items-center justify-between animate-fade-in">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-1">Dropout Rate</div>
                  <div className="text-3xl font-black text-black">{analyticsResponse.dropoutRate}%</div>
                </div>
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-black/5 flex items-center justify-between animate-fade-in">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-1">Quiz Failure Spotting</div>
                  <div className="text-3xl font-black text-black">{analyticsResponse.quizFailureRate}%</div>
                </div>
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-black/5 flex items-center justify-between animate-fade-in">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-1">Active Interactions</div>
                  <div className="text-3xl font-black text-black">{analyticsResponse.interactionCount}</div>
                </div>
                <div className="w-12 h-12 bg-zinc-100 text-black rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <Card className="p-8 border-none bg-white">
              {(() => {
                const sankeyData = analyticsResponse.sankeyFlow || [];
                if (sankeyData.length === 0) return null;
                const maxFlow = Math.max(...sankeyData.map((d: any) => d.value), 1);
                const stages = sankeyData.map((d: any, i: number) => {
                  const x = 60 + i * 220;
                  const nodeHeight = (d.value / maxFlow) * 120 + 20;
                  const y = 30 + (140 - nodeHeight) / 2;
                  return { label: d.label, value: d.value, x, y, h: nodeHeight };
                });

                const flowPaths = stages.map((stage: { label: string; value: number; x: number; y: number; h: number }, i: number) => {
                  if (i === stages.length - 1) return null;
                  const next = stages[i + 1];
                  const x1 = stage.x + 12;
                  const y1 = stage.y;
                  const h1 = stage.h;
                  const x2 = next.x;
                  const y2 = next.y;
                  const h2 = next.h;
                  const dx = 90;
                  return (
                    <g key={i}>
                      <path 
                        d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2} L ${x2} ${y2 + h2} C ${x2 - dx} ${y2 + h2}, ${x1 + dx} ${y1 + h1}, ${x1} ${y1 + h1} Z`} 
                        fill="rgba(0,0,0,0.06)" 
                      />
                      <foreignObject 
                        x={x1 + 65} 
                        y={(y1 + y2) / 2 + (h1 + h2) / 4 - 12} 
                        width="70" 
                        height="26"
                      >
                        <div className="bg-red-50/80 border border-red-100/50 text-red-500 text-[8px] font-black rounded-lg text-center py-1 uppercase tracking-wider">
                          -{stage.value - next.value} drop
                        </div>
                      </foreignObject>
                    </g>
                  );
                });

                return (
                  <div className="relative w-full overflow-x-auto">
                    <svg viewBox="0 0 800 200" className="w-full h-auto overflow-visible select-none">
                      {flowPaths}
                      {stages.map((stage: { label: string; value: number; x: number; y: number; h: number }, i: number) => (
                        <g key={i}>
                          <rect 
                            x={stage.x} 
                            y={stage.y} 
                            width="12" 
                            height={stage.h} 
                            rx="3" 
                            fill="black" 
                          />
                          <text 
                            x={stage.x + 6} 
                            y={stage.y - 10} 
                            textAnchor="middle" 
                            className="text-[9px] font-black fill-black"
                          >
                            {stage.value}
                          </text>
                          <text 
                            x={stage.x + 6} 
                            y={stage.y + stage.h + 16} 
                            textAnchor="middle" 
                            className="text-[9px] font-bold fill-neutral-400 uppercase tracking-widest"
                          >
                            {stage.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                );
              })()}
            </Card>
          </section>
        )}

        <section>
          <div className="flex items-center space-x-2 mb-8">
            <h2 className="text-2xl font-bold text-white">Your Courses</h2>
            <span className="text-slate-500 font-medium">({myCourses.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCourses.map((course) => (
              <Card key={course.id} className="p-0 overflow-hidden flex flex-col group border-none !bg-zinc-50/50">
                {course.thumbnailUrl && (
                  <div className="h-32 w-full overflow-hidden border-b border-black/5">
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-black mb-1 tracking-tight">{course.title}</h3>
                    <p className="text-neutral-400 text-xs mb-6 line-clamp-3">{course.description}</p>
                  </div>

                  <div className="flex flex-col space-y-2 mb-6">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate(`/instructor/courses/${course.id}/lessons`)}
                    >
                      Manage Content
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManageStudents(course)}
                    >
                      Manage Students
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3 pt-6 border-t border-black/5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditModal(course)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-neutral-400 hover:bg-black/5 hover:text-black"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {myCourses.length === 0 && (
            <div className="text-center py-24 glass rounded-2xl border-2 border-dashed border-slate-800">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-slate-500 mb-6">You haven't created any courses yet.</p>
              <Button onClick={openCreateModal} variant="outline" size="sm">
                Get Started
              </Button>
            </div>
          )}
        </section>

        {/* Course Feedback Section */}
        <section className="mt-16 mb-8">
          <div className="flex items-center space-x-4 mb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-400">Student Feedback</h2>
            <div className="h-px flex-1 bg-black/5" />
            <button
              onClick={handleLoadFeedback}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                showFeedbackSection
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:border-black/30 hover:text-black'
              }`}
            >
              {showFeedbackSection ? 'Hide Feedback' : 'View Feedback'}
            </button>
          </div>

          {showFeedbackSection && (
            <div className="animate-fade-in">
              {feedbackLoading ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
              ) : instructorFeedback.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-neutral-200">
                  <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3" />
                    </svg>
                  </div>
                  <p className="text-neutral-400 text-sm italic">No feedback received yet on your courses.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {instructorFeedback.map((fb) => (
                    <motion.div
                      key={fb.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-black text-sm">@{fb.studentUsername}</div>
                          <div className="text-xs text-neutral-400 mt-0.5">{fb.courseTitle}</div>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-400 font-black">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={s <= fb.rating ? 'text-amber-400' : 'text-neutral-200'}>★</span>
                          ))}
                          <span className="text-xs text-neutral-400 ml-1 font-bold">{fb.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed italic">"{fb.content}"</p>
                      <div className="mt-3 pt-3 border-t border-black/5 text-[10px] text-neutral-300 font-mono">
                        {new Date(fb.createdAt).toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Course Title" 
            placeholder="e.g. Master React & TypeScript"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-400">Description</label>
            <textarea
              className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 min-h-[120px]"
              placeholder="What will students learn in this course?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-400">What students learn from this course</label>
            <textarea
              className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 min-h-[100px]"
              placeholder="e.g. Learn the basics of React components.&#10;Master TypeScript advanced types.&#10;Build 3 fullstack web apps."
              value={formData.learningOutcomes}
              onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Course Cover Thumbnail</label>
            
            {formData.thumbnailUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video h-40 mx-auto">
                <img 
                  src={formData.thumbnailUrl} 
                  alt="Thumbnail preview" 
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:bg-red-50/10 font-bold"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: '' }))}
                  >
                    Remove Thumbnail
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  dragActive 
                    ? 'border-cyan-500 bg-cyan-500/5' 
                    : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('thumbnail-file-input')?.click()}
              >
                <input 
                  id="thumbnail-file-input"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <svg className="w-8 h-8 text-slate-500 mb-2 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-slate-400 font-medium text-center">
                  Drag and drop cover image here, or <span className="text-cyan-500 font-bold hover:underline">browse files</span>
                </p>
                <p className="text-[10px] text-slate-600 text-center mt-1">PNG, JPG, JPEG up to 5MB</p>
              </div>
            )}
          </div>
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button className="flex-1" isLoading={formLoading} type="submit">
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sleek Roster Management Modal */}
      <Modal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        title={selectedCourse ? `Manage Students: ${selectedCourse.title}` : 'Manage Students'}
      >
        {modalLoading ? (
          <div className="py-12 flex justify-center"><Spinner /></div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Enrolled Students ({enrolledStudents.length})</h3>
              {enrolledStudents.length === 0 ? (
                <p className="text-neutral-400 italic text-sm text-center py-6">No students are currently enrolled in this course.</p>
              ) : (
                <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {enrolledStudents.map((student) => (
                    <div key={student.id} className="py-4 flex items-center justify-between animate-fade-in">
                      <div>
                        <div className="font-bold text-black text-sm">@{student.username}</div>
                        <div className="text-xs text-neutral-400">{student.email}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:bg-red-50 font-bold text-xs !rounded-xl"
                        onClick={() => handleRemoveStudent(student.id, student.username)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <Button variant="primary" onClick={() => setStudentModalOpen(false)} className="w-full">
                Done
              </Button>
            </div>
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

export default InstructorDashboard;
