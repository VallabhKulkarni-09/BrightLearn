// --- Auth ---
export interface LoginRequest { 
  username: string; 
  password: string; 
}

export interface SignupRequest { 
  username: string; 
  email: string; 
  mobileNumber: string; 
  password: string; 
}

export interface AuthTokens { 
  accessToken: string; 
  refreshToken: string; 
}

export interface UserProfile {
  id: number; 
  username: string; 
  email: string;
  mobileNumber: string; 
  active: boolean; 
  roles: string[];
  bio?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  skills?: string;
  specialization?: string;
  experience?: string;
}

// --- Courses ---
export interface Course {
  id: number; 
  title: string; 
  description: string; 
  instructorUsername: string;
  thumbnailUrl?: string;
  learningOutcomes?: string;
}

export interface CreateCourseRequest { 
  title: string; 
  description: string; 
  thumbnailUrl?: string;
  learningOutcomes?: string;
}

export interface EnrolledCourse {
  courseId: number; 
  title: string; 
  description: string;
  instructorUsername: string; 
  enrollmentId: number; 
  enrollmentStatus: string;
  progress: number;
  thumbnailUrl?: string;
}



export interface Lesson {
  id: number;
  title: string;
  description?: string;
  content: string;
  sortOrder: number;
}

export interface LessonProgress {
  lessonId: number;
  title: string;
  content: string;
  completed: boolean;
  contentType: 'VIDEO' | 'PDF' | 'TEXT';
  quizzes: Quiz[];
}

export interface Quiz {
  id: number;
  question: string;
  options: string; // JSON string array
  correctAnswerIndex?: number;
}

// --- Reviews ---
export interface Review { 
  id: number; 
  studentUsername: string; 
  rating: number; 
  comment: string; 
}

// --- Admin ---
export interface AdminUser {
  id: number; 
  username: string; 
  email: string;
  mobileNumber: string; 
  active: boolean; 
  roles: string[];
}

export interface CreateInstructorRequest {
  username: string; 
  email: string; 
  mobileNumber: string; 
  password: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}

export interface UpdateUserStatusRequest {
  active: boolean;
}

// --- Audit ---
export interface AuditLog {
  id: number; 
  adminUsername: string; 
  action: string;
  target: string; 
  description: string; 
  timestamp: string;
}

// --- QA & Discussion ---
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

// --- Password Reset & Profiles ---
export interface PasswordResetRequest {
  id: number;
  username: string;
  note: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// --- Feedback ---
export interface SubmitFeedbackRequest {
  type: 'COURSE' | 'PLATFORM';
  courseId?: number;
  content: string;
  rating: number;
}

export interface Feedback {
  id: number;
  studentUsername: string;
  type: 'COURSE' | 'PLATFORM';
  courseId?: number;
  courseTitle?: string;
  content: string;
  rating: number;
  createdAt: string;
}

// --- Certificates ---
export interface Certificate {
  certificateCode: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
  instructorName: string;
}
