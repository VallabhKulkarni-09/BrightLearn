# BrightLearn LMS - Backend Service

Welcome to the backend service of the BrightLearn Learning Management System. This project is a Spring Boot application that exposes a RESTful API to power the BrightLearn web client. It handles authentication, course management, student progress tracking, quizzes, and audit logs.

---

## Architecture & Technology Stack

*   **Runtime:** Java 21
*   **Framework:** Spring Boot 3.4.5 (Web MVC, Security, JPA)
*   **Persistence:** Spring Data JPA + Hibernate ORM
*   **Database:** MySQL
*   **Security:** JWT (JSON Web Tokens) with refresh token rotation
*   **API Documentation:** Springdoc OpenAPI (Swagger UI)
*   **Build Tool:** Maven

We use a layered architecture pattern:
1.  **Controllers:** Handle HTTP requests, manage routing, and serialize responses.
2.  **Services:** House core business logic, transaction management, and rule validation.
3.  **Repositories:** Manage database persistence and JpaRepository queries.
4.  **Entities:** Define database schemas and relationships.

---

## Directory Overview

The Java source files are located in `src/main/java/com/brightlearn/`:

```text
com.brightlearn/
├── BrightlearnBackendApplication.java    # App entry point
│
├── audit/                                # AOP logging interceptor for user actions
│   ├── AuditAspect.java                  # Intercepts methods annotated with @Audited
│   └── Audited.java                      # Custom annotation for audit targets
│
├── config/                               # Core configurations (CORS, Swagger, seed data)
│   ├── CorsConfig.java                   # CORS mappings for frontend client
│   ├── DataInitializer.java              # Seeds system roles, default admin, and base courses
│   └── OpenApiConfig.java                # Swagger UI and metadata configuration
│
├── controller/                           # REST controllers exposing API endpoints
│
├── dto/                                  # Data Transfer Objects for clean API inputs/outputs
│
├── entity/                               # JPA entities representing the database schema
│
├── exception/                            # Global exception mapping and custom exceptions
│   ├── GlobalExceptionHandler.java       # Formats errors into clean, readable JSON
│   └── CustomExceptions                  # Domain-specific runtime exceptions (e.g. ResourceNotFoundException)
│
├── repository/                           # Spring Data repositories for entity persistence
│
├── security/                             # Security filters, JWT logic, and filter chains
│   ├── JwtAuthenticationFilter.java      # Authenticates requests by parsing bearer tokens
│   ├── JwtService.java                   # Generates and validates access and refresh tokens
│   └── SecurityConfig.java               # Configures endpoints authorization rules and password encoder
│
└── service/                              # Service layer implementing the business rules
```

---

## Relational Schema

Here is how our core database models map to one another:

*   **User & Role:** A `User` is associated with one `Role` (e.g., `ROLE_STUDENT`, `ROLE_INSTRUCTOR`, `ROLE_ADMIN`).
*   **Courses & Lessons:** An instructor teaches many `Courses`. Each `Course` contains multiple ordered `Lessons` (types: `VIDEO`, `TEXT`, `QUIZ`).
*   **Enrollment & Progress:** When a student registers for a course, an `Enrollment` is created. As they complete lessons, `LessonProgress` records map their completion state to the enrollment.
*   **Quizzes:** A quiz `Lesson` maps to a `Quiz` entity which houses JSON-formatted questions and options.
*   **Certificates:** Awarded to a student under a specific `Enrollment` when their course completion percentage hits 100%.
*   **Interactions:** Users can review courses (`Review`), drop comments on lessons (`DiscussionComment`), create personal study notes (`StudentNote`), and submit feedback (`Feedback`).

---

## Authentication Design

We use a stateless JWT authentication model to ensure scalability and speed:

1.  **Access Token:** Short-lived token (15-minute expiration) that clients include in the `Authorization: Bearer <token>` header of requests.
2.  **Refresh Token:** Long-lived token (7-day expiration) stored in the database (`refresh_tokens` table) and kept in the client's local storage.
3.  **Refresh Rotation:** When the access token expires, the client calls `/auth/refresh` with the refresh token. The backend invalidates the old token, saves a new refresh token, and returns a new token pair.

Endpoints under `/auth/**` (login, signup, password resets, refresh) and certificate public verification under `/certificates/verify/**` do not require authentication. All other routes require a valid access token.

---

## API Documentation

When the application is running, you can access the Swagger UI to view and interact with all endpoints:

*   **URL:** `http://localhost:8080/swagger-ui/index.html`
*   **JSON Docs:** `http://localhost:8080/v3/api-docs`
