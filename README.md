# 🎓 Acadexa

> **Assess. Identify. Improve.**  
> An enterprise-grade, department-level Academic Intelligence, Adaptive Assessment, and Learning Gap Remediation platform engineered for higher education institutions.

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%205-339933?logo=node.js)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%205.22-2d3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20%2F%20PostgreSQL-336791?logo=postgresql)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-4285f4?logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
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
- [Main Topics & Curriculum Coverage](#-main-topics--curriculum-coverage)
- [Core Feature Modules](#-core-feature-modules)
  - [1. Knowledge Tracing & Learning Gaps Engine](#1-knowledge-tracing--learning-gaps-engine)
  - [2. Question Bank & Human-in-the-Loop AIG Workflow](#2-question-bank--human-in-the-loop-aig-workflow)
  - [3. Dual AI Chatbot Ecosystem](#3-dual-ai-chatbot-ecosystem)
  - [4. Interactive Weekly Quiz Engine](#4-interactive-weekly-quiz-engine)
  - [5. Faculty & Department Intelligence Portal](#5-faculty--department-intelligence-portal)
- [Role-Based Feature Matrix](#-role-based-feature-matrix)
  - [1. Student Experience](#1-student-experience)
  - [2. Faculty Experience](#2-faculty-experience)
  - [3. Administrator Experience](#3-administrator-experience)
  - [4. Cross-Cutting Systems](#4-cross-cutting-systems)
- [Tech Stack Details](#-tech-stack-details)
- [Database Schema & ERD (Prisma)](#-database-schema--erd-prisma)
- [Comprehensive REST API Reference](#-comprehensive-rest-api-reference)
- [Repository Directory Structure](#-repository-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup & Supabase Connection](#2-backend-setup--supabase-connection)
  - [3. Database Migration & Seed](#3-database-migration--seed)
  - [4. Frontend Setup](#4-frontend-setup)
- [Default Demo Accounts](#-default-demo-accounts)
- [Environment Variables Guide](#-environment-variables-guide)
- [Available Scripts](#-available-scripts)
- [Design System & UI Conventions](#-design-system--ui-conventions)
- [Future Roadmap](#-future-roadmap)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview & Core Value

Traditional academic learning environments face a recurring structural problem: examinations and test results evaluate performance after the teaching cycle has already concluded. Faculty receive letter grades rather than diagnostic insights, and students move on to advanced coursework with undetected prerequisite learning gaps.

**Acadexa** transforms classroom evaluation into an automated, actionable feedback cycle:

```mermaid
flowchart LR
    A["1. ASSESS<br/>Weekly Micro-Quizzes & Timed Tests"] -->|Item-Level Telemetry| B["2. IDENTIFY<br/>Knowledge Tracing & Bloom Mapping"]
    B -->|Flagged Gaps & Weakness Matrix| C["3. IMPROVE<br/>Remedial Quizzes & AI Mentoring"]
    C -->|Targeted Interventions| A
```

- **Assess**: Weekly micro-quizzes and practice sets run on an engaging, Kahoot-style proctored test engine.
- **Identify**: Student responses map directly to curricular topics, generating live learning gap matrices for students, sections, and department heads based on Bayesian knowledge tracing.
- **Improve**: Faculty dispatch single-click remedial quizzes targeting specific weak syllabus topics, while students utilize the integrated Google Gemini AI Academic Tutor for pedagogical assistance.

---

## ⚡ Key Highlights

- **🧠 Continuous Knowledge Tracing Engine**: Tracks item-level telemetry across quiz submissions. Aggregates historical accuracy grouped by **Topic** and **Bloom's Cognitive Level**.
- **🎯 Automated Learning Gap Flagging**: If a student's topic mastery drops below **60%**, Acadexa automatically flags it as a **"Learning Gap"** (`CRITICAL`, `HIGH`, or `MODERATE` severity) and generates targeted remedial recommendations.
- **✨ Automated Item Generation (AIG) with Human-in-the-Loop**: Faculty generate curriculum-aligned MCQs using **Google Gemini 1.5 Flash** mapped to Bloom's Taxonomy. Questions enter a `PENDING_APPROVAL` queue where faculty can verify, edit, or reject them before they enter active quizzes.
- **🤖 Dual AI Chatbot Ecosystem**:
  1. **Academic AI Tutor**: Pedagogical conversational partner guiding students through coding and algorithmic problems with Socratic hints.
  2. **Department Information Chatbot**: Instant answers to departmental queries—exam schedules, symposiums, faculty office hours, and academic calendars grounded in departmental data.
- **🎮 High-Engagement Quiz Engine**: Fullscreen proctored assessment screen featuring Web Audio API synthesized tones (chords for correct answers, low buzzers for incorrect), streak multipliers, countdown timers, four-color Kahoot-style options, and celebratory Canvas Confetti.
- **📊 Multi-Modal Mastery Visualizations**: Interactive **Radar Charts**, **Bloom's Cognitive Level Bar Charts**, and a **Heatmap Grid Matrix** (cross-tabulating topics × Bloom's levels) powered by **Recharts**.
- **👩‍🏫 Dual-Stage Faculty Workspace**: Class switcher allowing faculty to seamlessly toggle between assigned semesters and sections (e.g., *CS 5th Sem - Section A*), access aggregated grade distributions, and initiate remedial interventions.
- **🏛️ Institutional Admin Console**: Complete management of departments, semesters, sections, faculty course assignments, student enrollments, course catalogs, and campus-wide notifications.
- **📄 Instant Academic PDF Generator**: Built-in client-side engine to export cleanly formatted academic question papers with answer keys directly to print/PDF from the question bank.
- **🛡️ Hybrid Database & Resilient Offline Fallback**: Native support for **Supabase Cloud PostgreSQL** and local PostgreSQL, with resilient mock fallbacks for zero-friction evaluations.

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
        DB[("PostgreSQL Database (Supabase)")]
        GeminiAPI["Google Gemini 1.5 Flash API"]
    end

    UI --> Router
    Router --> Services
    Services --> Axios
    Services -.-> Fallback
    Axios -->|HTTP Requests + Bearer JWT| API
    API --> JWTMiddleware
    JWTMiddleware --> Controllers
    Controllers --> PrismaORM
    PrismaORM --> DB
    Controllers -->|AI Generation & Tutoring| GeminiAPI
```

---

## 📚 Main Topics & Curriculum Coverage

Acadexa is initialized with a robust computer science curriculum (Data Structures & Algorithms — `CS-201`) evaluated against **Bloom's Revised Taxonomy**:

### 1. Core Syllabus Topics
- **Arrays**: Time complexities, sequential access, two-pointer techniques, Kadane's maximum subarray sum, and in-place manipulations. *(Baseline mastery: ~92%)*
- **Binary Trees & BST**: Tree traversals (Inorder, Preorder, Postorder, Level-order), AVL tree balancing factors, worst-case search complexities in skewed BSTs, and binary heap invariants. *(Baseline mastery: ~45% — Flagged Learning Gap)*
- **Stacks & Queues**: LIFO/FIFO principles, monotonic stack patterns (Next Greater Element), infix-to-postfix conversion, and circular queue buffer management. *(Baseline mastery: ~80%)*
- **Graph Algorithms**: BFS/DFS traversal orderings, cycle detection, Dijkstra's single-source shortest path, and Prim's/Kruskal's Minimum Spanning Tree (MST). *(Baseline mastery: ~55% — Flagged Learning Gap)*
- **Dynamic Programming & Recursion**: Optimal substructure, overlapping subproblems, memoization vs. tabulation, and Knapsack problem states. *(Baseline mastery: ~38% — Flagged Learning Gap)*

### 2. Bloom's Taxonomy Cognitive Levels
Every question and attempt in Acadexa is cataloged with an explicit cognitive level:
- **`CL1_REMEMBER`**: Recall facts, syntax, definitions, and standard asymptotic bounds (e.g., array index lookup complexity $O(1)$).
- **`CL2_UNDERSTAND`**: Explain algorithm behavior, traversal outputs, and conceptual differences (e.g., why inorder traversal of a BST yields sorted order).
- **`CL3_APPLY`**: Implement techniques in specific algorithmic scenarios (e.g., using Kadane's algorithm or monotonic stacks).
- **`CL4_ANALYZE`**: Deconstruct efficiency, contrast algorithms, and analyze worst-case degradation (e.g., analyzing $O(n)$ search in unbalanced BSTs).
- **`CL5_EVALUATE`**: Validate invariants, critique algorithm choices, and assess boundary constraints.
- **`CL6_CREATE`**: Formulate novel solutions, design composite data structures, and synthesize hybrid algorithmic routines.

---

## 🧩 Core Feature Modules

### 1. Knowledge Tracing & Learning Gaps Engine

Located in `server/src/services/analytics.ts` & `server/src/services/analyticsService.ts`:

- **Historical Accuracy Aggregation**: When a student completes any quiz, the engine queries all their historical `QuizAttempt` and `AttemptAnswer` records, grouping answers by `topic` and `cognitiveLevel`.
- **Automatic 60% Passing Threshold**:
  $$\text{Mastery Score} = \left(\frac{\text{Correct Answers in Topic}}{\text{Total Attempts in Topic}}\right) \times 100$$
  - If $\text{Mastery Score} < 60\%$, the topic is immediately flagged:
    - **`CRITICAL` Severity**: Mastery $< 45%$ (e.g., Dynamic Programming: $38\%$, Trees: $45\%$).
    - **`HIGH` Severity**: Mastery $45\% - 59\%$ (e.g., Graph Algorithms: $55\%$).
    - **`MODERATE` Severity**: Mastery $60\% - 74\%$.
    - **`MASTERED`**: Mastery $\ge 75\%$ (e.g., Arrays: $92\%$, Stacks: $80\%$).
- **Multi-Modal Visualizations** on `src/pages/student/LearningGaps.tsx` & `src/pages/student/Dashboard.tsx`:
  - **Radar Chart**: Displays the student's mastery polygon overlaying the dashed red 60% passing benchmark.
  - **Heatmap Grid**: Cross-tabulation table displaying accuracy percentages across Bloom's levels with color-coded heat badges.
  - **Bloom's Cognitive Bar Chart**: Aggregated proficiency bar chart across all six cognitive tiers.
- **Actionable "Recommended Practice"**:
  - Each flagged weak topic displays a dedicated **"Recommended Practice"** button.
  - Clicking launches a targeted Remedial Practice modal with tailored MCQs, instant validation, explanation feedback, and live score updates.

---

### 2. Question Bank & Human-in-the-Loop AIG Workflow

Located in `server/src/routes/questions.ts` and `src/pages/faculty/QuestionBank.tsx`:

- **Automated Item Generation (AIG) via Gemini 1.5 Flash**:
  - Faculty specify: `Subject`, `Topic`, `Difficulty` (`EASY`, `MEDIUM`, `HARD`), and `Bloom's Cognitive Level` (`CL1_REMEMBER` to `CL6_CREATE`).
  - Calls Gemini 1.5 Flash with structured prompt engineering to generate questions with 4 distinct options, exactly 1 correct answer, and an in-depth pedagogical explanation.
- **Human-in-the-Loop Approval Queue**:
  - Newly generated questions enter the database with status `PENDING_APPROVAL`.
  - Faculty review the generated item on their dashboard to **Approve**, **Edit**, or **Reject** questions.
- **Question Paper Bank**:
  - Institutional repository of past university and mid-term exam papers.
  - Includes PDF generation capabilities via `questionPdfGenerator.ts` for offline test printing.

---

### 3. Dual AI Chatbot Ecosystem

Acadexa features two distinct conversational agents tailored for different needs:

#### A. Academic AI Study Tutor
- **UI Location**: `src/pages/student/AcademicChatbot.tsx` + Floating Global Widget (`NexusFloatingWidget.tsx`).
- **Backend Route**: `POST /api/chatbot` (powered by Google Gemini 1.5 Flash).
- **Pedagogical Persona**: Acts as an academic tutor. Uses Socratic guidance, analogies, and conceptual hints rather than directly outputting homework solutions.

#### B. Department Information & Campus Assistant
- **UI Location**: `src/pages/student/DepartmentInfo.tsx`.
- **Backend Route**: Grounded in Prisma models `DeptInformation` and `SyllabusDocument`.
- **Capabilities**:
  - **Examinations**: Official schedules, timetable slots, and room allocations.
  - **Events & Symposiums**: Department symposiums, hackathons, and tech seminars.
  - **Faculty Directory**: Room numbers, office hours, and subject assignments.
  - **Academic Policies**: Attendance rules, grading rubrics, and holiday calendars.

---

### 4. Interactive Weekly Quiz Engine

Located in `src/pages/student/QuizScreen.tsx` and `src/pages/student/QuizResult.tsx`:

- **Proctored Fullscreen Experience**: Automatic fullscreen prompt to minimize external distractions.
- **High-Contrast Option Tiles**: Clean, distinct, accessibility-tested color tiles (Olive, Purple, Orange, Teal) with clear A-B-C-D letter badges and instant visual feedback.
- **Web Audio API Sound Synthesis**: Polyphonic synthesized chords for correct answers, low buzzers for incorrect answers, and transition audio.
- **Combo Multiplier & Confetti**: Streak bonuses ($100 + \text{combo} \times 20$ points) and celebratory canvas confetti.
- **Telemetry Recording**: Evaluates attempts, calculates time-taken, and immediately triggers Knowledge Tracing updates.

---

### 5. Faculty & Department Intelligence Portal

Located in `src/pages/faculty/`:

- **Class Selector & Section Switching**: Switch between assigned semesters and sections (e.g., *CS 5th Sem - Section A*).
- **Class Analytics Dashboard**: Aggregate score distributions, average performance metrics, participation rates, and difficult question heatmaps.
- **3-Step Quiz Builder**: Create weekly or remedial quizzes by selecting topics, choosing approved question bank items, and scheduling target dates.
- **Remedial Assignment Dispatch**: One-click dispatch of remedial quizzes targeted at students identified as having learning gaps.

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
| **Question Bank & AI** | `/faculty/question-bank` | Review AI-generated questions, approve items for active quizzes, or author new MCQs. |
| **Faculty Profile & Settings**| `/faculty/profile`, `/faculty/settings` | Faculty credentials, subject designations, and portal configurations. |

### 3. Administrator Experience

| Feature / Module | Route | Description |
|---|---|---|
| **Admin Overview** | `/admin` | Campus-wide KPI dashboard: total enrolled students, active faculty, courses, sections, overall pass rates, and year-wise performance metrics. |
| **Faculty Management** | `/admin/faculty` | Faculty directory, profile creation, and assignment to specific semester sections and subjects (`FacultySubject` mapping). |
| **Course Catalog Management**| `/admin/courses` | Creation, modification, and deletion of subjects, course codes, credits, and semester associations. |
| **Student Management** | `/admin/students` | Student records, roll number assignment, section transfers, and academic status monitoring. |
| **Section Management** | `/admin/sections` | Department section provisioning (e.g., Year 3, Semester 5, Section A/B/C) with student roster counts. |
| **Broadcast Notifications** | `/admin/notifications` | Creation and dispatch of institutional announcements across students, faculty, or all campus users. |
| **Admin Profile & Settings** | `/admin/profile`, `/admin/settings` | Institution settings, admin credentials, and platform maintenance toggles. |

### 4. Cross-Cutting Systems

- **Global Notification Hub**: Topbar dropdown fetching live user notifications from `/api/notifications` with real-time unread badges and one-click mark-as-read.
- **Persistent AI Chatbot Drawer**: Floating Nexus widget available across student screens for instant academic Q&A.
- **Client-Side PDF Document Compiler**: Generates print-ready examination question papers directly in the browser via `questionPdfGenerator.ts`.

---

## 🛠 Tech Stack Details

### Frontend Architecture
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript 5.x](https://www.typescriptlang.org/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + CSS Custom Properties (Theme tokens)
- **Component Primitives**: Custom design system (`Button`, `Card`, `Badge`, `Tabs`, `Modal`, `Dropdown`, `ProgressBar`, etc.)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Visualizations**: [Recharts 2.x](https://recharts.org/)
- **Micro-Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Celebration Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend Architecture
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Server Framework**: [Express 5](https://expressjs.com/)
- **Development Tooling**: [ts-node-dev](https://www.npmjs.com/package/ts-node-dev)
- **Database & ORM**: [Prisma ORM 5.22](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com/))
- **Security & Authentication**: [JSON Web Tokens (jsonwebtoken)](https://jwt.io/) + [bcryptjs](https://www.npmjs.com/package/bcryptjs) password hashing
- **Artificial Intelligence**: [Google Generative AI SDK](https://ai.google.dev/) (`@google/generative-ai` / Gemini 1.5 Flash)

---

## 🗄 Database Schema & ERD (Prisma)

The schema is defined in `server/prisma/schema.prisma`:

```mermaid
erDiagram
    User ||--o| Student : "has student profile"
    User ||--o| Faculty : "has faculty profile"
    User ||--o{ Notification : "receives"
    
    Department ||--o{ Section : "contains"
    Department ||--o{ Subject : "curates"
    
    Section ||--o{ Student : "enrolls"
    Section ||--o{ FacultyAssignment : "hosts"
    Section ||--o{ Quiz : "scheduled for"
    
    Subject ||--o{ Topic : "contains"
    Subject ||--o{ FacultyAssignment : "assigned to"
    Subject ||--o{ Quiz : "tested in"
    Subject ||--o{ QuestionPaper : "archives"
    
    Faculty ||--o{ FacultyAssignment : "teaches"
    
    Topic ||--o{ Question : "categorizes"
    
    Question ||--o{ Option : "provides"
    Question ||--o{ QuizQuestion : "included in"
    Question ||--o{ AttemptAnswer : "answered as"
    
    Quiz ||--o{ QuizQuestion : "comprises"
    Quiz ||--o{ QuizAttempt : "completed in"
    
    Student ||--o{ QuizAttempt : "submits"
    QuizAttempt ||--o{ AttemptAnswer : "contains"
```

---

## 📡 Comprehensive REST API Reference

Base URL: `http://localhost:3001/api`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Authenticates credentials and returns JWT token & user payload |
| `POST` | `/auth/register` | Public | Registers a new student account |
| `GET` | `/auth/me` | Authenticated | Retrieves current user profile with role-specific student/faculty relations |

### 2. Department Information (`/api/dept`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dept/info` | Authenticated | Retrieves official notices, academic calendar, achievements, and events |
| `GET` | `/dept/syllabus/:subjectId` | Authenticated | Fetches complete syllabus curriculum for RAG context |

### 3. Institutional Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/overview` | Admin | Retrieves campus KPIs (total students, faculty, courses, sections, pass rate) |
| `GET` | `/admin/faculty` | Admin | Lists all faculty members with department & assigned teaching sections |
| `POST` | `/admin/faculty` | Admin | Creates a faculty account & assigns initial courses |
| `PUT` | `/admin/faculty/:id` | Admin | Updates faculty personal details & workload assignments |
| `DELETE` | `/admin/faculty/:id` | Admin | Deactivates or removes a faculty record |
| `GET` | `/admin/courses` | Admin | Catalogs all institutional subjects by department and semester |
| `POST` | `/admin/courses` | Admin | Adds a new course to the curriculum |
| `PUT` | `/admin/courses/:id` | Admin | Modifies course code, title, credits, or semester |
| `DELETE` | `/admin/courses/:id` | Admin | Deletes an unassigned course record |
| `GET` | `/admin/students` | Admin | Lists student roster with search, section filter, and academic status |
| `POST` | `/admin/students` | Admin | Registers a student into a designated department section |
| `PUT` | `/admin/students/:id` | Admin | Modifies student enrollment, section assignment, or status |
| `DELETE` | `/admin/students/:id` | Admin | Removes student registration |
| `GET` | `/admin/sections` | Admin | Lists all department sections with real enrolled student counts |
| `POST` | `/admin/sections` | Admin | Creates a new academic section (e.g. Sem 5, Sec C) |
| `PUT` | `/admin/sections/:id` | Admin | Edits section capacity or descriptor |
| `DELETE` | `/admin/sections/:id` | Admin | Removes an empty section |
| `POST` | `/admin/notifications`| Admin | Broadcasts an institutional notification to students, faculty, or all users |

### 4. Quizzes & Assessments (`/api/quizzes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/quizzes` | Authenticated | Retrieves available quizzes for the student's enrolled section or faculty's classes |
| `GET` | `/quizzes/:id` | Authenticated | Retrieves quiz details, questions, options, and duration |
| `POST` | `/quizzes` | Faculty / Admin | Creates a new weekly or remedial quiz with selected question bank items |
| `POST` | `/quizzes/:id/attempt` | Student | Submits completed quiz answers, computes score, and logs topic telemetry |
| `GET` | `/quizzes/:id/my-attempt`| Student | Fetches student's recorded attempt, accuracy percentage, and answer keys |

### 5. Questions & AIG Generation (`/api/questions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/questions` | Authenticated | Retrieves question bank items filtered by subject, topic, difficulty, or status |
| `POST` | `/questions` | Faculty / Admin | Manually creates an assessment question with distractors and explanation |
| `POST` | `/questions/generate` | Faculty / Admin | Generates MCQs via Gemini 1.5 Flash mapped to Bloom's taxonomy |
| `PATCH` | `/questions/:id/status`| Faculty / Admin | Approves or rejects a pending AI-generated question |

### 6. Analytics & Knowledge Tracing (`/api/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/analytics/knowledge-tracing` | Authenticated | Computes Bayesian knowledge profile across topics & Bloom tiers |
| `GET` | `/analytics/practice/:topicId`| Authenticated | Fetches recommended practice questions for a flagged weak topic |
| `GET` | `/analytics/student/:id` | Authenticated | Retrieves student overall score, streak, and recent attempt history |
| `GET` | `/analytics/section/:id` | Faculty / Admin | Computes section-level score distribution and quiz completion metrics |
| `GET` | `/analytics/leaderboard/:sectionId` | Authenticated | Calculates section student rankings by aggregate performance |
| `GET` | `/analytics/class-gaps` | Faculty / Admin | Computes cohort-wide learning gaps and failure rates |
| `POST` | `/analytics/remedial-quiz` | Faculty / Admin | Automatically pulls APPROVED questions for weak topics & assigns remedial quiz |
| `GET` | `/analytics/faculty/learning-gaps` | Faculty / Admin | Retrieves topic performance breakdown for faculty assigned classes |

### 7. Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | Authenticated | Retrieves personal notifications and unread counter |
| `PATCH` | `/notifications/:id/read` | Authenticated | Marks a specific notification as read |
| `PATCH` | `/notifications/read-all` | Authenticated | Marks all notifications as read |

### 8. AI Academic Tutor (`/api/chatbot`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/chatbot` | Authenticated | Sends conversational query to Gemini 1.5 Flash with Socratic tutoring persona |

---

## 📂 Repository Directory Structure

```
Acadexa/
├── index.html                 # Frontend single-page application entry HTML
├── package.json               # Root dependencies (React, Vite, Tailwind, Recharts)
├── tsconfig.json              # Root TypeScript compiler options
├── vite.config.ts             # Vite configuration with proxy rules
├── tailwind.config.js         # Tailwind CSS design system tokens
│
├── src/                       # Frontend Source Directory
│   ├── components/            # Reusable UI component library
│   │   ├── chatbot/           # Academic AI Tutor & Nexus floating widgets
│   │   ├── dashboard/         # Stat cards, performance widgets
│   │   ├── faculty/           # Class switcher & section selector
│   │   ├── layout/            # Sidebar, Topbar, DashboardLayout, PageHeader
│   │   ├── leaderboard/       # Leaderboard ranking tables
│   │   └── ui/                # Core primitives (Button, Card, Badge, Modal, Tabs)
│   ├── context/               # Global state providers (AuthContext.tsx)
│   ├── data/                  # Resilient offline fallback data
│   ├── lib/                   # API clients (apiClient.ts) & helper utilities
│   ├── pages/                 # Route page views
│   │   ├── admin/             # Admin console (Overview, Faculty, Courses, Students, Sections, Notifications)
│   │   ├── auth/              # Login screen with 1-click demo buttons
│   │   ├── faculty/           # Faculty portal (Dashboard, ClassAnalytics, QuizBuilder, QuizManagement, PaperBank)
│   │   └── student/           # Student portal (Dashboard, Courses, Quiz, QuizScreen, QuizResult, LearningGaps)
│   ├── routes/                # Route definitions & guards (AppRoutes.tsx)
│   ├── services/              # API caller services with fallback resilience
│   └── types/                 # Shared TypeScript interfaces
│
└── server/                    # Backend API Source Directory
    ├── package.json           # Backend dependencies (Express, Prisma, JWT, Bcrypt)
    ├── prisma/                # Prisma schema & database seeds
    │   ├── schema.prisma      # Relational PostgreSQL models
    │   └── seed.ts            # Curriculum, demo users, sections & quiz seeder
    └── src/
        ├── index.ts           # Express server entry point & route registration
        ├── middleware/        # JWT authentication (auth.ts) & global errorHandler.ts
        ├── routes/            # REST endpoint routers (admin, auth, quizzes, analytics, chatbot, dept, etc.)
        └── services/          # Business logic services (analytics, auth, quizzes, chatbot, skill gaps)
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (bundled with Node.js) or **pnpm** / **yarn**
- **PostgreSQL**: Local PostgreSQL instance OR a free cloud project on [Supabase](https://supabase.com/).  
  *(Note: Even without PostgreSQL, you can run and fully explore the frontend via its automatic mock fallback mode).*

---

### 1. Clone Repository

```bash
git clone https://github.com/chaman284/Acadexa.git
cd Acadexa
```

---

### 2. Backend Setup & Supabase Connection

Navigate to `server/` and install dependencies:

```bash
cd server
npm install
```

#### Configure `server/.env`
Create `server/.env` (or copy from `server/.env.example`):

```env
# Server Configuration
PORT=3001
CORS_ORIGIN="http://localhost:5173"

# Supabase or Local PostgreSQL Connection String
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

---

### 3. Database Migration & Seed

Sync the Prisma schema to your PostgreSQL database and run the seeder:

```bash
# Generate Prisma Client types
npm run prisma:generate

# Sync schema directly to database
npx prisma db push

# Seed initial curriculum, topics, demo users, sections, and questions
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

The Express server will start at **`http://localhost:3001`** (API Base: `http://localhost:3001/api`).

---

### 4. Frontend Setup

In a new terminal window, navigate to the project root:

```bash
cd Acadexa
npm install
```

#### Configure Root `.env`
Create `.env` in the root directory:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-publishable-key"
DATABASE_URL="postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=public"
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

| Role | Email | Password | Assigned Scope & Details |
|---|---|---|---|
| **Student** | `student@college.edu` | `student123` | CS Sem 5, Section A. Full quiz participation, learning gap tracker, leaderboard, and AI tutor. |
| **Student** | `chaman@cs.college.edu` | `student123` | Pre-populated with Knowledge Tracing data (Arrays: 92%, Trees: 45%). |
| **Student** | `rehan@cs.college.edu` | `rehan123` | Rehan Patel (CS 5th Semester, Sec A). |
| **Faculty** | `faculty@college.edu` | `faculty123` | Dr. Ramesh Kumar (CS Dept). Class analytics, 3-step quiz builder, remedial quiz dispatch, paper bank. |
| **Faculty** | `faculty@cs.college.edu` | `faculty123` | Dr. Ramesh Kumar (CS Dept Faculty Account). |
| **Faculty** | `soumya@cs.college.edu` | `soumya123` | Soumya (CS Dept Faculty). |
| **Admin** | `admin@college.edu` | `admin123` | System Administrator. Institutional KPIs, faculty workload assignments, course catalog, student roster, section provisioning, broadcast notifications. |

---

## ⚙️ Environment Variables Guide

### Frontend (`.env` / `.env.local`)
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
| `GEMINI_API_KEY` | String | Optional | Google AI Studio API key for live Gemini 1.5 Flash tutor responses. |
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
- **Audio Synthesizer**: Uses native HTML5 `AudioContext` to construct harmonic chords for winning streaks and low buzzers for errors without downloading heavy audio files.
- **Accessibility & Responsiveness**: Fluid layouts supporting multi-monitor desktop workstations, laptops, and mobile screens via slide-out sidebars and collapsible drawers.

---

## 🗺️ Future Roadmap

- [ ] **AI Question Generation from Syllabus / Slides**: Ingest lecture slides (PDF/PPTX) and auto-generate Bloom's taxonomy-classified questions into the Question Bank.
- [ ] **Automated Remedial Dispatch Trigger**: Automatically schedule and assign remedial quizzes to students when their topic accuracy drops below 60%.
- [ ] **College ERP / SIS Bi-Directional Integration**: Direct sync with university student information systems and official grade books.
- [ ] **Mobile Companion PWA**: Native-like mobile experience for rapid daily practice quizzes and push alerts.
- [ ] **Multi-College Multi-Tenancy**: Institution-level partitioning for multi-campus universities.

---

## 🤝 Contributing & License

Contributions, feedback, and pull requests are welcomed!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m "feat: add amazing feature"`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

This project is licensed under the **ISC License**.

---

<p align="center">
  <b>Acadexa</b> — Empowering Students, Faculty, and Administrators with Academic Intelligence.<br>
  Built with ❤️ for higher education excellence.
</p>
