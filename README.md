# 🎓 Acadexa

> **Assess. Identify. Improve.**  
> An intelligent, department-level academic intelligence, gamified assessment, and learning gap remediation platform built for higher education.

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Highlights](#-key-highlights)
- [System Architecture](#-system-architecture)
- [Feature Breakdown](#-feature-breakdown)
  - [Student Experience](#-student-experience)
  - [Faculty & Department Experience](#-faculty--department-experience)
  - [AI Academic Tutor](#-ai-academic-tutor)
- [Tech Stack](#-tech-stack)
- [Database Schema (Prisma)](#-database-schema-prisma)
- [API Reference](#-api-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#-environment-variables)
- [Default Demo Credentials](#-default-demo-credentials)
- [Available Scripts](#-available-scripts)
- [Design System & UI](#-design-system--ui)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Acadexa** bridges the critical gap between regular classroom instruction, student evaluation, and timely academic intervention. Traditional learning management systems (LMS) often record test grades without explaining *why* students struggled or *what* concepts need immediate review.

Acadexa transforms this workflow into an actionable cycle:
1. **Assess**: Scheduled weekly quizzes, topical diagnostic tests, and gamified practice assessments.
2. **Identify**: Fine-grained learning gap analytics pinpoint specific weak concepts across individual students, sections, and entire departments.
3. **Improve**: Remedial quizzes target specific weak topics, backed by an integrated AI Academic Tutor that provides pedagogical explanations.

---

## ⚡ Key Highlights

- **🎮 Kahoot-Style Interactive Quiz Engine**: Fullscreen proctored view with Web Audio API sound synthesis (custom chords & buzz effects), animated streak counters, scoring multipliers, countdown timers, and celebratory canvas confetti.
- **🎯 Learning Gap Diagnostic Matrix**: Automatically maps incorrect quiz answers back to specific topics (e.g., Arrays, Trees, Sorting) to generate individualized weakness reports.
- **👩‍🏫 Dual-Stage Faculty Portal**: Quick class switcher leading to dedicated class dashboards, cohort analytics, and targeted remedial quiz assignment.
- **🤖 Contextual AI Academic Tutor**: Powered by **Google Gemini 1.5 Flash**, offering conversational explanations, hints, and step-by-step problem breakdowns tailored to college coursework.
- **📊 Real-Time Interactive Analytics**: Class score distributions, pass rates, topic difficulty metrics, and participation trends visualised using **Recharts**.
- **🛡️ Robust Security & Role-Based Access Control**: Multi-role system (Student, Faculty, Admin) secured with JSON Web Tokens (JWT) and Bcrypt password hashing.
- **🚀 Offline / Demo Fallback Mode**: Frontend includes resilient mock fallbacks for seamless evaluation even before configuring the PostgreSQL database.

---

## 🏛 System Architecture

```mermaid
graph TD
    Client["Frontend (React 19 + TypeScript + Vite + Tailwind CSS)"]
    API["Express 5 REST API (TypeScript)"]
    Auth["JWT Middleware & Role Guard"]
    Prisma["Prisma ORM 5.22"]
    DB[(PostgreSQL Database)]
    Gemini["Google Gemini 1.5 Flash API"]

    Client -->|REST Requests + Bearer Token| API
    API --> Auth
    Auth -->|Database Queries| Prisma
    Prisma --> DB
    API -->|AI Tutor Inquiries| Gemini
```

---

## 🚀 Feature Breakdown

### 🎓 Student Experience

| Module | Description |
|---|---|
| **Dashboard** | Overview of enrolled courses, upcoming quizzes, completion rates, weekly performance charts, and learning streaks. |
| **Quiz Engine** | High-energy quiz screen featuring dynamic question cards, four-color Kahoot-style options, time countdowns, Web Audio synthesized sounds, and instant answer validation. |
| **Quiz Results & Review** | Detailed score cards, answer explanations, time-taken metrics, and accuracy percentages. |
| **Learning Gaps Tracker** | Topic-by-topic mastery breakdown showing weak, moderate, and mastered concepts with recommended remedial quizzes. |
| **Question Bank** | Searchable archive of practice questions categorized by subject, topic, and difficulty (Easy, Medium, Hard). |
| **Leaderboard** | Class and department-wide ranking board showing top performers, total points, and streaks to motivate healthy competition. |
| **Department Directory** | Access to departmental announcements, syllabus outlines, faculty contacts, and academic calendars. |

### 👩‍🏫 Faculty & Department Experience

| Module | Description |
|---|---|
| **Class Selector** | Unified landing page allowing faculty to switch between assigned semesters and sections (e.g., *CS 5th Sem - Section A*). |
| **Class Dashboard** | Real-time overview of active students, upcoming assessments, average class GPA/score, and submission activity. |
| **3-Step Quiz Builder** | 1. **Details**: Title, type (Weekly, Practice, Remedial), time duration, scheduled date.<br>2. **Questions**: Add custom questions or pick from question bank.<br>3. **Schedule**: Target specific departments, semesters, and sections. |
| **Learning Gap Analytics** | Aggregated view of question failure rates, highlighting difficult syllabus areas needing lecture re-teaching. |
| **Question Paper Bank** | Institutional repository for past semester exams, mid-term papers, and reference solutions with direct download links. |
| **Quiz Management** | Control quiz lifecycle: Draft, Active, and Completed, with one-click remedial quiz dispatch. |

### 🤖 AI Academic Tutor

- Built on Google's **Gemini 2.5 Flash** model.
- Maintains multi-turn conversation history.
- Contextualized system prompt as an academic mentor that guides students conceptually without simply giving away test answers.
- Graceful offline fallback providing informative guidance if `GEMINI_API_KEY` is not yet configured.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + CSS Custom Properties Design System
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Animations**: [Framer Motion 13](https://www.framer.com/motion/)
- **Data Visualization**: [Recharts 3](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio & FX**: Web Audio API Synthesizer + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **BaaS / Database Client**: [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction) (`@supabase/supabase-js`)
- **Code Linter**: [Oxlint](https://oxc.rs/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (executed with `ts-node-dev`)
- **ORM**: [Prisma 5.22](https://www.prisma.io/)
- **Database**: [PostgreSQL (Supabase Hosted / Local)](https://supabase.com/)
- **Server Utilities**: [@supabase/server](https://www.npmjs.com/package/@supabase/server)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **AI Integration**: [Google Gemini 1.5 Flash API](https://ai.google.dev/)
- **Cross-Origin**: [cors](https://expressjs.com/en/resources/middleware/cors.html)

---

## 🗄 Database Schema (Prisma)

The relational database is configured via [Prisma](file:///c:/Users/rehan/Desktop/Acadexa/server/prisma/schema.prisma):

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
    Topic ||--o{ Question : "contains"
    Question ||--o{ Option : "has"
    Quiz ||--o{ QuizQuestion : "includes"
    Quiz ||--o{ QuizAttempt : "receives"
    Student ||--o{ QuizAttempt : "submits"
    QuizAttempt ||--o{ AttemptAnswer : "records"
```

### Models Summary:
- **`User`**: Base identity (`email`, `passwordHash`, `name`, `role: STUDENT | FACULTY | ADMIN`, `avatarUrl`).
- **`Department` & `Section`**: Academic hierarchy (e.g., Computer Science, Semester 5, Section A).
- **`Subject` & `Topic`**: Curriculum hierarchy (e.g., Data Structures -> Arrays, Stacks, Binary Trees).
- **`Question` & `Option`**: Question bank items with types (`MCQ`, `MULTI_SELECT`, `TRUE_FALSE`) and difficulties (`EASY`, `MEDIUM`, `HARD`).
- **`Quiz` & `QuizQuestion`**: Assessments with types (`WEEKLY`, `REMEDIAL`, `PRACTICE`) and statuses (`DRAFT`, `ACTIVE`, `COMPLETED`).
- **`QuizAttempt` & `AttemptAnswer`**: Complete telemetry of student submissions, scores, time taken, and item-level responses.
- **`FacultySubject`**: Mapping linking faculty members to specific subjects and assigned sections.

---

## 📡 API Reference

Base URL: `http://localhost:3001/api`

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Authenticates user credentials and issues JWT token |
| `POST` | `/auth/register` | Public | Registers a new student or faculty account |
| `POST` | `/auth/logout` | Authenticated | Clears user session |
| `GET` | `/auth/me` | Authenticated | Fetches profile of the currently logged-in user |

### 📝 Quizzes (`/quizzes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/quizzes` | Authenticated | Retrieves quizzes filtered by section, subject, or status |
| `GET` | `/quizzes/:id` | Authenticated | Retrieves full quiz details and questions |
| `POST` | `/quizzes` | Faculty / Admin | Creates a new quiz |
| `POST` | `/quizzes/:id/attempt`| Student | Submits student quiz responses, scores the test, and logs attempt |
| `GET` | `/quizzes/:id/attempts`| Authenticated | Retrieves student attempt history for a specific quiz |

### ❓ Questions & Bank (`/questions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/questions` | Authenticated | Queries questions filtered by topic, difficulty, or subject |
| `POST` | `/questions` | Faculty / Admin | Adds a new question with options to the repository |
| `GET` | `/questions/topics` | Authenticated | Lists all academic topics across subjects |

### 📈 Analytics (`/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/analytics/student/overview` | Student | Retrieves personal performance statistics, streaks, and gaps |
| `GET` | `/analytics/faculty/overview` | Faculty / Admin | Aggregated faculty metrics across managed sections |
| `GET` | `/analytics/faculty/class/:sectionId` | Faculty / Admin | In-depth section analytics, score distributions, and topic weaknesses |

### 🤖 AI Tutor (`/chatbot`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/chatbot` | Authenticated | Sends student prompt and history to the Gemini 1.5 Flash tutor |

---

## 📂 Project Directory Structure

```plaintext
Acadexa/
├── package.json             # Root frontend dependencies & scripts
├── vite.config.ts           # Vite build & plugin configurations
├── tailwind.config.js       # Tailwind CSS theme tokens & styles
├── tsconfig.json            # Root TypeScript compiler options
├── .oxlintrc.json           # Fast Oxlint rules configuration
├── .env.example             # Frontend environment variables template
├── .agents/skills/          # Installed Supabase Agent Skills
│
├── src/                     # Frontend Application
│   ├── main.tsx             # Application entry point
│   ├── App.tsx              # Root app wrapper (Router & AuthProvider)
│   ├── index.css            # Global CSS variables, fonts, and base utilities
│   │
│   ├── components/          # Reusable UI & Layout Components
│   │   ├── chatbot/         # Floating AI Chatbot widget & chat window
│   │   ├── dashboard/       # Metric cards, progress bars, chart wrappers
│   │   ├── faculty/         # Faculty-specific widgets & class cards
│   │   ├── layout/          # DashboardLayout, Sidebar, Navbar
│   │   ├── leaderboard/     # Leaderboard tables & podium ranks
│   │   └── ui/              # Button, Input, Modal, Badge, Card primitives
│   │
│   ├── context/             # Global State
│   │   └── AuthContext.tsx  # Authentication provider & role guard state
│   │
│   ├── data/                # Mock Data & Static Curriculum Fallbacks
│   │   ├── analytics.ts     # Sample performance figures & gap data
│   │   ├── collegeInfo.ts   # Department directories & faculty details
│   │   ├── courses.ts       # Course catalog & syllabus outlines
│   │   ├── facultyClasses.ts# Assigned class groupings
│   │   ├── paperBank.ts     # Past exam papers repository
│   │   ├── quizzes.ts       # Sample quizzes & interactive questions
│   │   └── students.ts      # Student roster & cohort metadata
│   │
│   ├── lib/                 # Core Utilities
│   │   ├── apiClient.ts     # Axios instance configured with JWT interceptors
│   │   └── supabase.ts      # Supabase JavaScript client singleton
│   │
│   ├── utils/               # Helper Utilities
│   │   └── supabase/        # Supabase client helper
│   │
│   ├── pages/               # Application Route Views
│   │   ├── auth/            # Login.tsx
│   │   ├── student/         # StudentDashboard, Quiz, QuizScreen, QuizResult,
│   │   │                    # LearningGaps, QuestionBank, Leaderboard, AcademicChatbot
│   │   └── faculty/         # FacultyDashboard, ClassDashboard, ClassAnalytics,
│   │                        # QuizBuilder, QuizManagement, QuestionPaperBank
│   │
│   ├── routes/              # Routing Management
│   │   └── AppRoutes.tsx    # Role-based route definitions & route guards
│   ├── services/            # API Service Layer (with mock fallback handling)
│   └── types/               # TypeScript interfaces & types
│
└── server/                  # Backend Application
    ├── package.json         # Server dependencies & scripts
    ├── tsconfig.json        # Server TypeScript configuration
    ├── .env.example         # Backend environment variables template
    │
    ├── prisma/              # Database Schema & Migrations
    │   ├── schema.prisma    # PostgreSQL Prisma relational schema
    │   ├── migrations/      # Migration history
    │   └── seed.ts          # Database seeder with demo accounts & sample quizzes
    │
    └── src/                 # Server Source Code
        ├── index.ts         # Express server entry point & CORS configuration
        ├── config.ts        # Centralized environment variable parser
        ├── prisma.ts        # Shared PrismaClient singleton
        ├── middleware/      # JWT authentication & role-verification middleware
        ├── routes/          # Express route definitions (auth, quizzes, chatbot, etc.)
        └── services/        # Backend business logic & database queries
```

---

## 🚀 Getting Started

Follow these steps to set up and run Acadexa locally.

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** (comes with Node.js) or **pnpm** / **yarn**
- **PostgreSQL**: (Optional for local testing using the included mock fallbacks; required for full database persistence)

---

### 1. Clone Repository

```bash
git clone https://github.com/chaman284/Acadexa.git
cd Acadexa
```

---

### 2. Backend Setup

Open a terminal and navigate to the `server/` directory:

```bash
cd server
npm install
```

#### Configure Environment Variables
Create `server/.env` (copy from `server/.env.example`):
```env
PORT=3001
CORS_ORIGIN="http://localhost:5173"

# Supabase or Local PostgreSQL
# Note: If your password contains special characters like '@', percent-encode them (e.g., '@' -> '%40')
DATABASE_URL="postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=public"

JWT_SECRET="your_secure_jwt_secret_key"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY="your_optional_gemini_api_key_here"

# Supabase Server Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_SECRET_KEY="your-secret-key"
SUPABASE_JWKS_URL="https://your-project.supabase.co/auth/v1/.well-known/jwks.json"
```

#### Run Database Migrations & Seed Data
```bash
# Generate Prisma Client
npm run prisma:generate

# Sync schema directly to Supabase / PostgreSQL
npx prisma db push

# (Alternative) Run traditional Prisma migrations
# npm run prisma:migrate

# Seed Demo Users, Subjects, Questions, and Quizzes
npm run seed
```

#### Start Backend Server
```bash
npm run dev
```
The backend will be running at: `http://localhost:3001` (API Base: `http://localhost:3001/api`).

---

### 3. Frontend Setup

Open a second terminal in the project root:

```bash
# Return to root directory if you were inside server/
cd ..

# Install frontend dependencies
npm install
```

#### Configure Frontend Environment Variables
Create `.env.local` in the root directory (copy from `.env.example`):
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-or-publishable-key"
```

#### Start Frontend Server
```bash
# Start Vite development server
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**.

> **Note:** If the backend is not running, the frontend will automatically utilize its built-in offline mock data and credentials, allowing full exploration of the interface right away!

---

## 🔑 Default Demo Credentials

Pre-configured demo accounts ready for testing:

| Role | Email | Password | Description |
|---|---|---|---|
| **Student** | `chaman@cs.college.edu` | `student123` | Enrolled in CS 5th Semester, Section A. Full quiz taking, learning gap tracking, and AI tutoring. |
| **Faculty** | `faculty@cs.college.edu` | `faculty123` | Dr. Ramesh Kumar (CS Department). Class analytics, quiz builder, and remedial assignment. |

*(Quick 1-click **"Student Demo"** and **"Faculty Demo"** buttons are also available on the Login screen).*

---

## ⚙️ Environment Variables

### Frontend (`.env.local`)

| Variable | Type | Default | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | String | - | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | String | - | Supabase Publishable / Anon Client Key |

### Server (`server/.env`)

| Variable | Type | Default | Description |
|---|---|---|---|
| `PORT` | Number | `3001` | Express server port |
| `DATABASE_URL` | String | - | Supabase or local PostgreSQL connection URL |
| `JWT_SECRET` | String | `acadexa_super_secret...` | Key used for signing JWT authentication tokens |
| `JWT_EXPIRES_IN` | String | `7d` | Token validity period |
| `CORS_ORIGIN` | String | `http://localhost:5173` | Allowed frontend origin |
| `GEMINI_API_KEY` | String | `""` | Google AI Studio key for live Gemini 1.5 Flash tutor responses |
| `SUPABASE_URL` | String | - | Supabase Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | String | - | Supabase Publishable API Key |
| `SUPABASE_SECRET_KEY` | String | - | Supabase Secret Key (Server-side only) |
| `SUPABASE_JWKS_URL` | String | - | Supabase Auth JWKS verification URL |

---

## 📜 Available Scripts

### Frontend (Root)

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server with HMR |
| `npm run build` | Type-checks with `tsc` and creates production bundle |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs high-speed linting with Oxlint |

### Backend (`server/`)

| Command | Action |
|---|---|
| `npm run dev` | Runs Express server with live TypeScript reload via `ts-node-dev` |
| `npm run build` | Compiles TypeScript code to `dist/` |
| `npm run start` | Runs compiled production server (`dist/index.js`) |
| `npm run prisma:generate` | Generates Prisma Client types |
| `npm run prisma:migrate` | Runs database migrations |
| `npm run seed` | Seeds initial departments, users, and quizzes |

---

## 🎨 Design System & UI

Acadexa adopts a modern academic aesthetic designed for maximum focus, clarity, and engagement:

- **Color Palette**:
  - Primary Accent: `#3b82f6` / `#2563eb` (Academic Sapphire)
  - Success / Mastery: `#22c55e` (Emerald)
  - Warning / Gap: `#f59e0b` (Amber)
  - Critical Review: `#ef4444` (Coral Red)
  - Background: Crisp, light slate tokens with subtle glassmorphic card overlays.
- **Sound Design**: Built-in Web Audio API synthesizers creating bespoke polyphonic frequencies without external heavy audio assets.
- **Responsive Layout**: Fluid flex and grid layouts optimized across desktop monitors, laptops, and tablets.

---

## 🗺️ Future Roadmap

- [ ] **AI Question Generation**: Upload lecture PPTs or syllabus PDFs to automatically generate validated quiz questions.
- [ ] **Automated Remedial Triggers**: Auto-assign remedial quizzes whenever a student scores below 60% in a given topic.
- [ ] **Attendance & ERP Integration**: Bi-directional sync with university attendance and academic grade registers.
- [ ] **Mobile Application**: Cross-platform companion app for rapid push notifications and daily flashcard quizzes.
- [ ] **Multi-Tenant University Support**: Single platform multi-tenancy for multiple colleges and faculties.

---

## 🤝 Contributing

Contributions are welcomed! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m "Add amazing feature"`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **ISC License**. Feel free to use and adapt it for academic and institutional initiatives.

---

<p align="center">
  <b>Acadexa</b> — Empowering Students and Faculty with Academic Intelligence.<br>
  Developed with ❤️ for collegiate learning.
</p>
