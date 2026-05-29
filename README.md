# BrightLearn LMS

BrightLearn is a modern, high-performance, full-featured Learning Management System (LMS) designed to facilitate educational experiences for **Students**, **Instructors**, and **Administrators**. 

Built with a robust, enterprise-grade Java Spring Boot API backend and a responsive, high-fidelity React Single Page Application (SPA), the platform supports enrollment management, structured course materials (videos, articles, and interactive quizzes), progress tracking, student note-taking, lesson discussions, course reviews, and dynamic certificate generation.

---

## Architecture Overview

BrightLearn is designed as a decoupled client-server application:

```
┌─────────────────────────────────┐
│        React Frontend           │ (Vite + TS + Tailwind CSS + Framer Motion)
│       (Port: 5173 / Local)      │
└────────────────┬────────────────┘
                 │ REST / JSON
                 ▼
┌─────────────────────────────────┐
│      Spring Boot Backend        │ (Java 21 + Spring Security + JPA)
│       (Port: 8080 / Local)      │
└────────────────┬────────────────┘
                 │ JDBC / SQL
                 ▼
┌─────────────────────────────────┐
│        MySQL Database           │ (Default: Schema 'brightlearn_db')
└─────────────────────────────────┘
```

*   **Frontend Client:** A lightweight, interactive web application powered by **Vite**, **React 18**, **TypeScript**, and **Tailwind CSS**. Fluid micro-animations are driven by **Framer Motion**, and API requests are managed via **Axios** with automatic, thread-safe access/refresh token rotation.
*   **Backend Server:** An API server built on **Spring Boot 3** and **Java 21**. Data persistence is managed via **Hibernate/JPA** over **MySQL**, and security is implemented with stateless **JWT Authentication** and role-based authority guards (`ROLE_STUDENT`, `ROLE_INSTRUCTOR`, `ROLE_ADMIN`).

---

## Repository Structure

The codebase is split into two main logical directories:

```text
├── brightlearn-backend/     # Spring Boot API Server
│   ├── src/                 # Java source files (controller, service, repository, etc.)
│   ├── pom.xml              # Maven dependencies and build configuration
│   └── README.md            # Backend developer guide
│
├── brightlearn-frontend/    # React Single Page Application
│   ├── src/                 # React source files (components, contexts, pages, etc.)
│   ├── package.json         # Node.js dependencies and scripts
│   └── README.md            # Frontend developer guide
│
├── run.ps1                  # Windows PowerShell script to boot both projects concurrently
└── run.sh                   # Unix shell script to boot both projects concurrently
```

---

## Feature Matrix

### For Students
*   **Structured Learning:** Step-by-step progress tracking through courses containing video lessons, text guides, and quizzes.
*   **Interactive Utilities:** Write and save real-time notes on each lesson and participate in lesson-specific discussion boards.
*   **Verification & Rewards:** Automatic generation of verification-linked course certificates upon 100% course completion.

### For Instructors
*   **Course Creator:** Tooling to build, sequence, and manage lessons (video links or markdown content) and quizzes.
*   **Analytics Dashboard:** Visual representation of student progress, lesson completion rates, and feedback metrics.

### For Administrators
*   **User Management:** Centralized view of all platform users, with capability to toggle user active status and assign platform roles.
*   **Auditing:** System-wide audit logs capturing critical actions (signups, role changes, course creation) using AOP (Aspect-Oriented Programming).

---

## Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed:
*   [Java Development Kit (JDK) 21](https://adoptium.net/)
*   [Node.js (v18+)](https://nodejs.org/)
*   [MySQL Server](https://dev.mysql.com/downloads/mysql/)

### 2. Database Configuration
1. Start your local MySQL instance.
2. Create an empty database:
   ```sql
   CREATE DATABASE brightlearn_db;
   ```
3. Update the database credentials in `brightlearn-backend/src/main/resources/application.properties` if they differ from the default (`root` / `root@39`).

### 3. Running the Projects Concurrently

We have provided wrapper startup scripts to launch both servers in parallel:

*   **On Windows (PowerShell):**
    ```powershell
    .\run.ps1
    ```
*   **On macOS/Linux:**
    ```bash
    chmod +x run.sh
    ./run.sh
    ```

Once started:
*   The **Frontend** client will open at: `http://localhost:5173`
*   The **Backend** API server will run at: `http://localhost:8080`
*   The **Swagger UI** for API documentation will be available at: `http://localhost:8080/swagger-ui/index.html`

---

## Development Documents
For more details regarding developer setups, configuration properties, API routes, and styling rules, check the dedicated readmes:
*   [Backend Setup & Architecture Guide](file:///c:/Users/vallabh.kulakarni1/project/brightlearn-backend/README.md)
*   [Frontend Components & Design Guide](file:///c:/Users/vallabh.kulakarni1/project/brightlearn-frontend/README.md)
