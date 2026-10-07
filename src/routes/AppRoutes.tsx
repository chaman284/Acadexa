import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth
import { Login } from '../pages/auth/Login';

// Layout
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { Courses } from '../pages/student/Courses';
import { Quiz } from '../pages/student/Quiz';
import { QuizScreen } from '../pages/student/QuizScreen';
import { QuizResult } from '../pages/student/QuizResult';
import { QuestionBank } from '../pages/student/QuestionBank';
import { LearningGaps } from '../pages/student/LearningGaps';
import { Leaderboard } from '../pages/student/Leaderboard';
import { AcademicChatbot } from '../pages/student/AcademicChatbot';
import { DepartmentInfo } from '../pages/student/DepartmentInfo';

// Faculty Pages
import { FacultyDashboard } from '../pages/faculty/FacultyDashboard';
import { ClassAnalytics } from '../pages/faculty/ClassAnalytics';
import { QuestionBankManagement } from '../pages/faculty/QuestionBankManagement';
import { QuestionPaperBank } from '../pages/faculty/QuestionPaperBank';
import { QuizManagement } from '../pages/faculty/QuizManagement';
import { LearningGapAnalytics } from '../pages/faculty/LearningGapAnalytics';
import { ClassDashboard } from '../pages/faculty/ClassDashboard';
import { QuizBuilder } from '../pages/faculty/QuizBuilder';

// Guard wrapper — reads from AuthContext
const PrivateRoute = ({ children, role }: { children: React.ReactNode; role: 'student' | 'faculty' }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <DashboardLayout role={role} user={user}>{children}</DashboardLayout>;
};

// Standalone guard wrapper — full window without sidebar/dashboard layout (like login & class picker)
const StandaloneRoute = ({ children, role }: { children: React.ReactNode; role: 'student' | 'faculty' }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Student Routes */}
      <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
      <Route path="/student/courses" element={<PrivateRoute role="student"><Courses /></PrivateRoute>} />
      <Route path="/student/quiz" element={<PrivateRoute role="student"><Quiz /></PrivateRoute>} />
      <Route path="/student/quiz/:id" element={<StandaloneRoute role="student"><QuizScreen /></StandaloneRoute>} />
      <Route path="/student/quiz/:id/result" element={<StandaloneRoute role="student"><QuizResult /></StandaloneRoute>} />
      <Route path="/student/question-bank" element={<PrivateRoute role="student"><QuestionBank /></PrivateRoute>} />
      <Route path="/student/learning-gaps" element={<PrivateRoute role="student"><LearningGaps /></PrivateRoute>} />
      <Route path="/student/leaderboard" element={<PrivateRoute role="student"><Leaderboard /></PrivateRoute>} />
      <Route path="/student/tutor" element={<PrivateRoute role="student"><AcademicChatbot /></PrivateRoute>} />
      <Route path="/student/department" element={<PrivateRoute role="student"><DepartmentInfo /></PrivateRoute>} />

      {/* Faculty Routes */}
      {/* Stage 2: Standalone Full-Window Class Selector Page */}
      <Route path="/faculty" element={<StandaloneRoute role="faculty"><FacultyDashboard /></StandaloneRoute>} />
      {/* Stage 3: Actual Class Dashboard (with Sidebar and DashboardLayout) */}
      <Route path="/faculty/class/:classId" element={<PrivateRoute role="faculty"><ClassDashboard /></PrivateRoute>} />
      {/* Class-specific analytics — /faculty/class/:classId/analytics */}
      <Route path="/faculty/class/:classId/analytics" element={<PrivateRoute role="faculty"><ClassAnalytics /></PrivateRoute>} />
      <Route path="/faculty/quiz/create" element={<StandaloneRoute role="faculty"><QuizBuilder /></StandaloneRoute>} />
      {/* Legacy global analytics — kept for backward compat */}
      <Route path="/faculty/analytics" element={<PrivateRoute role="faculty"><ClassAnalytics /></PrivateRoute>} />
      <Route path="/faculty/students" element={<PrivateRoute role="faculty"><div>Students Management (Placeholder)</div></PrivateRoute>} />
      {/* Question Paper Bank — standalone, no sidebar */}
      <Route path="/faculty/paper-bank" element={<StandaloneRoute role="faculty"><QuestionPaperBank /></StandaloneRoute>} />
      {/* Keep old route as redirect */}
      <Route path="/faculty/question-bank" element={<Navigate to="/faculty/paper-bank" replace />} />
      {/* Quiz Management — standalone, no sidebar */}
      <Route path="/faculty/quizzes" element={<StandaloneRoute role="faculty"><QuizManagement /></StandaloneRoute>} />
      <Route path="/faculty/learning-gaps" element={<PrivateRoute role="faculty"><LearningGapAnalytics /></PrivateRoute>} />
      <Route path="/faculty/remedial-quizzes" element={<PrivateRoute role="faculty"><QuizManagement /></PrivateRoute>} />
      <Route path="/faculty/department" element={<PrivateRoute role="faculty"><DepartmentInfo /></PrivateRoute>} />

      {/* Common Pages (Placeholders) */}
      <Route path="/profile" element={<div>Profile Page (Placeholder)</div>} />
      <Route path="/settings" element={<div>Settings Page (Placeholder)</div>} />

      <Route path="*" element={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
          <button onClick={() => window.history.back()} className="text-blue-500 hover:underline">Go Back</button>
        </div>
      } />
    </Routes>
  );
};
