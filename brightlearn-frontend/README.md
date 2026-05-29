# BrightLearn LMS - Frontend Documentation

This document provides a comprehensive technical overview of the BrightLearn Learning Management System (LMS) client-side application. It is designed to be easily parsed and understood by LLMs and human developers alike.

---

## 1. Technical Stack

*   **Build Tool / Bundler:** Vite
*   **Library:** React 18 + TypeScript
*   **Routing:** React Router DOM v6
*   **Styling & UI:** Tailwind CSS v3 + CSS noise patterns
*   **Animations:** Framer Motion (for page transitions, loading states, and modal overlays)
*   **HTTP Client:** Axios (configured with interceptors for token refresh queueing)
*   **Icons:** Lucide React
*   **Feedback/Interactivity:** Canvas Confetti (celebrates course completion)

---

## 2. Directory & File Structure

The project code is situated under `src/`:

```text
src/
│
├── App.tsx                        # Root layout wrapping AuthProvider and AppRouter
├── main.tsx                       # Main entry point rendering App in StrictMode
├── index.css                      # Global styles, tailwind layers, animations, and dark glassmorphic utility classes
│
├── context/                       # React Contexts
│   └── AuthContext.tsx            # Global authentication state, login, logout, and token refresh init
│
├── routes/                        # Application routing
│   ├── AppRouter.tsx              # Router definition for public, private, and role-restricted routes
│   └── RoleRoute.tsx              # HOC guarding page access based on user role
│
├── components/                    # Reusable UI widgets and layout structures
│   ├── layout/                    # Global layouts
│   ├── ui/                        # Common elements (Spinners, Buttons, Inputs)
│   ├── Navbar.tsx                 # Responsive, role-aware top navigation bar
│   ├── Footer.tsx                 # Consistent, premium page footer with site maps
│   ├── CourseCard.tsx             # Renders course catalogs, progress bars, and CTAs
│   ├── FeedbackModal.tsx          # Portal modal for student/instructor site feedback submission
│   ├── ReviewModal.tsx            # Portal modal for course review star rating submissions
│   └── LessonDiscussionPanel.tsx  # Nested comments list displaying current lesson discussions
│
├── pages/                         # Route components (Pages)
│   ├── AboutPage.tsx              # Public statistics, platform features, and user guide
│   ├── LoginPage.tsx              # Sign In interface with username/password
│   ├── SignupPage.tsx             # Sign Up configuration with Role selectors
│   ├── ProfilePage.tsx            # Self-profile edit and password management page
│   ├── VerifyCertificatePage.tsx  # Public verification checker for certificates using UUID
│   │
│   ├── student/                   # Student layouts and dashboard
│   │   ├── StudentDashboard.tsx   # Catalog of available and active enrolled courses, analytics charts
│   │   ├── CourseDetailPage.tsx   # Content player (Video/Text) with quiz submission, discussions, and note-taking
│   │   └── CertificatePage.tsx    # Beautiful certificate preview with PDF download trigger
│   │
│   ├── instructor/                # Instructor page views
│   │   ├── InstructorDashboard.tsx# Course management, funnel analytics, and creation forms
│   │   └── LessonManagementPage.tsx# Reorderable, editable lists of lessons and quizzes under a course
│   │
│   └── admin/                     # System administrator pages
│       └── AdminDashboard.tsx     # User management (roles, toggle status), audit logging tables, and feedback views
│
├── services/                      # Axios API service integrations
│   ├── api.ts                     # Main Axios instance, interceptors, and queueing logic
│   ├── authService.ts             # Auth REST mappings (me, change-password, reset-password)
│   └── [Resource]Service.ts       # Specific API endpoints (courses, lessons, notes, enrollments)
│
├── types/                         # TypeScript interfaces
│   └── index.ts                   # Core interfaces (User, Course, Lesson, Enrollment, Comments, Logs)
│
└── utils/                         # Utility helpers
    └── tokenManager.ts            # Helper storing Access Token in-memory
```

---

## 3. Core Architectural flows

### 3.1 Advanced Authentication Flow

BrightLearn uses a hybrid storage scheme for optimal security:
*   **Access Token (JWT):** Kept exclusively in-memory (inside `tokenManager.ts`) to mitigate XSS (Cross-Site Scripting).
*   **Refresh Token (UUID/JWT):** Stored in `localStorage` to persist sessions.

#### Axios Interceptor Queueing Logic
The application utilizes an Axios HTTP interceptor in `src/services/api.ts` to manage token expirations transparently:

```text
HTTP Request (Access Token Attached)
           │
           ▼
[API Server returns 401 Unauthorized]
           │
           ▼
 Is token refresh already in progress?
       ├──► YES: Put request in promise queue (failedQueue), wait
       │
       └──► NO: Lock queue (isRefreshing = true), trigger POST /auth/refresh
                  │
                  ├───► Refresh Success: Update tokens, release queue with new token, retry original request
                  └───► Refresh Failed: Clear localStorage, redirect to /login, clear queue
```

### 3.2 Role-Based Routing (`RoleRoute`)

Protected routes are wrapped inside `<RoleRoute allowedRoles={['...']}>` inside [AppRouter.tsx](file:///c:/Users/vallabh.kulakarni1/project/brightlearn-frontend/src/routes/AppRouter.tsx).

```text
               Visitor Access Path
                       │
                       ▼
            Are they logged in?
               ├──► NO: Redirect to /login
               │
               └──► YES: Check role in User Profile (ADMIN, INSTRUCTOR, STUDENT)
                            │
                            ├───► Role is in allowedRoles: Render Component
                            └───► Role is NOT in allowedRoles: Redirect to '/' (default dashboard)
```

---

## 4. UI/UX Design System & Aesthetics

*   **Layout:** Responsive flex/grid system leveraging Tailwind CSS.
*   **Dark Mode / Futuristic Aesthetic:** Glassmorphism headers using CSS drop-shadow filters (`backdrop-blur-md`, custom gradients).
*   **Noise Texture:** Overlay background style classes configured in `index.css` to add subtle textures.
*   **Micro-interactions:** Framer motion controls:
    *   `<motion.div>` overlays with `initial={{ opacity: 0 }}` and `animate={{ opacity: 1 }}` for layout changes.
    *   Hover scale effects on buttons, interactive grids, and card components.
*   **Confetti Celebration:** Executed on `CourseDetailPage` immediately when progress changes from < 100% to 100%.

---

## 5. Local Setup & Build

### Prerequisites
*   Node.js 18.x or higher
*   npm 9.x or higher

### Environment Setup
Create a `.env` file in the root directory `brightlearn-frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### Running Locally
Run using `npm.cmd` on Windows (or standard `npm` on POSIX systems):
```powershell
# Install dependencies
npm.cmd install

# Run the development server
npm.cmd run dev
```
The server will boot up and default to `http://localhost:5173`.

### Production Build
Verify typescript and compile optimized build assets:
```powershell
npm.cmd run build
```
Build files will be generated under `dist/` directory.
