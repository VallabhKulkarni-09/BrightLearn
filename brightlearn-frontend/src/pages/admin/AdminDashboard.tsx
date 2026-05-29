import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import { Toast, ToastType } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services/adminService';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { AdminUser, AuditLog, PasswordResetRequest, Feedback } from '../../types';
import { feedbackService } from '../../services/feedbackService';


const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'instructor' | 'audit' | 'resets' | 'feedback'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [resets, setResets] = useState<PasswordResetRequest[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [resolvedTempPassword, setResolvedTempPassword] = useState<string | null>(null);
  const [tempPasswordModalOpen, setTempPasswordModalOpen] = useState(false);


  const [instructorForm, setInstructorForm] = useState({
    username: '',
    email: '',
    mobileNumber: '',
    password: ''
  });

  // Admin Student Enrollment/Roster Management States
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [studentToEnroll, setStudentToEnroll] = useState<string>('');
  const [enrollStudentLoading, setEnrollStudentLoading] = useState(false);

  const handleManageStudents = async (course: any) => {
    setSelectedCourse(course);
    setStudentModalOpen(true);
    setModalLoading(true);
    try {
      const { data } = await enrollmentService.getEnrolledStudents(course.id);
      setEnrolledStudents(data);
    } catch (err) {
      setToast({ message: 'Failed to retrieve active student roster.', type: 'error' });
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

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !studentToEnroll) return;
    setEnrollStudentLoading(true);
    try {
      await enrollmentService.enrollStudentByAdmin(selectedCourse.id, Number(studentToEnroll));
      setToast({ message: 'Student enrolled successfully.', type: 'success' });
      // Refresh list
      const { data } = await enrollmentService.getEnrolledStudents(selectedCourse.id);
      setEnrolledStudents(data);
      setStudentToEnroll('');
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Failed to enroll student.', type: 'error' });
    } finally {
      setEnrollStudentLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'users') {
        const { data } = await adminService.getAllUsers();
        setUsers(data);
      } else if (activeTab === 'courses') {
        const [{ data: coursesData }, { data: usersData }] = await Promise.all([
          courseService.getAllCourses(),
          adminService.getAllUsers()
        ]);
        setCourses(coursesData);
        setUsers(usersData);
      } else if (activeTab === 'audit') {
        const { data } = await adminService.getAuditLogs();
        // Sort: Recent first
        const sortedLogs = [...data].sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(sortedLogs);
      } else if (activeTab === 'resets') {
        const { data } = await adminService.getPasswordResets();
        const sortedResets = [...data].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setResets(sortedResets);
      } else if (activeTab === 'feedback') {
        const { data } = await feedbackService.getAllFeedback();
        const sortedFeedbacks = [...data].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setFeedbacks(sortedFeedbacks);
      }
    } catch (err) {
      setToast({ message: 'Failed to fetch data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveReset = async (requestId: number) => {
    try {
      const { data } = await adminService.resolvePasswordReset(requestId);
      setResolvedTempPassword(data.tempPassword);
      setTempPasswordModalOpen(true);
      setToast({ message: 'Password reset request resolved successfully', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Failed to resolve password reset', type: 'error' });
    }
  };


  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await adminService.updateUserStatus(user.id, { active: !user.active });
      setToast({ message: `User ${user.active ? 'deactivated' : 'activated'}`, type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Status update failed', type: 'error' });
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await adminService.updateUserRole(userId, { role });
      setToast({ message: 'Role updated', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Role update failed', type: 'error' });
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      setToast({ message: 'User deleted', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await adminService.createInstructor(instructorForm);
      setToast({ message: 'Instructor created successfully!', type: 'success' });
      setInstructorForm({ username: '', email: '', mobileNumber: '', password: '' });
      setActiveTab('users');
    } catch (err) {
      setToast({ message: 'Creation failed', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Permanently delete this course?')) return;
    try {
      await courseService.deleteCourse(id);
      setToast({ message: 'Course deleted', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 bg-grid bg-noise pb-32">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-28">
        <header className="mb-24 animate-fade-in-up">
          <h1 className="text-5xl font-bold text-black mb-4 tracking-tighter">Command Center.</h1>
          <p className="text-neutral-400 text-lg font-medium tracking-tight">Global system oversight and synchronization.</p>
        </header>

        <div className="flex flex-wrap gap-2 p-2 glass rounded-2xl w-fit mb-16 shadow-ambient">
          {(['users', 'courses', 'instructor', 'resets', 'feedback', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all duration-500 uppercase tracking-[0.2em] whitespace-nowrap
                ${activeTab === tab ? 'bg-black text-white shadow-elevated' : 'hover:bg-zinc-50 text-neutral-400'}`}
            >
              {tab === 'instructor' ? 'Provision' : tab === 'resets' ? 'Password Resets' : tab}
            </button>
          ))}
        </div>


        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'courses' && (
              <Card className="overflow-x-auto !border-none !shadow-2xl !shadow-black/[0.02]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.03] text-[9px] uppercase tracking-[0.3em] text-neutral-300 font-black">
                      <th className="px-6 py-4">Course Title</th>
                      <th className="px-6 py-4">Instructor</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-black/[0.02] transition-colors">
                        <td className="px-8 py-6 font-bold text-black tracking-tight">{course.title}</td>
                        <td className="px-8 py-6 text-black font-bold text-xs">@{course.instructorUsername}</td>
                        <td className="px-8 py-6 text-xs text-neutral-400 max-w-xs truncate">{course.description}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageStudents(course)}
                              className="text-xs font-bold px-3 py-1.5"
                            >
                              Students
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                              <svg className="w-4 h-4 text-neutral-400 hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {activeTab === 'users' && (
              <Card className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.03] text-[9px] uppercase tracking-[0.3em] text-neutral-300 font-black">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Roles</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-black">{user.username}</div>
                          <div className="text-xs text-neutral-400">ID: {user.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{user.email}</div>
                          <div className="text-xs text-neutral-400">{user.mobileNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map(r => (
                              <select
                                key={r}
                                value={r}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="bg-neutral-50 text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-200 outline-none focus:border-black/30 text-black"
                              >
                                <option value="STUDENT">STUDENT</option>
                                <option value="INSTRUCTOR">INSTRUCTOR</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-2 py-1 rounded text-[10px] font-black tracking-widest transition-colors
                              ${user.active ? 'bg-black/5 text-black border border-black/10' : 'bg-black/[0.02] text-neutral-400 border border-neutral-200'}`}
                          >
                            {user.active ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            <svg className="w-4 h-4 text-neutral-400 hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {activeTab === 'instructor' && (
              <div className="max-w-xl">
                <Card className="p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Register New Instructor</h2>
                  <form onSubmit={handleCreateInstructor} className="space-y-4">
                    <Input
                      label="Username"
                      value={instructorForm.username}
                      onChange={(e) => setInstructorForm({ ...instructorForm, username: e.target.value })}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={instructorForm.email}
                      onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                      required
                    />
                    <Input
                      label="Mobile Number"
                      value={instructorForm.mobileNumber}
                      onChange={(e) => setInstructorForm({ ...instructorForm, mobileNumber: e.target.value })}
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={instructorForm.password}
                      onChange={(e) => setInstructorForm({ ...instructorForm, password: e.target.value })}
                      required
                    />
                    <Button type="submit" className="w-full mt-4" isLoading={formLoading}>
                      Create Instructor Account
                    </Button>
                  </form>
                </Card>
              </div>
            )}

            {activeTab === 'audit' && (
              <Card className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.03] text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-black">
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Admin</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Target</th>
                      <th className="px-6 py-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.map((log) => (
                      <tr key={log.id} className="text-sm">
                        <td className="px-6 py-4 text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-black">@{log.adminUsername}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded bg-neutral-50 text-[10px] font-bold border border-neutral-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-black">{log.target}</td>
                        <td className="px-6 py-4 text-neutral-600 italic text-xs">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {activeTab === 'resets' && (
              <Card className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.03] text-[9px] uppercase tracking-[0.3em] text-neutral-300 font-black">
                      <th className="px-6 py-4">Username</th>
                      <th className="px-6 py-4">Reason / Note</th>
                      <th className="px-6 py-4">Requested At</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {resets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-neutral-400 italic">No password reset requests found.</td>
                      </tr>
                    ) : (
                      resets.map((req) => (
                        <tr key={req.id} className="hover:bg-black/[0.02] transition-colors text-sm">
                          <td className="px-6 py-4 font-bold text-black">@{req.username}</td>
                          <td className="px-6 py-4 text-neutral-600 max-w-md truncate">{req.note}</td>
                          <td className="px-6 py-4 text-neutral-400 font-mono">
                            {new Date(req.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest border
                              ${req.status === 'PENDING' 
                                ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                : 'bg-green-50 text-green-600 border-green-200'}`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {req.status === 'PENDING' ? (
                              <Button
                                size="sm"
                                onClick={() => handleResolveReset(req.id)}
                                className="text-xs font-bold px-3 py-1.5 bg-black hover:bg-black/85 text-white"
                              >
                                Resolve
                              </Button>
                            ) : (
                              <div className="text-xs text-neutral-400">
                                Resolved by {req.resolvedBy || 'admin'}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Card>
            )}

            {activeTab === 'feedback' && (
              <Card className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.03] text-[9px] uppercase tracking-[0.3em] text-neutral-300 font-black">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Feedback Content</th>
                      <th className="px-6 py-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {feedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-400 italic">No feedback submitted yet.</td>
                      </tr>
                    ) : (
                      feedbacks.map((fb) => (
                        <tr key={fb.id} className="hover:bg-black/[0.02] transition-colors text-sm">
                          <td className="px-6 py-4 font-bold text-black">@{fb.studentUsername}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest border
                              ${fb.type === 'PLATFORM' 
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}
                            >
                              {fb.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-xs max-w-[200px] truncate">
                            {fb.courseTitle || <span className="text-neutral-300">-</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-amber-400 font-bold">
                              {fb.rating} ★
                            </div>
                          </td>
                          <td className="px-6 py-4 text-neutral-600 max-w-sm whitespace-pre-wrap text-xs">
                            {fb.content}
                          </td>
                          <td className="px-6 py-4 text-neutral-400 font-mono text-xs">
                            {new Date(fb.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Card>
            )}

          </div>
        )}
      </main>

      {/* Premium Admin Student Roster Modal */}
      <Modal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        title={selectedCourse ? `Student Registry: ${selectedCourse.title}` : 'Student Registry'}
      >
        {modalLoading ? (
          <div className="py-12 flex justify-center"><Spinner /></div>
        ) : (
          <div className="space-y-8">
            {/* Enrollment Form */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Enroll New Student</h3>
              <form onSubmit={handleEnrollStudent} className="flex items-end space-x-3">
                <div className="flex-1 space-y-1.5">
                  <select
                    value={studentToEnroll}
                    onChange={(e) => setStudentToEnroll(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-black/30"
                    required
                  >
                    <option value="" disabled>Select student to enroll...</option>
                    {users
                      .filter(user => user.roles.includes('STUDENT') && !enrolledStudents.some(es => es.id === user.id))
                      .map(student => (
                        <option key={student.id} value={student.id}>
                          @{student.username} ({student.email})
                        </option>
                      ))}
                  </select>
                </div>
                <Button type="submit" isLoading={enrollStudentLoading} disabled={!studentToEnroll}>
                  Enroll
                </Button>
              </form>
            </div>

            {/* Active Enrolled Roster */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Active Roster ({enrolledStudents.length})</h3>
              {enrolledStudents.length === 0 ? (
                <p className="text-neutral-400 italic text-sm text-center py-6">No students are currently enrolled.</p>
              ) : (
                <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
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

      {/* Temp Password Reveal Modal */}
      <Modal
        isOpen={tempPasswordModalOpen}
        onClose={() => setTempPasswordModalOpen(false)}
        title="Password Reset Resolved"
      >
        <div className="space-y-6 py-4 text-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-neutral-500 text-sm">
              The user's password has been reset. Please provide them with this temporary password:
            </p>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-black select-all tracking-wider">
                {resolvedTempPassword}
              </span>
              <button
                onClick={() => {
                  if (resolvedTempPassword) {
                    navigator.clipboard.writeText(resolvedTempPassword);
                    setToast({ message: 'Copied to clipboard!', type: 'success' });
                  }
                }}
                className="text-xs font-bold text-neutral-500 hover:text-black uppercase tracking-wider"
              >
                Copy
              </button>
            </div>
            <p className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
              Note: This password will only be visible once. Keep it safe and share it securely.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-100">
            <Button variant="primary" onClick={() => setTempPasswordModalOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
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

export default AdminDashboard;
