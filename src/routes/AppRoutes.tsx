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
import { StudentProfile } from '../pages/student/StudentProfile';
import { StudentSettingsPage } from '../pages/student/StudentSettings';

// Faculty Pages
import { FacultyDashboard } from '../pages/faculty/FacultyDashboard';
import { ClassAnalytics } from '../pages/faculty/ClassAnalytics';
import { QuestionBankManagement } from '../pages/faculty/QuestionBankManagement';
import { QuestionPaperBank } from '../pages/faculty/QuestionPaperBank';
import { QuizManagement } from '../pages/faculty/QuizManagement';
import { LearningGapAnalytics } from '../pages/faculty/LearningGapAnalytics';
import { ClassDashboard } from '../pages/faculty/ClassDashboard';
import { QuizBuilder } from '../pages/faculty/QuizBuilder';
import { FacultyProfile } from '../pages/faculty/FacultyProfile';
import { FacultySettings } from '../pages/faculty/FacultySettings';

// Admin Pages
import { AdminOverview } from '../pages/admin/AdminOverview';
import { FacultyManagement } from '../pages/admin/FacultyManagement';
import { CourseManagement } from '../pages/admin/CourseManagement';
import { StudentManagement } from '../pages/admin/StudentManagement';
import { SectionManagement } from '../pages/admin/SectionManagement';
import { AdminNotifications } from '../pages/admin/AdminNotifications';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { AdminSettings } from '../pages/admin/AdminSettings';

// Guard wrapper — reads from AuthContext
const PrivateRoute = ({ children, role }: { children: React.ReactNode; role: 'student' | 'faculty' | 'admin' }) => {
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

// Common Authenticated Route
const CommonAuthRoute = ({
  studentChild,
  facultyChild,
  adminChild,
}: {
  studentChild: React.ReactNode;
  facultyChild: React.ReactNode;
  adminChild: React.ReactNode;
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <DashboardLayout role={user.role} user={user}>
      {user.role === 'student' ? studentChild : user.role === 'admin' ? adminChild : facultyChild}
    </DashboardLayout>
  );
};

// Standalone guard wrapper — full window without sidebar/dashboard layout
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
      <Route path="/student/learning_gaps" element={<Navigate to="/student/learning-gaps" replace />} />
      <Route path="/student/leaderboard" element={<PrivateRoute role="student"><Leaderboard /></PrivateRoute>} />
      <Route path="/student/tutor" element={<PrivateRoute role="student"><AcademicChatbot /></PrivateRoute>} />
      <Route path="/student/department" element={<PrivateRoute role="student"><DepartmentInfo /></PrivateRoute>} />
      <Route path="/student/profile" element={<PrivateRoute role="student"><StudentProfile /></PrivateRoute>} />
      <Route path="/student/settings" element={<PrivateRoute role="student"><StudentSettingsPage /></PrivateRoute>} />

      {/* Faculty Routes */}
      <Route path="/faculty" element={<PrivateRoute role="faculty"><FacultyDashboard /></PrivateRoute>} />
      <Route path="/faculty/class/:classId" element={<PrivateRoute role="faculty"><ClassDashboard /></PrivateRoute>} />
      <Route path="/faculty/class/:classId/analytics" element={<PrivateRoute role="faculty"><ClassAnalytics /></PrivateRoute>} />
      <Route path="/faculty/quiz/create" element={<StandaloneRoute role="faculty"><QuizBuilder /></StandaloneRoute>} />
      <Route path="/faculty/analytics" element={<PrivateRoute role="faculty"><ClassAnalytics /></PrivateRoute>} />
      <Route path="/faculty/students" element={<PrivateRoute role="faculty"><div>Students Management (Placeholder)</div></PrivateRoute>} />
      <Route path="/faculty/paper-bank" element={<StandaloneRoute role="faculty"><QuestionPaperBank /></StandaloneRoute>} />
      <Route path="/faculty/question-bank" element={<Navigate to="/faculty/paper-bank" replace />} />
      <Route path="/faculty/quizzes" element={<StandaloneRoute role="faculty"><QuizManagement /></StandaloneRoute>} />
      <Route path="/faculty/learning-gaps" element={<PrivateRoute role="faculty"><LearningGapAnalytics /></PrivateRoute>} />
      <Route path="/faculty/remedial-quizzes" element={<PrivateRoute role="faculty"><QuizManagement /></PrivateRoute>} />
      <Route path="/faculty/department" element={<PrivateRoute role="faculty"><DepartmentInfo /></PrivateRoute>} />
      <Route path="/faculty/profile" element={<PrivateRoute role="faculty"><FacultyProfile /></PrivateRoute>} />
      <Route path="/faculty/settings" element={<PrivateRoute role="faculty"><FacultySettings /></PrivateRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute role="admin"><AdminOverview /></PrivateRoute>} />
      <Route path="/admin/faculty" element={<PrivateRoute role="admin"><FacultyManagement /></PrivateRoute>} />
      <Route path="/admin/courses" element={<PrivateRoute role="admin"><CourseManagement /></PrivateRoute>} />
      <Route path="/admin/students" element={<PrivateRoute role="admin"><StudentManagement /></PrivateRoute>} />
      <Route path="/admin/sections" element={<PrivateRoute role="admin"><SectionManagement /></PrivateRoute>} />
      <Route path="/admin/notifications" element={<PrivateRoute role="admin"><AdminNotifications /></PrivateRoute>} />
      <Route path="/admin/assignments" element={<Navigate to="/admin/faculty" replace />} />
      <Route path="/admin/profile" element={<PrivateRoute role="admin"><AdminProfile /></PrivateRoute>} />
      <Route path="/admin/settings" element={<PrivateRoute role="admin"><AdminSettings /></PrivateRoute>} />

      {/* Unified Profile & Settings Routes */}
      <Route
        path="/profile"
        element={<CommonAuthRoute studentChild={<StudentProfile />} facultyChild={<FacultyProfile />} adminChild={<AdminProfile />} />}
      />
      <Route
        path="/settings"
        element={<CommonAuthRoute studentChild={<StudentSettingsPage />} facultyChild={<FacultySettings />} adminChild={<AdminSettings />} />}
      />

      <Route path="*" element={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
          <button onClick={() => window.history.back()} className="text-blue-500 hover:underline">Go Back</button>
        </div>
      } />
    </Routes>
  );
};
