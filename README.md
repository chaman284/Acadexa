# 🎓 Acadexa

> **Assess. Identify. Improve.**  
> An enterprise-grade, department-level Academic Intelligence, Gamified Assessment, and Learning Gap Remediation platform engineered for higher education institutions.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express 5](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint-orange?style=flat-square)](https://oxc.rs/)

---

## 🤖 AI Agent Quick Briefing (Read This First)

If you are an **AI coding agent** analyzing or modifying this repository, review this orientation before proposing or applying code changes:

1. **Monorepo Architecture**:
   - **Frontend**: Root directory (`/`). Built with **React 19 + TypeScript + Vite + Tailwind CSS 3.4**.
   - **Backend**: In `./server/`. Built with **Express 5 + TypeScript (`ts-node-dev`) + Prisma ORM 5.22 + PostgreSQL** (hosted on Supabase or local).
2. **Dual-Mode Resilience (Mock Fallbacks)**:
   - The frontend is designed to work seamlessly in both **Live Connected Mode** (connected to the Express server at `http://localhost:3001/api`) and **Offline / Demo Mode** (utilizing structured fallbacks in `src/data/` and `src/services/`).
   - If the backend is offline or an API request fails, services in `src/services/` gracefully catch errors and fall back to local mock data without crashing the UI.
3. **Role-Based Access Control (RBAC)**:
   - Three distinct user roles: `student`, `faculty`, and `admin`.
   - Frontend route gating is handled in `src/routes/AppRoutes.tsx` via `PrivateRoute`, `StandaloneRoute`, and `CommonAuthRoute`.
   - Backend API authorization is enforced via `authenticateJWT` and `requireRole(['ROLE_NAME'])` middleware in `server/src/middleware/auth.ts`.
4. **State & API Architecture**:
   - Global authentication & session state: `src/context/AuthContext.tsx`.
   - HTTP Client: `src/lib/apiClient.ts` (pre-configured Axios instance with automatic JWT Bearer token injection).
   - Backend database queries: Encapsulated within `server/src/services/` and `server/src/routes/` using the singleton `prisma` client (`server/src/prisma.ts`).
5. **Styling & Design Tokens**:
   - Styled using Tailwind CSS 3.4 supplemented by CSS custom variables defined in `src/index.css` (e.g., `var(--color-primary)`, `var(--color-accent)`, `var(--color-background)`).
   - Icons are exclusively imported from `lucide-react`.

---

## 📌 Table of Contents

- [Overview & Core Value](#-overview--core-value)
- [Key Highlights](#-key-highlights)
- [System Architecture](#-system-architecture)
- [Role-Based Feature Matrix](#-role-based-feature-matrix)
  - [1. Student Experience](#1-student-experience)
  - [2. Faculty Experience](#2-faculty-experience)
  - [3. Administrator Experience](#3-administrator-experience)
  - [4. Cross-Cutting Systems (AI Tutor & Notifications)](#4-cross-cutting-systems)
- [Tech Stack Details](#-tech-stack-details)
- [Database Schema & ERD (Prisma)](#-database-schema--erd-prisma)
- [Comprehensive REST API Reference](#-comprehensive-rest-api-reference)
- [Repository Directory Structure](#-repository-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Default Demo Accounts](#-default-demo-accounts)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Design System & UI Conventions](#-design-system--ui-conventions)
- [Future Roadmap](#-future-roadmap)
- [License](#-license)

---

## 🌟 Overview & Core Value

Traditional academic learning environments face a recurring structural problem: examinations and test results evaluate performance after the teaching cycle has already concluded. Faculty receive letter grades rather than diagnostic insights, and students move on to advanced coursework with undetected prerequisite learning gaps.

**Acadexa** bridges this gap through a high-frequency, telemetry-driven assessment loop:

```mermaid
flowchart LR
    A["1. ASSESS"] -->|Scheduled Quizzes & Practice Tests| B["2. IDENTIFY"]
    B -->|Topic Failure Telemetry & Gap Matrix| C["3. IMPROVE"]
    C -->|Targeted Remedial Quizzes & AI Mentoring| A
```

- **Assess**: Weekly micro-quizzes and practice sets run on an engaging, Kahoot-style proctored test engine.
- **Identify**: Student responses map directly to curricular topics, generating live learning gap matrices for students, sections, and department heads.
- **Improve**: Faculty dispatch single-click remedial quizzes targeting specific weak syllabus topics, while students utilize the integrated Google Gemini AI Academic Tutor for pedagogical assistance.

---

## ⚡ Key Highlights

- **🎮 High-Engagement Quiz Engine**: Fullscreen proctored assessment screen featuring Web Audio API synthesized tones (chords for correct answers, low buzzers for incorrect), streak multipliers, countdown timers, four-color Kahoot-style options, and celebratory Canvas Confetti.
- **🧠 Curricular Learning Gap Diagnostics**: Automatic mapping of failed quiz items to fine-grained syllabus topics (e.g., *Arrays*, *Binary Search Trees*, *Normalization*), classifying student proficiency into **Mastered**, **Moderate**, and **Needs Attention**.
- **👩‍🏫 Dual-Stage Faculty Workspace**: Class switcher allowing faculty to seamlessly toggle between assigned semesters and sections (e.g., *CS 5th Sem - Section A*), access aggregated grade distributions, and initiate remedial interventions.
- **🏛️ Institutional Admin Console**: Complete management of departments, semesters, sections, faculty course assignments, student enrollments, course catalogs, and campus-wide notifications.
- **📄 Instant Academic PDF Generator**: Built-in client-side engine to export cleanly formatted academic question papers with answer keys directly to print/PDF from the question bank.
- **🤖 Contextual AI Academic Tutor**: Powered by **Google Gemini 1.5 Flash**, offering conversational guidance, hints, and Socratic breakdowns without giving away quiz answers.
- **🔔 Real-Time Notification System**: Popover notification hub delivering alerts for new quizzes, course updates, remedial assignments, and administrative notices.

---

## 🏛 System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend (React 19 + TypeScript + Vite)"]
        UI["UI Layer (Tailwind CSS + Framer Motion + Lucide)"]
        Router["React Router 7 (Role-Gated Routes)"]
        AuthCtx["AuthContext (JWT Session Cache)"]
        Services["Frontend Services Layer (src/services/)"]
        Fallback["Resilient Offline Mock Data (src/data/)"]
        Axios["Axios Client (src/lib/apiClient.ts)"]
    end

    subgraph Backend ["Backend API (Express 5 + TypeScript)"]
        API["Express Router (/api)"]
        JWTMiddleware["JWT Auth & Role Guard Middleware"]
        Controllers["Route Handlers (admin, quizzes, questions, etc.)"]
        PrismaORM["Prisma Client ORM 5.22"]
    end

    subgraph Storage ["Data & External Services"]
        Postgres[("PostgreSQL Database (Supabase / Local)")]
        GeminiAPI["Google Gemini 1.5 Flash API"]
    end

    UI --> Router
    Router --> AuthCtx
    AuthCtx --> Services
    Services --> Axios
    Services -.->|Fallback on network error| Fallback
    Axios -->|HTTP Requests + Bearer Token| API
    API --> JWTMiddleware
    JWTMiddleware --> Controllers
    Controllers --> PrismaORM
    PrismaORM --> Postgres
    Controllers -->|AI Inquiries| GeminiAPI
```

---

## 🚀 Role-Based Feature Matrix

### 1. Student Experience

| Feature / Module | Route | Description |
|---|---|---|
| **Student Dashboard** | `/student` | Performance summary, weekly study streaks, upcoming quizzes, completion rate cards, and progress charts. |
| **Course Catalog** | `/student/courses` | Overview of enrolled semester courses, credit hours, subject codes, faculty details, and syllabus outlines. |
| **Weekly Quizzes** | `/student/quiz` | Active, upcoming, and completed quiz listings with deadlines and duration tags. |
| **Interactive Quiz Screen** | `/student/quiz/:id` | Fullscreen assessment environment featuring timed questions, Web Audio audio feedback, dynamic score multipliers, and instant validation. |
| **Quiz Results & Review** | `/student/quiz/:id/result` | Score report detailing accuracy percentage, time taken, points earned, question-by-question answer keys, and pedagogical explanations. |
| **Learning Gaps Tracker** | `/student/learning-gaps` | Visual topic mastery matrix showing weak, moderate, and mastered concepts with direct links to remedial practice quizzes. |
| **Question Bank** | `/student/question-bank` | Practice questions categorized by subject, topic, and difficulty (Easy, Medium, Hard), complete with PDF export. |
| **Leaderboard** | `/student/leaderboard` | Class-level and department-level competitive rankings highlighting top students, points, and streaks. |
| **AI Academic Tutor** | `/student/tutor` | Chat interface powered by Gemini 1.5 Flash providing conceptual explanations, hints, and step-by-step problem assistance. |
| **Department Directory** | `/student/department` | Notices, faculty office hours, academic calendars, and departmental announcements. |
| **Student Profile & Settings**| `/student/profile`, `/student/settings` | Personal details, academic credentials, notification preferences, and account controls. |

### 2. Faculty Experience

| Feature / Module | Route | Description |
|---|---|---|
| **Faculty Dashboard** | `/faculty` | Centralized teaching hub displaying assigned sections, quick metrics, pending quiz reviews, and activity feeds. |
| **Class Dashboard** | `/faculty/class/:classId` | Dedicated control screen for an individual semester/section cohort (e.g., CS Sem 5 - Sec A). |
| **Class Analytics** | `/faculty/class/:classId/analytics` | In-depth Recharts visualisations: score histograms, student participation rates, and difficult question diagnostics. |
| **3-Step Quiz Builder** | `/faculty/quiz/create` | Step 1: Metadata (title, duration, type); Step 2: Question selection (custom or from bank); Step 3: Target section scheduling. |
| **Quiz Management** | `/faculty/quizzes` | Complete assessment lifecycle management (Draft, Active, Completed) with one-click remedial quiz creation. |
| **Learning Gap Diagnostics**| `/faculty/learning-gaps` | Cohort-wide topic weakness identification highlighting concepts needing lecture re-teaching. |
| **Question Paper Bank** | `/faculty/paper-bank` | Repository of institutional past mid-term and semester exam papers, reference answers, and syllabus documents. |
| **Faculty Profile & Settings**| `/faculty/profile`, `/faculty/settings` | Faculty credentials, subject designations, and portal configurations. |

### 3. Administrator Experience

| Feature / Module | Route | Description |
|---|---|---|
| **Admin Overview** | `/admin` | Campus-wide KPI dashboard: total enrolled students, active faculty, courses, sections, overall pass rates, and year-wise performance metrics. |
| **Faculty Management** | `/admin/faculty` | Faculty directory, profile creation, and assignment to specific semester sections and subjects (`FacultySubject` mapping). |
| **Course Catalog Management**| `/admin/courses` | Creation, modification, and deletion of subjects, course codes, credits, and semester associations. |
| **Student Management** | `/admin/students` | Student records, roll number assignment, section transfers, and academic status monitoring. |
| **Section Management** | `/admin/sections` | Department section provisioning (e.g., Year 3, Semester 5, Section A/B/C) with student roster counts. |
| **Notifications Hub** | `/admin/notifications` | Campus broadcast creation: dispatch targeted alerts to all users, specific roles, or individual accounts. |
| **Admin Profile & Settings** | `/admin/profile`, `/admin/settings` | Administrative credentials, institutional metadata, and system preferences. |

### 4. Cross-Cutting Systems

- **Interactive Notification Center**: Reusable popover component (`NotificationPopover.tsx`) in the dashboard navbar showing real-time notifications categorized by type (`quiz`, `course`, `learning_gap`, `announcement`, `system`).
- **Syllabus & Document Management**: Institutional storage of curriculum documents linked to subjects and topics.
- **Client-Side PDF Generation**: `src/services/questionPdfGenerator.ts` compiles question sets into clean, printable academic question papers with formatted keys.

---

## 🛠 Tech Stack Details

### Frontend Application
- **Core Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router 7](https://reactrouter.com/) (Browser router with role-gated private routes)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + CSS Custom Variables Design System
- **Animations**: [Framer Motion 13](https://www.framer.com/motion/)
- **Data Visualization**: [Recharts 3](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio & Visual FX**: HTML5 Web Audio API (real-time synthesizer) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **HTTP Client**: [Axios](https://axios-http.com/) (with JWT interceptors)
- **BaaS Client**: [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction) (`@supabase/supabase-js`)
- **Code Linter**: [Oxlint](https://oxc.rs/)

### Backend Application
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Server Framework**: [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (executed via `ts-node-dev` for live reloading)
- **ORM**: [Prisma 5.22](https://www.prisma.io/)
- **Database**: [PostgreSQL (Hosted on Supabase or Local)](https://supabase.com/)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Server Auth Utilities**: [@supabase/server](https://www.npmjs.com/package/@supabase/server)
- **AI Integration**: [Google Gemini 1.5 Flash API](https://ai.google.dev/) via REST proxy
- **CORS & Utilities**: [cors](https://expressjs.com/en/resources/middleware/cors.html) + [dotenv](https://github.com/motdotla/dotenv)

---

## 🗄 Database Schema & ERD (Prisma)

The application relational database is configured via Prisma (`server/prisma/schema.prisma`):

```mermaid
erDiagram
    User ||--o| Student : "has profile"
    User ||--o| Faculty : "has profile"
    User ||--o{ Notification : "receives"
    
    Department ||--o{ Section : "contains"
    Department ||--o{ Subject : "offers"
    
    Section ||--o{ Student : "enrolls"
    Section ||--o{ Quiz : "targets"
    Section ||--o{ FacultySubject : "assigned to"
    
    Subject ||--o{ FacultySubject : "taught by"
    Subject ||--o{ Quiz : "evaluates"
    Subject ||--o{ Topic : "contains"
    Subject ||--o{ SyllabusDocument : "has"
    
    Faculty ||--o{ FacultySubject : "teaches"
    
    Topic ||--o{ Question : "contains"
    Topic ||--o{ SyllabusDocument : "covers"
    
    Question ||--o{ Option : "has"
    Question ||--o{ QuizQuestion : "included in"
    Question ||--o{ AttemptAnswer : "answered in"
    
    Quiz ||--o{ QuizQuestion : "contains"
    Quiz ||--o{ QuizAttempt : "receives"
    
    Student ||--o{ QuizAttempt : "submits"
    QuizAttempt ||--o{ AttemptAnswer : "records"
```

### Models Reference

| Model | Key Fields | Purpose |
|---|---|---|
| **`User`** | `id`, `email`, `passwordHash`, `name`, `role`, `avatarUrl`, `createdAt` | Core authentication entity. `role` is an enum: `STUDENT`, `FACULTY`, `ADMIN`. |
| **`Student`** | `id`, `userId`, `rollNo`, `sectionId` | Student profile linked to a specific class `Section`. |
| **`Faculty`** | `id`, `userId` | Faculty profile linked to course teaching assignments. |
| **`Department`** | `id`, `name`, `code` (e.g., `CS`) | Academic departments offering subjects and housing sections. |
| **`Section`** | `id`, `semester` (1–8), `name` (A, B, C), `departmentId` | Specific cohort within a semester. |
| **`Subject`** | `id`, `name`, `code`, `semester`, `departmentId` | Academic courses in the curriculum. |
| **`FacultySubject`**| `id`, `facultyId`, `subjectId`, `sectionId` | Mapping linking faculty members to the subjects and sections they teach. |
| **`Topic`** | `id`, `name`, `subjectId` | Granular curricular units used for learning gap telemetry. |
| **`Question`** | `id`, `text`, `type`, `difficulty`, `cognitiveLevel`, `status`, `explanation`, `topicId` | Question bank repository. Includes Bloom's taxonomy cognitive levels (`CL1_REMEMBER` through `CL6_CREATE`). |
| **`Option`** | `id`, `text`, `isCorrect`, `questionId` | Multiple choice options associated with a question. |
| **`Quiz`** | `id`, `title`, `type`, `status`, `duration`, `scheduledAt`, `subjectId`, `sectionId` | Assessment instances (`WEEKLY`, `REMEDIAL`, `PRACTICE`) with statuses (`DRAFT`, `ACTIVE`, `COMPLETED`). |
| **`QuizQuestion`** | `id`, `quizId`, `questionId`, `order` | Ordered many-to-many junction between quizzes and questions. |
| **`QuizAttempt`** | `id`, `studentId`, `quizId`, `score`, `timeTaken`, `submittedAt` | Submission record capturing student assessment performance. |
| **`AttemptAnswer`**| `id`, `attemptId`, `questionId`, `optionId`, `isCorrect` | Detailed item-level audit trail for every answered question. |
| **`SyllabusDocument`**| `id`, `subject`, `topic`, `content`, `subjectId`, `topicId` | Reference syllabus outlines and learning materials. |
| **`DeptInformation`**| `id`, `type`, `title`, `date`, `description`, `targetDept` | Departmental notices, holidays, events, and achievements. |
| **`Notification`** | `id`, `userId`, `title`, `message`, `type`, `isRead`, `actionUrl`, `role` | In-app notification messages delivered to individual users or broadcast by role. |

---

## 📡 Comprehensive REST API Reference

Base Server URL: `http://localhost:3001/api`

### 1. Authentication (`/api/auth`)
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Authenticates credentials and returns a signed JWT token and user profile. |
| `POST` | `/auth/register` | Public | Registers a new account. |
| `POST` | `/auth/logout` | Authenticated | Clears user session. |
| `GET` | `/auth/me` | Authenticated | Returns profile of the active token holder. |

### 2. User Accounts & Profiles (`/api/users`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | Lists all user accounts with nested student/faculty relations. |
| `POST` | `/users/student` | Admin | Creates a student account with assigned roll number and section. |
| `POST` | `/users/faculty` | Admin | Creates a faculty profile. |
| `PUT` | `/users/:id` | Authenticated | Updates account name or avatar URL. |

### 3. Quizzes & Assessments (`/api/quizzes`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/quizzes` | Authenticated | Retrieves quizzes filtered by section, subject, or status (students auto-filter to their enrolled section). |
| `POST` | `/quizzes` | Faculty / Admin | Creates a new quiz assessment with question associations. |
| `GET` | `/quizzes/:id` | Authenticated | Returns full quiz details with questions and options. |
| `POST` | `/quizzes/:id/attempt`| Student | Evaluates quiz submission, logs score, and records attempt answers. |
| `GET` | `/quizzes/:id/attempts`| Authenticated | Retrieves attempt history and submissions for a quiz. |

### 4. Question Bank (`/api/questions`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/questions` | Authenticated | Queries question items with optional filters (`topicId`, `difficulty`, `type`). |
| `POST` | `/questions` | Faculty / Admin | Adds a new question item with multiple options. |
| `GET` | `/questions/topics` | Authenticated | Returns list of all curriculum topics. |

### 5. Academic Analytics & Bayesian Skill Gaps (`/api/analytics` & `/api/skill-gaps`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/analytics/student/overview` | Student | Returns student score averages, streaks, and weakness breakdown. |
| `GET` | `/analytics/faculty/overview` | Faculty / Admin | Aggregated metrics across all sections taught by faculty. |
| `GET` | `/analytics/faculty/class/:sectionId` | Faculty / Admin | Section-specific performance metrics, score distributions, and topic failure rates. |
| `GET` | `/skill-gaps/student/me` | Student | Computes Bayesian skill gaps, weakest topics/subtopics, and mastery tree for authenticated student. |
| `GET` | `/skill-gaps/student/:studentId` | Faculty / Admin | Detailed student skill gap diagnostic report for a specific student. |
| `GET` | `/skill-gaps/section/:sectionId` | Faculty / Admin | Computes section-level cohort mastery, lecture re-teaching recommendations, and at-risk students. |
| `GET` | `/skill-gaps/year/:year` | Admin | Multi-section comparative year skill gap overview across 4 academic years. |

### 6. Courses & Sections (`/api/courses` & `/api/sections`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/courses` | Authenticated | Lists all subjects, credit hours, and topics. |
| `GET` | `/sections` | Authenticated | Lists sections with student enrollment counts and teaching assignments. |
| `GET` | `/sections/faculty-classes` | Faculty | Returns classes specifically assigned to the logged-in faculty member. |

### 7. AI Academic Tutor (`/api/chatbot`)
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/chatbot` | Authenticated | Proxies user prompt and conversation history to Google Gemini 1.5 Flash (returns graceful fallback message if `GEMINI_API_KEY` is not set). |

### 8. Notifications Hub (`/api/notifications`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | Authenticated | Fetches notifications for the active user or user's role. |
| `PUT` | `/notifications/:id/read` | Authenticated | Marks a specific notification as read. |
| `PUT` | `/notifications/read-all` | Authenticated | Marks all notifications for the active user as read. |

### 9. Institutional Administration (`/api/admin`)
| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/admin/overview` | Admin | Comprehensive analytics: total enrollments, year-wise data, course pass rates, and participation metrics. |
| `GET` | `/admin/faculty` | Admin | Faculty directory with their assigned teaching workloads. |
| `POST` | `/admin/faculty/assignments` | Admin | Assigns a faculty member to teach a subject in a specific section. |
| `DELETE`| `/admin/faculty/assignments/:id`| Admin | Removes a teaching assignment. |
| `DELETE`| `/admin/faculty/:id` | Admin | Deletes a faculty member profile and user record. |
| `GET` | `/admin/courses` | Admin | Lists all courses with enrollment and assignment metrics. |
| `POST` | `/admin/courses` | Admin | Creates a new subject. |
| `PUT` | `/admin/courses/:id` | Admin | Updates course details. |
| `DELETE`| `/admin/courses/:id` | Admin | Deletes a subject. |
| `GET` | `/admin/students` | Admin | Retrieves student roster with filters for semester, section, and search query. |
| `POST` | `/admin/students` | Admin | Creates a student record and user account. |
| `PUT` | `/admin/students/:id/section` | Admin | Reassigns a student to a different section. |
| `DELETE`| `/admin/students/:id` | Admin | Deletes a student account and associated submission data. |
| `GET` | `/admin/departments` | Admin | Lists all academic departments. |
| `GET` | `/admin/sections` | Admin | Retrieves section list with enrollment counts. |
| `POST` | `/admin/sections` | Admin | Provisions a new section for a department and semester. |
| `DELETE`| `/admin/sections/:id` | Admin | Removes an empty section. |
| `GET` | `/admin/notifications` | Admin | Lists administrative notifications. |

---

## 📂 Repository Directory Structure

```plaintext
Acadexa/
├── package.json                   # Root package definition (Frontend dependencies & scripts)
├── vite.config.ts                 # Vite bundler configuration & React plugin
├── tailwind.config.js             # Tailwind CSS custom themes & color palette
├── tsconfig.json                  # Root TypeScript configuration
├── tsconfig.app.json              # Vite client TypeScript build settings
├── tsconfig.node.json             # Vite config TypeScript compiler settings
├── .oxlintrc.json                 # Oxlint configuration for ultra-fast linting
├── .env.example                   # Frontend environment variables template
├── .env.local                     # Local frontend environment config (git-ignored)
│
├── src/                           # Frontend React Application Source
│   ├── main.tsx                   # React 19 bootstrap & mount
│   ├── App.tsx                    # Root application wrapper (<AuthProvider> & <AppRoutes>)
│   ├── index.css                  # Global styles, CSS design tokens, and utility classes
│   │
│   ├── components/                # Reusable UI & Layout Components
│   │   ├── chatbot/               # Floating AI Tutor chat window & message bubbles
│   │   ├── dashboard/             # Metric stat cards, streak indicators, progress bars
│   │   ├── faculty/               # Faculty class cards, assignment modal dialogs
│   │   ├── layout/                # DashboardLayout, Sidebar, Navbar, NotificationPopover
│   │   ├── leaderboard/           # Podium rank badges, leaderboards, streak widgets
│   │   └── ui/                    # Base primitives: Button, Input, Modal, Badge, Card
│   │
│   ├── context/                   # Global React State
│   │   └── AuthContext.tsx        # Authentication provider, session restore, role dispatch
│   │
│   ├── data/                      # Resilient Local Fallbacks & Mock Data
│   │   ├── analytics.ts           # Mock student & class analytics data
│   │   ├── collegeInfo.ts         # Mock department directory, events, and staff
│   │   ├── courses.ts             # Static course catalog & syllabus definitions
│   │   ├── facultyClasses.ts      # Sample class groupings and assignments
│   │   ├── paperBank.ts           # Past examination papers repository
│   │   ├── quizzes.ts             # Sample quizzes, questions, and Kahoot options
│   │   └── students.ts            # Mock student roster & leaderboard records
│   │
│   ├── lib/                       # Core Third-Party Client Instances
│   │   ├── apiClient.ts           # Axios instance with automatic JWT Authorization interceptor
│   │   └── supabase.ts            # Supabase JS browser client instance
│   │
│   ├── pages/                     # Routed View Components
│   │   ├── auth/
│   │   │   └── Login.tsx          # Login page with 1-click Student, Faculty & Admin demo buttons
│   │   ├── student/               # Student views:
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── Courses.tsx
│   │   │   ├── Quiz.tsx
│   │   │   ├── QuizScreen.tsx     # Kahoot-style quiz engine with Web Audio & Confetti
│   │   │   ├── QuizResult.tsx
│   │   │   ├── QuestionBank.tsx
│   │   │   ├── LearningGaps.tsx   # Visual mastery tracker & remedial triggers
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── AcademicChatbot.tsx# AI Tutor interface
│   │   │   ├── DepartmentInfo.tsx
│   │   │   ├── StudentProfile.tsx
│   │   │   └── StudentSettings.tsx
│   │   ├── faculty/               # Faculty views:
│   │   │   ├── FacultyDashboard.tsx
│   │   │   ├── ClassDashboard.tsx
│   │   │   ├── ClassAnalytics.tsx
│   │   │   ├── QuizBuilder.tsx    # 3-step assessment builder
│   │   │   ├── QuizManagement.tsx
│   │   │   ├── LearningGapAnalytics.tsx
│   │   │   ├── QuestionPaperBank.tsx
│   │   │   ├── FacultyProfile.tsx
│   │   │   └── FacultySettings.tsx
│   │   └── admin/                 # Administrator views:
│   │       ├── AdminOverview.tsx  # Campus-level analytics & metrics
│   │       ├── FacultyManagement.tsx
│   │       ├── CourseManagement.tsx
│   │       ├── StudentManagement.tsx
│   │       ├── SectionManagement.tsx
│   │       ├── AdminNotifications.tsx
│   │       ├── AdminProfile.tsx
│   │       └── AdminSettings.tsx
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx          # Client route definitions, 404 handler, and RBAC guards
│   ├── services/                  # Business & API Services (with offline mock fallback)
│   │   ├── adminService.ts        # Admin API client methods
│   │   ├── analyticsService.ts    # Analytics data retrieval
│   │   ├── authService.ts         # Login, logout, session persistence
│   │   ├── chatService.ts         # AI tutor message submission
│   │   ├── courseService.ts       # Course catalog queries
│   │   ├── facultyService.ts      # Faculty assignments and class queries
│   │   ├── notificationService.ts # Notification fetch and read actions
│   │   ├── paperBankService.ts    # Question paper management
│   │   ├── questionPdfGenerator.ts# In-browser academic question paper PDF generation
│   │   ├── quizService.ts         # Quiz creation, retrieval, and attempt submission
│   │   └── studentService.ts      # Student profile queries
│   └── types/                     # TypeScript Domain Models & Interfaces
│       ├── analytics.ts
│       ├── course.ts
│       ├── department.ts
│       ├── faculty.ts
│       ├── notification.ts
│       ├── quiz.ts
│       └── student.ts
│
└── server/                        # Backend Express API Application
    ├── package.json               # Backend dependencies & scripts
    ├── tsconfig.json              # Server TypeScript compiler configuration
    ├── .env.example               # Backend environment variables template
    ├── .env                       # Backend local environment config (git-ignored)
    │
    ├── prisma/                    # Database Layer
    │   ├── schema.prisma          # PostgreSQL relational schema definition
    │   ├── migrations/            # Versioned SQL migration history
    │   └── seed.ts                # Database seeder (creates departments, demo accounts, sample quizzes)
    │
    └── src/                       # Backend Source Code
        ├── index.ts               # Express application initialization, CORS, route mounting
        ├── config.ts              # Environment variable loading and validation
        ├── prisma.ts              # Shared PrismaClient singleton instance
        ├── middleware/
        │   └── auth.ts            # JWT authentication middleware & role-based route guard
        ├── routes/                # Express Route Handlers
        │   ├── admin.ts           # Admin routes (CRUD for faculty, students, courses, sections, metrics)
        │   ├── analytics.ts       # Performance and gap analytics
        │   ├── auth.ts            # Login, register, me
        │   ├── chatbot.ts         # Gemini 1.5 Flash AI tutor proxy
        │   ├── courses.ts         # Subject and topic queries
        │   ├── notifications.ts   # In-app notification retrieval & read flags
        │   ├── questions.ts       # Question bank search and creation
        │   ├── quizzes.ts         # Quiz lifecycle and scoring engine
        │   ├── sections.ts        # Class section queries and faculty assignments
        │   └── users.ts           # Account profile management
        └── services/              # Server-side business logic (quizService, etc.)
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** (bundled with Node.js) or **pnpm** / **yarn**
- **PostgreSQL**: Local PostgreSQL instance OR a free cloud instance on [Supabase](https://supabase.com/).  
  *(Note: Even without PostgreSQL, you can run and fully explore the frontend via its automatic mock fallback mode).*

---

### 1. Clone Repository

```bash
git clone https://github.com/chaman284/Acadexa.git
cd Acadexa
```

---

### 2. Backend Setup

Open a terminal and navigate to `./server/`:

```bash
cd server
npm install
```

#### Configure Server Environment
Create `server/.env` (copy from `server/.env.example`):

```env
PORT=3001
CORS_ORIGIN="http://localhost:5173"

# PostgreSQL connection string (Supabase or local PostgreSQL)
# Tip: If your password contains special characters like '@', URL-encode them (e.g. '@' -> '%40')
DATABASE_URL="postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=public"

# Auth Tokens
JWT_SECRET="acadexa_super_secure_jwt_secret_key_2026"
JWT_EXPIRES_IN="7d"

# Optional: Google AI Studio Gemini API key for live AI Tutor responses
GEMINI_API_KEY=""

# Optional Supabase Server Credentials
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_SECRET_KEY="your-secret-key"
SUPABASE_JWKS_URL="https://your-project.supabase.co/auth/v1/.well-known/jwks.json"
```

#### Push Schema & Seed Initial Data
```bash
# Generate Prisma Client types
npm run prisma:generate

# Sync schema directly to PostgreSQL database
npx prisma db push

# Seed initial department, sections, demo accounts, courses, and sample quizzes
npm run seed
```

#### Start Backend Server
```bash
npm run dev
```
The server will start at `http://localhost:3001` with API routes live at `http://localhost:3001/api`.

---

### 3. Frontend Setup

Open a second terminal in the project root (`Acadexa/`):

```bash
# Return to root directory if you were inside server/
cd ..

# Install frontend dependencies
npm install
```

#### Configure Frontend Environment
Create `.env.local` in the root directory (copy from `.env.example`):

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-or-publishable-key"
```

#### Start Frontend Dev Server
```bash
npm run dev
```

Open your browser to: **`http://localhost:5173`**.

> **💡 Offline Fallback Notice:** If the backend server is not running or the database is not yet configured, the frontend automatically falls back to its built-in offline mock data. Every view, quiz, leaderboard, and dashboard remains interactive!

---

## 🔑 Default Demo Accounts

The database seed (`server/prisma/seed.ts`) and frontend login page come pre-configured with demo accounts. On the Login page (`/login`), you can use the **1-click quick login buttons** or input these credentials:

| Role | Email | Password | Assigned Scope & Permissions |
|---|---|---|---|
| **Student** | `student@college.edu` | `student123` | Enrolled in CS Sem 5, Section A. Full quiz participation, learning gap tracker, leaderboard, and AI tutor. |
| **Faculty** | `faculty@college.edu` | `faculty123` | Dr. Ramesh Kumar (CS Dept). Class analytics, 3-step quiz builder, remedial quiz dispatch, paper bank. |
| **Admin** | `admin@college.edu` | `admin123` | System Administrator. Institutional KPIs, faculty workload assignments, course catalog, student roster, section provisioning, broadcast notifications. |

*(Legacy mock login: `chaman@cs.college.edu` / `student123` is also supported in mock mode).*

---

## ⚙️ Environment Variables

### Frontend (`.env.local`)
| Variable | Type | Required | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | String | Optional | Supabase project URL for direct frontend client operations. |
| `VITE_SUPABASE_ANON_KEY` | String | Optional | Supabase public anonymous API key. |

### Backend (`server/.env`)
| Variable | Type | Required | Description |
|---|---|---|---|
| `PORT` | Number | No (Default: `3001`) | Express server listening port. |
| `CORS_ORIGIN` | String | No (Default: `http://localhost:5173`) | Allowed frontend origin for CORS headers. |
| `DATABASE_URL` | String | **Yes** (for live DB) | PostgreSQL connection URI (`postgresql://user:pass@host:5432/db?schema=public`). |
| `JWT_SECRET` | String | **Yes** | Secret string used for signing and verifying JSON Web Tokens. |
| `JWT_EXPIRES_IN` | String | No (Default: `7d`) | Token expiration timeframe. |
| `GEMINI_API_KEY` | String | Optional | Google AI Studio API key. When present, enables live Gemini 1.5 Flash tutor responses; when blank, returns smart contextual fallback message. |
| `SUPABASE_URL` | String | Optional | Supabase backend URL. |
| `SUPABASE_PUBLISHABLE_KEY` | String | Optional | Supabase publishable key. |
| `SUPABASE_SECRET_KEY` | String | Optional | Supabase service/secret key for administrative server calls. |
| `SUPABASE_JWKS_URL` | String | Optional | Supabase JWKS endpoint for token signature verification. |

---

## 📜 Available Scripts

### Frontend (Project Root)
```bash
# Start Vite development server with Hot Module Replacement (HMR)
npm run dev

# Type-check TypeScript and build optimized production bundle in dist/
npm run build

# Preview production build locally
npm run preview

# Run fast code linting via Oxlint
npm run lint
```

### Backend (`server/`)
```bash
# Start Express backend with live TypeScript reload (ts-node-dev)
npm run dev

# Compile TypeScript into JavaScript in dist/
npm run build

# Run compiled production server
npm run start

# Generate Prisma Client types
npm run prisma:generate

# Run Prisma database migrations
npm run prisma:migrate

# Seed database with initial departments, users, courses, and questions
npm run seed
```

---

## 🎨 Design System & UI Conventions

- **Design Philosophy**: High-clarity academic theme featuring crisp slate cards, subtle borders, high-contrast typography, and purposeful semantic colors.
- **Color Tokens** (defined in `src/index.css` & `tailwind.config.js`):
  - Primary / Brand Navy: `#1e293b` / `#0f172a` (`var(--color-primary)`)
  - Accent / Royal Blue: `#3b82f6` / `#2563eb` (`var(--color-accent)`)
  - Mastery / Success: `#22c55e` (Emerald green for high accuracy & mastered topics)
  - Warning / Learning Gap: `#f59e0b` (Amber for moderate mastery)
  - Critical Review: `#ef4444` (Coral red for weak concepts needing immediate remedial work)
  - Kahoot Options Colors: Red (`#ef4444`), Blue (`#3b82f6`), Yellow (`#eab308`), Green (`#22c55e`)
- **Audio Synthesizer**: Uses native HTML5 `AudioContext` to construct harmonic chords for winning streaks and low buzzers for errors without downloading heavy `.mp3` audio files.
- **Accessibility & Responsiveness**: Fluid layouts supporting multi-monitor desktop workstations, laptops, and mobile screens via slide-out sidebars and collapsible drawers.

---

## 🗺️ Future Roadmap

- [ ] **AI Question Generation from Syllabus / Slides**: Ingest lecture slides (PDF/PPTX) and auto-generate Bloom's taxonomy-classified questions into the Question Bank.
- [ ] **Automated Remedial Dispatch Trigger**: Automatically schedule and assign remedial quizzes to students when their topic accuracy drops below 60%.
- [ ] **College ERP / SIS Bi-Directional Integration**: Direct sync with university student information systems and official grade books.
- [ ] **Mobile Companion PWA**: Native-like mobile experience for rapid daily practice quizzes and push alerts.
- [ ] **Multi-College Multi-Tenancy**: Institution-level partitioning for multi-campus universities.

---

## 📄 License

This project is licensed under the **ISC License**. Feel free to use, adapt, and build upon it for academic and institutional research.

---

<p align="center">
  <b>Acadexa</b> — Empowering Students, Faculty, and Administrators with Academic Intelligence.<br>
  Built with ❤️ for higher education excellence.
</p>
