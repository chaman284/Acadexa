# 🎓 Acadexa

> **Assess. Identify. Improve.**  
> An intelligent, department-level academic intelligence, adaptive assessment, and continuous learning gap remediation platform built for higher education.

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%205-339933?logo=node.js)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%205.22-2d3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20%2F%20PostgreSQL-336791?logo=postgresql)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-4285f4?logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Highlights](#-key-highlights)
- [System Architecture](#-system-architecture)
- [Main Topics & Curriculum Coverage](#-main-topics--curriculum-coverage)
- [Core Feature Modules](#-core-feature-modules)
  - [1. Knowledge Tracing & Learning Gaps Engine](#1-knowledge-tracing--learning-gaps-engine)
  - [2. Question Bank & Human-in-the-Loop AIG Workflow](#2-question-bank--human-in-the-loop-aig-workflow)
  - [3. Dual AI Chatbot Ecosystem](#3-dual-ai-chatbot-ecosystem)
    - [Academic AI Study Tutor](#a-academic-ai-study-tutor)
    - [Department Information & Campus Assistant](#b-department-information--campus-assistant)
  - [4. Interactive Weekly Quiz Engine](#4-interactive-weekly-quiz-engine)
  - [5. Faculty & Department Intelligence Portal](#5-faculty--department-intelligence-portal)
- [Database Schema (Prisma)](#-database-schema-prisma)
- [Complete API Reference](#-complete-api-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup & Supabase Connection](#2-backend-setup--supabase-connection)
  - [3. Database Migration & Seed](#3-database-migration--seed)
  - [4. Frontend Setup](#4-frontend-setup)
- [Environment Variables Guide](#-environment-variables-guide)
- [Default Demo Credentials](#-default-demo-credentials)
- [Available Scripts](#-available-scripts)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**Acadexa** is an academic intelligence and adaptive assessment ecosystem designed for engineering and higher education departments. Traditional Learning Management Systems (LMS) simply store marks without explaining *why* a student struggled, *which* cognitive skills failed, or *how* to intervene before high-stakes semester examinations.

Acadexa transforms classroom evaluation into an automated, actionable feedback cycle:

```
    ┌───────────────────────────┐
    │       1. ASSESS           │
    │  Weekly Quizzes, Proctored│
    │  Assessments & Feedback   │
    └─────────────┬─────────────┘
                  │
                  ▼
    ┌───────────────────────────┐
    │       2. IDENTIFY         │
    │ Knowledge Tracing Engine  │
    │  Bloom's Cognitive Mapping│
    │ Learning Gaps (<60% Flag) │
    └─────────────┬─────────────┘
                  │
                  ▼
    ┌───────────────────────────┐
    │       3. IMPROVE          │
    │ Targeted Remedial Practice│
    │ Academic AI Tutor Hints   │
    │ Human-in-the-Loop Reviews │
    └───────────────────────────┘
```

---

## ⚡ Key Highlights

- **🧠 Continuous Knowledge Tracing Engine**: Tracks item-level telemetry across quiz submissions. Aggregates historical accuracy grouped by **Topic** and **Bloom's Cognitive Level**.
- **🎯 Automated Learning Gap Flagging**: If a student's topic mastery drops below **60%**, Acadexa automatically flags it as a **"Learning Gap"** (`CRITICAL`, `HIGH`, or `MODERATE` severity) and generates targeted remedial recommendations.
- **✨ Automated Item Generation (AIG) with Human-in-the-Loop**: Faculty generate curriculum-aligned MCQs using **Google Gemini 1.5 Flash** mapped to Bloom's Taxonomy. Questions enter a `PENDING_APPROVAL` queue where faculty can verify, edit, or reject them before they enter active quizzes.
- **🤖 Dual AI Chatbot Ecosystem**:
  1. **Academic AI Tutor**: Pedagogical conversational partner guiding students through coding and algorithmic problems with Socratic hints.
  2. **Department Information Chatbot**: Instant answers to departmental queries—exam schedules, symposiums, faculty office hours, and academic calendars grounded in departmental data.
- **📝 Proctored Interactive Quiz Engine**: Fullscreen proctored assessment screen with polyphonic Web Audio API sound synthesis (custom chords and buzzer effects), combo streak multipliers, countdown timers, and celebratory canvas confetti.
- **📊 Multi-Modal Mastery Visualizations**: Interactive **Radar Charts**, **Bloom's Cognitive Level Bar Charts**, and a **Heatmap Grid Matrix** (cross-tabulating topics × Bloom's levels) powered by **Recharts**.
- **🛡️ Hybrid Database & Resilient Offline Fallback**: Native support for **Supabase Cloud PostgreSQL** and local PostgreSQL, with resilient mock fallbacks for zero-friction evaluations.

---

## 🏛 System Architecture

```mermaid
graph TD
    subgraph Client["Frontend (React 19 + TypeScript + Vite + Tailwind)"]
        UI["Student & Faculty Portals"]
        Radar["Recharts Radar & Heatmap Visualizers"]
        QuizUI["Interactive Quiz Engine"]
        ChatUI["Dual AI Chatbot Interface"]
    end

    subgraph Server["Backend (Node.js + Express 5 + TypeScript)"]
        API["Express REST API (/api)"]
        AuthMid["JWT Middleware & Role Guard"]
        KTService["Knowledge Tracing Engine (analytics.ts)"]
        QuizService["Quiz Attempt Evaluator (quizService.ts)"]
        AIGService["Gemini AIG & Question Bank (questions.ts)"]
        ChatbotService["Gemini AI Tutor & Dept Router (chatbot.ts)"]
    end

    subgraph DataLayer["Persistence & External Services"]
        Prisma["Prisma ORM 5.22"]
        DB[(Supabase / PostgreSQL Database)]
        GeminiAPI["Google Gemini 1.5 Flash API"]
    end

    UI -->|REST + Bearer Token| API
    QuizUI -->|Submit Attempts| QuizService
    ChatUI -->|Tutor Inquiries| ChatbotService
    
    API --> AuthMid
    AuthMid --> KTService
    AuthMid --> AIGService
    AuthMid --> QuizService
    
    KTService --> Prisma
    AIGService --> Prisma
    QuizService --> Prisma
    
    Prisma --> DB
    AIGService -->|Prompt + Cognitive Level| GeminiAPI
    ChatbotService -->|Conversation History| GeminiAPI
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

Located in [server/src/services/analytics.ts](file:///Users/aryanprasad/Acadexa/server/src/services/analytics.ts):

- **Historical Accuracy Aggregation**: When a student completes any quiz, the engine queries all their historical `QuizAttempt` and `AttemptAnswer` records. It groups answers by `topic` and `cognitiveLevel`.
- **Automatic 60% Passing Threshold**:
  $$\text{Mastery Score} = \left(\frac{\text{Correct Answers in Topic}}{\text{Total Attempts in Topic}}\right) \times 100$$
  - If $\text{Mastery Score} < 60\%$, the topic is immediately flagged:
    - **`CRITICAL` Severity**: Mastery $< 45\%$ (e.g., Dynamic Programming: $38\%$, Trees: $45\%$).
    - **`HIGH` Severity**: Mastery $45\% - 59\%$ (e.g., Graph Algorithms: $55\%$).
    - **`MODERATE` Severity**: Mastery $60\% - 74\%$.
    - **`MASTERED`**: Mastery $\ge 75\%$ (e.g., Arrays: $92\%$, Stacks: $80\%$).
- **Multi-Modal Visualizations** on [src/pages/student/Dashboard.tsx](file:///Users/aryanprasad/Acadexa/src/pages/student/Dashboard.tsx):
  - **Radar Chart**: Displays the student's mastery polygon overlaying the dashed red 60% passing benchmark.
  - **Heatmap Grid**: Cross-tabulation table displaying accuracy percentages across Bloom's levels (`CL1 Rem`, `CL2 Und`, `CL3 App`, `CL4 Ana`) with color-coded heat badges.
  - **Bloom's Cognitive Bar Chart**: Aggregated proficiency bar chart across all six cognitive tiers.
- **Actionable "Recommended Practice"**:
  - Each flagged weak topic displays a dedicated **"Recommended Practice"** button.
  - Clicking launches a targeted Remedial Practice modal with tailored MCQs, instant validation, explanation feedback, and live score updates.

---

### 2. Question Bank & Human-in-the-Loop AIG Workflow

Located in [server/src/routes/questions.ts](file:///Users/aryanprasad/Acadexa/server/src/routes/questions.ts) and [src/pages/faculty/QuestionBank.tsx](file:///Users/aryanprasad/Acadexa/src/pages/faculty/QuestionBank.tsx):

- **Automated Item Generation (AIG) via Gemini 1.5 Flash**:
  - Faculty specify: `Subject`, `Topic`, `Difficulty` (`EASY`, `MEDIUM`, `HARD`), and `Bloom's Cognitive Level` (`CL1_REMEMBER` to `CL6_CREATE`).
  - Calls Gemini 1.5 Flash with structured prompt engineering to generate questions with 4 distinct options, exactly 1 correct answer, and an in-depth pedagogical explanation.
- **Human-in-the-Loop Approval Queue**:
  - Newly generated questions enter the database with status `PENDING_APPROVAL`.
  - Faculty review the generated item on their dashboard:
    - **Approve**: Promotes question status to `APPROVED`, making it eligible for active weekly quizzes.
    - **Edit**: Faculty can edit the prompt text, modify distractors, adjust the cognitive level, or refine explanations.
    - **Reject**: Removes unapproved or sub-par AI suggestions.
- **Question Paper Bank**:
  - Institutional repository of past university and mid-term exam papers.
  - Includes PDF generation capabilities via `questionPdfGenerator.ts` for offline test printing.

---

### 3. Dual AI Chatbot Ecosystem

Acadexa features two distinct conversational agents tailored for different needs:

#### A. Academic AI Study Tutor
- **UI Location**: [src/pages/student/AcademicChatbot.tsx](file:///Users/aryanprasad/Acadexa/src/pages/student/AcademicChatbot.tsx) + Floating Global Widget.
- **Backend Route**: `POST /api/chatbot` (powered by Google Gemini 1.5 Flash).
- **Pedagogical Persona**: Acts as an academic tutor. Uses Socratic guidance, analogies, and conceptual hints rather than directly outputting homework solutions.
- **Pre-set Study Prompts**:
  - *"Explain my Trees quiz mistake"*
  - *"What is the difference between BFS and DFS?"*
  - *"Give me 3 practice questions on Binary Trees"*
  - *"Explain normalization with examples"*

#### B. Department Information & Campus Assistant
- **UI Location**: [src/pages/student/DepartmentInfo.tsx](file:///Users/aryanprasad/Acadexa/src/pages/student/DepartmentInfo.tsx).
- **Backend Route**: Grounded in Prisma models `DeptInformation` and `SyllabusDocument`.
- **Capabilities**:
  - **Examinations**: Official schedules, timetable slots, and room allocations (e.g., First Internal Examinations: Oct 15–22, 2026).
  - **Events & Symposiums**: Department symposiums, hackathons, and tech seminars.
  - **Faculty Directory**: Room numbers, office hours, and subject assignments (e.g., Dr. Ramesh Kumar, Room 405).
  - **Academic Policies**: Attendance rules, grading rubrics, and holiday calendars.

---

### 4. Interactive Weekly Quiz Engine

Located in [src/pages/student/QuizScreen.tsx](file:///Users/aryanprasad/Acadexa/src/pages/student/QuizScreen.tsx) and [src/pages/student/QuizResult.tsx](file:///Users/aryanprasad/Acadexa/src/pages/student/QuizResult.tsx):

- **Proctored Fullscreen Experience**: Automatic fullscreen prompt to minimize external distractions.
- **High-Contrast Option Tiles**: Clean, distinct, accessibility-tested color tiles (Olive, Purple, Orange, Teal) with clear A-B-C-D letter badges and instant visual feedback.
- **Web Audio API Sound Synthesis**:
  - **Ascending Chord (C-E-G)**: Plays celebratory polyphonic sine waves on correct answers.
  - **Harsh Descending Buzz**: Sawtooth wave with distortion curve on incorrect answers.
  - **Pop Sound**: Crisp transition audio between questions.
- **Combo Multiplier & Confetti**:
  - Consecutive correct answers earn combo streak multipliers ($100 + \text{combo} \times 20$ points).
  - Multi-colored canvas confetti blasts on correct responses and victory screens.
- **Telemetry Recording**:
  - Submits item-by-item selection, evaluates score, calculates time-taken, and immediately triggers a Knowledge Tracing profile update.

---

### 5. Faculty & Department Intelligence Portal

Located in [src/pages/faculty/](file:///Users/aryanprasad/Acadexa/src/pages/faculty/):

- **Class Selector & Section Switching**: Switch between assigned semesters and sections (e.g., *CS 5th Sem - Section A*).
- **Class Analytics Dashboard**: Aggregate score distributions, average performance metrics, participation rates, and difficult question heatmaps.
- **3-Step Quiz Builder**: Create weekly or remedial quizzes by selecting topics, choosing approved question bank items, and scheduling target dates.
- **Remedial Assignment Dispatch**: One-click dispatch of remedial quizzes targeted at students identified as having learning gaps.

---

## 🗄 Database Schema (Prisma)

The relational schema is defined in [server/prisma/schema.prisma](file:///Users/aryanprasad/Acadexa/server/prisma/schema.prisma):

```mermaid
erDiagram
    User ||--o| Student : "has profile"
    User ||--o| Faculty : "has profile"
    Department ||--o{ Section : "contains"
    Department ||--o{ Subject : "offers"
    Section ||--o{ Student : "enrolls"
    Section ||--o{ Quiz : "targets"
    Subject ||--o{ Topic : "contains"
    Subject ||--o{ Quiz : "evaluates"
    Subject ||--o{ SyllabusDocument : "documents"
    Topic ||--o{ Question : "categorizes"
    Question ||--o{ Option : "has"
    Question ||--o{ QuizQuestion : "included in"
    Question ||--o{ AttemptAnswer : "answered in"
    Quiz ||--o{ QuizQuestion : "consists of"
    Quiz ||--o{ QuizAttempt : "attempted by"
    Student ||--o{ QuizAttempt : "submits"
    QuizAttempt ||--o{ AttemptAnswer : "contains"
```

### Models Summary:
| Model | Description |
|---|---|
| **`User`** | Core credentials (`id`, `email`, `passwordHash`, `name`, `role: STUDENT \| FACULTY \| ADMIN`, `avatarUrl`). |
| **`Student`** | Academic student profile (`rollNo`, `sectionId`, linked `User`). |
| **`Faculty`** | Faculty profile (`userId`, subject assignments). |
| **`Department` & `Section`** | Academic hierarchy (`code: CS`, `semester: 5`, `section: A`). |
| **`Subject` & `Topic`** | Curriculum tree (`Data Structures (CS-201)` -> `Arrays`, `Trees`, `Stacks`, `Graphs`, `Dynamic Programming`). |
| **`Question`** | Assessment items (`text`, `type: MCQ`, `difficulty: EASY \| MEDIUM \| HARD`, `cognitiveLevel: CL1_REMEMBER` to `CL6_CREATE`, `status: DRAFT \| PENDING_APPROVAL \| APPROVED`, `explanation`). |
| **`Option`** | Answer choices (`text`, `isCorrect`, `questionId`). |
| **`Quiz` & `QuizQuestion`** | Assessments (`title`, `type: WEEKLY \| REMEDIAL \| PRACTICE`, `status: DRAFT \| ACTIVE \| COMPLETED`, `duration: 30`, `subjectId`, `sectionId`). |
| **`QuizAttempt` & `AttemptAnswer`**| Telemetry log (`score`, `timeTaken`, `submittedAt`, item-level selected option and `isCorrect`). |
| **`SyllabusDocument`** | Full course syllabus text used for RAG context. |
| **`DeptInformation`** | Official departmental notices, calendar dates, achievements, and events (`type: HOLIDAY \| EVENT \| ACHIEVEMENT`). |

---

## 📡 Complete API Reference

Base URL: `http://localhost:3001/api`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Authenticates credentials and returns JWT token + user profile |
| `POST` | `/auth/register` | Public | Registers a new student or faculty account |
| `POST` | `/auth/logout` | Authenticated | Clears user session |
| `GET` | `/auth/me` | Authenticated | Retrieves current authenticated user record |

### 2. Knowledge Tracing & Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/analytics/knowledge-tracing` | Authenticated (Student) | Computes full Knowledge Tracing profile, topic mastery scores, and flags `<60%` learning gaps |
| `GET` | `/analytics/knowledge-tracing/:studentId` | Authenticated | Computes Knowledge Tracing profile for a specific student ID |
| `GET` | `/analytics/practice/:topicId` | Authenticated | Fetches targeted remedial practice questions for a weak topic |
| `GET` | `/analytics/student/:id` | Authenticated | Retrieves student overall quiz performance summary |
| `GET` | `/analytics/section/:id` | Faculty / Admin | In-depth section-level analytics and score distributions |
| `GET` | `/analytics/gaps/:studentId` | Authenticated | Legacy learning gap analysis endpoint |
| `GET` | `/analytics/leaderboard/:sectionId` | Authenticated | Retrieves section ranking and leaderboard standings |

### 3. Question Bank & Human-in-the-Loop AIG (`/api/questions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/questions` | Authenticated | Queries question bank with filters for `topicId`, `difficulty`, `status`, and `cognitiveLevel` |
| `POST` | `/questions` | Faculty / Admin | Manually creates a new question with options |
| `POST` | `/questions/generate` | Faculty / Admin | **AIG Engine**: Calls Gemini 1.5 Flash to generate MCQs matching topic, difficulty, and Bloom's level. Saves as `PENDING_APPROVAL` |
| `PATCH` | `/questions/:id/review` | Faculty / Admin | **Human-in-the-Loop Review**: Approves (`APPROVED`), edits, or rejects question |
| `GET` | `/questions/topics` | Authenticated | Lists all academic topics and subjects |

### 4. Quizzes & Assessment Engine (`/api/quizzes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/quizzes` | Authenticated | Lists quizzes filtered by user section or subject |
| `GET` | `/quizzes/:id` | Authenticated | Retrieves full quiz details and randomized questions |
| `POST` | `/quizzes` | Faculty / Admin | Creates a new scheduled quiz |
| `POST` | `/quizzes/:id/attempt` | Student | Submits responses, scores attempt, logs telemetry, and triggers Knowledge Tracing update |
| `GET` | `/quizzes/:id/results` | Authenticated | Retrieves attempt rankings and score breakdown |

### 5. AI Chatbots (`/api/chatbot`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/chatbot` | Authenticated | Academic AI Tutor chat proxy (Gemini 1.5 Flash with Socratic pedagogical prompt) |

---

## 📂 Project Directory Structure

```plaintext
Acadexa/
├── package.json                   # Frontend dependencies, Vite scripts, Oxlint
├── vite.config.ts                 # Vite build configuration & React plugin
├── tailwind.config.js             # Tailwind CSS design system tokens
├── tsconfig.json                  # Root TypeScript configuration
├── .env                           # Frontend environment variables
├── .env.example                   # Frontend environment template
│
├── src/                           # Frontend React Application
│   ├── main.tsx                   # React root mount
│   ├── App.tsx                    # Root routing & AuthProvider wrapper
│   ├── index.css                  # Design tokens, CSS custom properties, fonts
│   │
│   ├── components/                # Reusable UI Component Library
│   │   ├── chatbot/               # ChatWindow, message bubbles, suggested prompt chips
│   │   ├── dashboard/             # StatCard, KPI widgets, metric counters
│   │   ├── faculty/               # ClassCard, QuestionReviewModal, AI Generation modal
│   │   ├── layout/                # DashboardLayout, Sidebar, Navbar, PageHeader
│   │   ├── leaderboard/           # LeaderboardTable, podium ranks
│   │   └── ui/                    # Button, Badge, Card, Modal, ProgressBar, Tabs
│   │
│   ├── context/                   # Global State Providers
│   │   └── AuthContext.tsx        # Authentication, JWT handling, role guard
│   │
│   ├── data/                      # Structured Mock Data & Fallbacks
│   │   ├── analytics.ts           # Baseline figures & learning gaps
│   │   ├── collegeInfo.ts         # Department directory & events
│   │   ├── courses.ts             # Course syllabus & topics
│   │   ├── quizzes.ts             # Sample quizzes & interactive questions
│   │   └── students.ts            # Student cohort data
│   │
│   ├── lib/                       # Third-Party Clients
│   │   ├── apiClient.ts           # Axios instance with JWT interceptor
│   │   └── supabase.ts            # Supabase JavaScript client
│   │
│   ├── pages/                     # Application Page Views
│   │   ├── auth/
│   │   │   └── Login.tsx          # Dual-role authentication screen
│   │   ├── student/
│   │   │   ├── Dashboard.tsx      # Main Student Dashboard (Weekly Quiz, Radar, Gaps)
│   │   │   ├── StudentDashboard.tsx # Re-exports Dashboard
│   │   │   ├── Quiz.tsx           # Weekly Quiz overview & schedule
│   │   │   ├── QuizScreen.tsx     # Interactive proctored assessment engine
│   │   │   ├── QuizResult.tsx     # Score breakdown & victory screen
│   │   │   ├── LearningGaps.tsx   # Detailed Knowledge Tracing & gap analysis
│   │   │   ├── QuestionBank.tsx   # Student self-paced practice archive
│   │   │   ├── AcademicChatbot.tsx# AI Study Tutor conversational interface
│   │   │   ├── DepartmentInfo.tsx # Department announcements & directory
│   │   │   ├── Leaderboard.tsx    # Class rank standings
│   │   │   ├── Courses.tsx        # Enrolled course syllabus
│   │   │   └── StudentProfile.tsx # Student settings & academic details
│   │   └── faculty/
│   │       ├── FacultyDashboard.tsx # Faculty portal & class switcher
│   │       ├── QuestionBank.tsx   # Human-in-the-Loop AIG review & question approval
│   │       ├── QuizManagement.tsx # Quiz scheduler & remedial assignment
│   │       ├── QuizBuilder.tsx    # 3-Step assessment creation wizard
│   │       ├── ClassAnalytics.tsx # Section performance distributions
│   │       └── QuestionPaperBank.tsx # Exam paper archive & PDF generator
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx          # PrivateRoute guards & role redirection
│   ├── services/                  # Frontend API Service Layer
│   │   ├── analyticsService.ts    # Knowledge Tracing & gap analysis caller
│   │   ├── authService.ts         # Login/logout & session persistence
│   │   ├── chatService.ts         # AI Tutor & Department chat client
│   │   ├── quizService.ts         # Quiz fetching & attempt submission
│   │   └── studentService.ts      # Profile and academic records
│   └── types/                     # TypeScript Interfaces
│       ├── analytics.ts           # KnowledgeTracingProfile, TopicMastery, CognitiveMastery
│       ├── quiz.ts                # Quiz, Question, AttemptAnswer, CognitiveLevel
│       └── student.ts             # Student, Faculty, Department
│
└── server/                        # Express Backend Application
    ├── package.json               # Backend dependencies & scripts
    ├── tsconfig.json              # Server TypeScript configuration
    ├── .env                       # Backend environment variables
    ├── .env.example               # Backend environment template
    │
    ├── prisma/                    # Relational Database Layer
    │   ├── schema.prisma          # PostgreSQL models, enums & relations
    │   ├── migrations/            # Migration change log
    │   └── seed.ts                # Database seeder (topics, questions, attempts)
    │
    └── src/                       # Backend Source Code
        ├── index.ts               # Express initialization & route mounting
        ├── config.ts              # Environment variable parser
        ├── prisma.ts              # PrismaClient database connection
        ├── middleware/
        │   ├── auth.ts            # JWT authentication & requireRole guard
        │   └── error.ts           # Centralized exception handler
        ├── routes/
        │   ├── auth.ts            # Authentication routes
        │   ├── analytics.ts       # Knowledge Tracing & practice routes
        │   ├── chatbot.ts         # Gemini AI Tutor proxy
        │   ├── questions.ts       # AIG generation & review routes
        │   ├── quizzes.ts         # Quiz creation & attempt submission
        │   └── users.ts           # User management
        └── services/
            ├── analytics.ts       # Knowledge Tracing calculation engine
            ├── analyticsService.ts# Service exports
            ├── authService.ts     # User authentication & bcrypt verification
            └── quizService.ts     # Quiz scoring & attempt recorder
```

---

## 🚀 Getting Started

Follow these instructions to run Acadexa on your local development machine.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (bundled with Node.js) or **yarn** / **pnpm**
- **PostgreSQL**: Local PostgreSQL instance OR a free cloud project on [Supabase](https://supabase.com/).

---

### 1. Clone Repository

```bash
git clone https://github.com/chaman284/Acadexa.git
cd Acadexa
```

---

### 2. Backend Setup & Supabase Connection

Navigate to the `server/` directory and install dependencies:

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
# IMPORTANT: If your database password contains special characters (like '@'),
# percent-encode them in the URL (e.g., 'Ary@nrehan420' becomes 'Ary%40nrehan420').
DATABASE_URL="postgresql://postgres:Ary%40nrehan420@db.jehajjidqrtgyzwpcngn.supabase.co:5432/postgres?schema=public"

# Auth Tokens
JWT_SECRET="acadexa_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"

# Optional: Google AI Studio Key for live Gemini 1.5 Flash responses
GEMINI_API_KEY=""

# Supabase Server Configuration
SUPABASE_URL="https://jehajjidqrtgyzwpcngn.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_TniBtGA1gWCSiEU7Wds1zQ_bGSsy5Dy"
SUPABASE_SECRET_KEY="your_supabase_secret_key"
SUPABASE_JWKS_URL="https://jehajjidqrtgyzwpcngn.supabase.co/auth/v1/.well-known/jwks.json"
```

---

### 3. Database Migration & Seed

Sync the Prisma schema to your PostgreSQL database and run the seeder:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema directly to database
npx prisma db push

# Seed Topics, Bloom's Questions, Quizzes, and Sample Student Attempts
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

The Express server will launch at **`http://localhost:3001`** (API Base: `http://localhost:3001/api`).

---

### 4. Frontend Setup

In a new terminal window, navigate to the project root:

```bash
cd Acadexa
npm install
```

#### Configure Root `.env`
Ensure `.env` in the root directory contains:

```env
# Supabase Frontend Configuration
VITE_SUPABASE_URL="https://jehajjidqrtgyzwpcngn.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_TniBtGA1gWCSiEU7Wds1zQ_bGSsy5Dy"

# Database Reference
DATABASE_URL="postgresql://postgres:Ary%40nrehan420@db.jehajjidqrtgyzwpcngn.supabase.co:5432/postgres?schema=public"
```

#### Start Frontend Development Server
```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 🔑 Default Demo Credentials

Pre-seeded accounts ready for immediate evaluation:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `chaman@cs.college.edu` | `student123` | CS 5th Semester, Sec A. Pre-populated with Knowledge Tracing data (Arrays: 92%, Trees: 45%). |
| **Student** | `rehan@cs.college.edu` | `rehan123` | Rehan Patel (CS 5th Semester, Sec A). |
| **Faculty** | `faculty@cs.college.edu` | `faculty123` | Dr. Ramesh Kumar (CS Dept). Access to AIG Question Bank, Review Modal, and Analytics. |
| **Faculty** | `soumya@cs.college.edu` | `soumya123` | Soumya (CS Dept Faculty). |

*(1-click **"Student Demo"** and **"Faculty Demo"** login buttons are also available on the Login screen).*

---

## ⚙️ Environment Variables Guide

### Frontend (`.env`)
| Variable | Type | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | String | Supabase Project URL for client initialization |
| `VITE_SUPABASE_ANON_KEY` | String | Supabase Anonymous / Publishable client key |

### Backend (`server/.env`)
| Variable | Type | Description |
|---|---|---|
| `PORT` | Number | Express API server port (default: `3001`) |
| `DATABASE_URL` | String | PostgreSQL connection URI (percent-encode special characters in password) |
| `JWT_SECRET` | String | Secret key for signing JSON Web Tokens |
| `JWT_EXPIRES_IN` | String | Token expiry period (e.g., `7d`) |
| `CORS_ORIGIN` | String | Whitelisted frontend origin (`http://localhost:5173`) |
| `GEMINI_API_KEY` | String | Google AI Studio API key for Gemini 1.5 Flash AIG and Tutor |
| `SUPABASE_URL` | String | Supabase Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | String | Supabase Publishable API Key |
| `SUPABASE_SECRET_KEY` | String | Supabase Service Role / Secret Key (server-side only) |
| `SUPABASE_JWKS_URL` | String | Supabase Auth JWKS endpoint for token validation |

---

## 📜 Available Scripts

### Frontend (Root)
- `npm run dev` — Starts the Vite development server with Hot Module Replacement (HMR).
- `npm run build` — Type-checks using `tsc -b` and builds the production bundle with Vite.
- `npm run preview` — Previews the generated production build locally.
- `npm run lint` — Performs high-speed linting using Oxlint.

### Backend (`server/`)
- `npm run dev` — Starts the Express API server with automatic TypeScript reloading via `ts-node-dev`.
- `npm run build` — Compiles TypeScript into the `dist/` directory.
- `npm run start` — Runs the compiled production server (`dist/index.js`).
- `npm run prisma:generate` — Generates updated Prisma Client types.
- `npm run seed` — Runs the database seeder script to populate initial curriculum, questions, and attempts.

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
  <b>Acadexa</b> — Empowering Students and Faculty with Academic Intelligence.<br>
  Built with ❤️ for excellence in collegiate learning.
</p>
