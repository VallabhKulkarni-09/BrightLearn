# BrightLearn LMS - React Frontend Client

This is the front-end application for the BrightLearn Learning Management System. It is built as a single-page application (SPA) using React, TypeScript, and Tailwind CSS, orchestrated by Vite.

---

## Technical Stack

*   **Build Tool:** Vite
*   **Core Library:** React 18 + TypeScript
*   **Routing:** React Router DOM (v6)
*   **Styling:** Tailwind CSS (v3)
*   **Animations:** Framer Motion (page transitions, interactive alerts, and modal overlays)
*   **HTTP Client:** Axios (configured with automated refresh token queueing)
*   **Icons:** Lucide React
*   **Extra Features:** Canvas Confetti (triggers on course completion)

---

## Project Structure

Our source files are organized under `src/`:

```text
src/
├── App.tsx                     # Entry component wrapping context and routes
├── main.tsx                    # React DOM mount point
├── index.css                   # Tailwind setup, animations, and custom glassmorphism styles
│
├── components/                 # Reusable UI components
│   ├── layout/                 # Structural page components
│   ├── ui/                     # Basic design inputs (buttons, cards, spinners, toasts)
│   ├── Navbar.tsx              # Dynamic navbar showing links based on role
│   ├── Footer.tsx              # Site footer with platform links
│   ├── CourseCard.tsx          # Card to display courses and progress bars
│   ├── FeedbackModal.tsx       # Modal for users to submit feedback
│   ├── ReviewModal.tsx         # Modal for students to submit course reviews
│   └── LessonDiscussionPanel.tsx # Discussion comment thread for lessons
│
├── context/                    # State management contexts
│   └── AuthContext.tsx         # Manages logged-in user, login, logout, and token startup check
│
├── hooks/                      # Custom hooks (e.g. useExample)
│
├── pages/                      # Page components mapped to router paths
│   ├── LoginPage.tsx           # Login screen
│   ├── SignupPage.tsx          # Signup screen with role selector
│   ├── AboutPage.tsx           # Public platform details and stats
│   ├── ProfilePage.tsx         # User settings and password updates
│   ├── VerifyCertificatePage.tsx # Public certificate validator
│   │
│   ├── student/                # Pages for student role
│   │   ├── StudentDashboard.tsx   # Dashboard listing courses and analytics
│   │   ├── CourseDetailPage.tsx   # Course player with lessons, notes, and quizzes
│   │   └── CertificatePage.tsx    # Displays earned course certificates
│   │
│   ├── instructor/             # Pages for instructor role
│   │   ├── InstructorDashboard.tsx # Course creation and stats
│   │   └── LessonManagementPage.tsx # Lesson/quiz ordering and editing
│   │
│   └── admin/                  # Pages for administrator role
│       └── AdminDashboard.tsx     # User list, role manager, audit logs, and feedback list
│
├── routes/                     # Router configurations
│   ├── AppRouter.tsx           # Page mappings and fallback redirects
│   └── RoleRoute.tsx           # Route guard protecting routes based on roles
│
├── services/                   # API interaction services
│   ├── api.ts                  # Axios client with interceptors
│   └── *Service.ts             # REST service calls grouped by feature
│
├── types/                      # TypeScript definitions (index.ts)
│
└── utils/                      # Internal helpers
    └── tokenManager.ts         # Holds the current access token in memory
```

---

## Token & Session Architecture

To prevent XSS (Cross-Site Scripting) attacks, we do not store the short-lived JSON Web Token (JWT) in local storage:

1.  **Access Token:** Kept in memory inside the `tokenManager.ts` utility file.
2.  **Refresh Token:** Kept in `localStorage` so sessions persist when the browser tab is closed.
3.  **Axios Interceptor (`api.ts`):** 
    If an API request returns a `401 Unauthorized` status code, the interceptor intercepts the response:
    *   It blocks further requests and queues them up.
    *   It requests a new access token from `/auth/refresh` using the stored refresh token.
    *   If the refresh is successful, it updates the stored token, executes the queued requests, and unblocks the client.
    *   If the refresh fails, it clears local storage and redirects the user to the login screen.

---

## Routing & Guards

The application uses dynamic redirects to match the logged-in user's role:
*   Unauthenticated users are directed to the login page.
*   Once logged in, users are routed to their designated home bases:
    *   `ADMIN` users are redirected to `/admin`.
    *   `INSTRUCTOR` users are redirected to `/instructor`.
    *   `STUDENT` users are redirected to `/student`.
*   All dashboards, profile settings, and lesson pages are wrapped in `<RoleRoute>` guards to prevent unauthorized path access.

---

## Running the Application Locally

1. Create a `.env` file in the root of `brightlearn-frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
2. Install node modules and run the development command:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.
