import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  Outlet,
  useParams,
} from "react-router-dom";
import NotFound from "../pages/NotFoundPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Layout from "../components/layout/Layout";
import AboutPage from "../pages/AboutPage";
import CoursePage from "../pages/CoursePage";
import OverviewPage from "../pages/StudentPages/OverviewPage";
import StudentLayout from "../components/layout/students/StudentLayout";
import StudentCoursePage from "../pages/StudentPages/StudentCoursePage";
import CourseDetailPage from "../pages/StudentPages/CourseDetailPage";
import ForgetPasswordPage from "../pages/ForgetPasswordPage";
import LearningCoursePage from "../pages/StudentPages/LearningCoursePage";
import StudentInformationPage from "../pages/StudentPages/StudentInformationPage";
import DashboardPage from "../pages/AdminPages/DashboardPage";
import DoingExercisePage from "../pages/StudentPages/DoingExercisePage";
import ManageAccountPage from "../pages/AdminPages/ManageAccountPage";
import BlockedUsersPage from "../pages/AdminPages/BlockedUsersPage";
import { UserProvider } from "../contexts/UserContext";
import ManageLessonPage from "../pages/AdminPages/ManageLessonPage";
import LearningLayout from "../components/layout/students/LearningLayout";
import { LessonProvider } from "../contexts/LessonContext";
import GradePage from "../pages/StudentPages/GradePage";
import NotesPage from "../pages/StudentPages/NotesPage";
import PracticePage from "../pages/StudentPages/PracticePage";
import NoteIdentification from "../pages/StudentPages/PracticeExercises/NoteIdentification";
import KeySignatureIdentification from "../pages/StudentPages/PracticeExercises/KeySignatureIdentification";
import PracticeProviders from "../contexts/PracticeProviders";
import KeyboardIdentification from "../pages/StudentPages/PracticeExercises/KeyboardIdentification";
import KeyboardNoteIdentification from "../pages/StudentPages/PracticeExercises/KeyboardNoteIdentification";
import NoteListeningIdentification from "../pages/StudentPages/PracticeExercises/NoteListeningIdentification";
import PitchIdentification from "../pages/StudentPages/PracticeExercises/PitchIdentification";
import { NoteIdentificationProvider } from "../contexts/NoteIdentificationContext";
import DiscussionPage from "../pages/StudentPages/DiscussionPage";
import AIMelodyGeneratorPage from "../pages/StudentPages/AIMelodyGeneratorPage";
import AIChordGeneratorPage from "../pages/StudentPages/AIChordGeneratorPage";
import AIRhythmGeneratorPage from "../pages/StudentPages/AIRhythmGeneratorPage";
import AIQuizGeneratorPage from "../pages/StudentPages/AIQuizGeneratorPage";
import AIConfigPage from "../components/admin/AIConfigPage";
import TestS3Connection from "../pages/TestS3Connection";
// Import Teacher components
import TeacherLayout from "../components/layout/teachers/TeacherLayout";
import TeacherOverviewPage from "../pages/TeacherPages/TeacherOverviewPage";
import ManageCoursesPage from "../pages/TeacherPages/ManageCoursesPage";
import ManageModulesPage from "../pages/TeacherPages/ManageModulesPage";
import CreateModulePage from "../pages/TeacherPages/CreateModulePage";
import EditModulePage from "../pages/TeacherPages/EditModulePage";
import CreateLessonPage from "../pages/TeacherPages/CreateLessonPage";
import EditLessonPage from "../pages/TeacherPages/EditLessonPage";
import EditCoursePage from "../pages/TeacherPages/EditCoursePage";
import ManageStudentsPage from "../pages/TeacherPages/ManageStudentsPage";
import TeacherNotificationsPage from "../pages/TeacherPages/TeacherNotificationsPage";
import TeacherProfilePage from "../pages/TeacherPages/TeacherProfilePage";
import LessonDetailPage from "../pages/TeacherPages/LessonDetailPage";
import ModuleDetailPage from "../pages/TeacherPages/ModuleDetailPage";
import AssignmentReviewPage from "../pages/TeacherPages/AssignmentReviewPage";
import SectionManagementPage from "../pages/TeacherPages/SectionManagementPage";
import SearchExamplePage from "../components/examples/SearchExamplePage";
import CourseLayout from "../components/layout/students/CourseLayout";
import ExerciseOverviewPage from "../pages/StudentPages/ExerciseOverviewPage";
import QuizOverviewPage from "../pages/StudentPages/QuizOverviewPage";
import AssignmentOverviewPage from "../pages/StudentPages/AssignmentOverviewPage";
import DoingQuizPage from "../pages/StudentPages/DoingQuizPage";
import DoingAssignmentPage from "../pages/StudentPages/DoingAssignmentPage";
import LessonContentDisplay from "../pages/StudentPages/LessonContentDisplay";
import CreateQuizPage from "../pages/TeacherPages/CreateQuizPage";
import CreateExercisePage from "../pages/TeacherPages/CreateExercisePage";
import CreateAssignmentPage from "../pages/TeacherPages/CreateAssignmentPage";
import ExerciseDetailPage from "../pages/TeacherPages/ExerciseDetailPage";
import EditExercisePage from "../pages/TeacherPages/EditExercisePage";
import ExerciseQuestionPage from "../pages/TeacherPages/ExerciseQuestionPage";
import QuizDetailPage from "../pages/TeacherPages/QuizDetailPage";
import QuizQuestionPage from "../pages/TeacherPages/QuizQuestionPage";
import ManagePracticePage from "../pages/TeacherPages/ManagePracticePage";
import AssignmentDetailPage from "../pages/TeacherPages/AssignmentDetailPage";
import EditQuizPage from "../pages/TeacherPages/EditQuizPage";
import EditAssignmentPage from "../pages/TeacherPages/EditAssignmentPage";
import CreateCoursePage from "../pages/TeacherPages/CreateCoursePage";
import AdminLoginPage from "../pages/AdminPages/AdminLoginPage";
import CourseRatingPage from "../pages/StudentPages/CourseRatingPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AuthResetPasswordRedirect from "../pages/AuthResetPasswordRedirect";
// Import các protected routes
import {
  PublicOnlyRoute,
  PrivateRoute,
  AdminOnlyRoute,
  StudentOnlyRoute,
} from "../components/auth/ProtectedRoutes";
import SystemMonitoringPage from "../pages/AdminPages/SystemMonitoringPage";
import SystemSettingsPage from "../pages/AdminPages/SystemSettingsPage";

// Các component route
const PracticeRoutes = () => {
  return (
    <PracticeProviders>
      <Outlet />
    </PracticeProviders>
  );
};

// Specific route for NoteIdentification with its own provider
const NoteIdentificationRoute = () => {
  return (
    <NoteIdentificationProvider>
      <NoteIdentification />
    </NoteIdentificationProvider>
  );
};

// Layout cho các trang chỉ dành cho người chưa đăng nhập
const PublicOnly = () => {
  return (
    <PublicOnlyRoute>
      <Layout>
        <Outlet />
      </Layout>
    </PublicOnlyRoute>
  );
};

// Component để chuyển hướng từ route cũ sang route mới
const RedirectToLearningLesson = () => {
  const { courseId, moduleId, lessonId } = useParams();
  return (
    <Navigate
      to={`/learning/course/${courseId}/module/${moduleId}/lesson/${lessonId}`}
      replace
    />
  );
};

// Layout cho các trang yêu cầu đăng nhập
const Protected = () => {
  return (
    <PrivateRoute>
      <Outlet />
    </PrivateRoute>
  );
};

// Layout cho các trang chỉ dành cho admin
const AdminProtected = () => {
  return (
    <AdminOnlyRoute>
      <Outlet />
    </AdminOnlyRoute>
  );
};

// Layout cho các trang chỉ dành cho Student
const StudentProtected = () => {
  return (
    <StudentOnlyRoute>
      <Outlet />
    </StudentOnlyRoute>
  );
};

const router = createBrowserRouter([
  // Route mặc định - chuyển hướng đến overview
  {
    path: "/",
    element: <Navigate to="/overview" replace />,
  },

  // Trang Overview là trang công khai (public)
  {
    path: "/overview",
    element: (
      <Layout>
        <OverviewPage />
      </Layout>
    ),
  },

  // Nhóm các trang chỉ dành cho người chưa đăng nhập
  {
    element: <PublicOnly />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/admin/login",
        element: <AdminLoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forget-password",
        element: <ForgetPasswordPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "/auth-reset-password-redirect",
        element: <AuthResetPasswordRedirect />,
      },
    ],
  },

  // Trang public có thể truy cập bởi tất cả người dùng
  {
    path: "/about",
    element: (
      <Layout>
        <AboutPage />
      </Layout>
    ),
  },
  {
    path: "/course",
    element: (
      <Layout>
        <CoursePage />
      </Layout>
    ),
  },

  // Nhóm các trang yêu cầu đăng nhập
  {
    element: <StudentProtected />,
    children: [
      // Student routes
      {
        path: "/student",
        element: <StudentLayout />,
        children: [
          {
            path: "",
            element: <Navigate to="/student/overview" replace />,
          },
          {
            path: "overview",
            element: <OverviewPage />,
          },
          {
            path: "course",
            element: <CourseLayout />,
            children: [
              {
                path: ":number",
                element: <CourseDetailPage />,
              },
              {
                path: ":courseId/module/:moduleId",
                element: <StudentCoursePage />,
              },
              {
                path: ":courseId/grades",
                element: <GradePage />,
              },
              {
                path: ":courseId/notes",
                element: <NotesPage />,
              },
              {
                path: ":courseId/discussion",
                element: <DiscussionPage />,
              },
              {
                path: ":courseId/info",
                element: <CourseDetailPage />,
              },
              {
                path: ":courseId/rating",
                element: <CourseRatingPage />,
              },
              {
                path: ":courseId/exercise/:exerciseId",
                element: <ExerciseOverviewPage />,
              },
              {
                path: ":courseId/module/:moduleId/exercise/:exerciseId",
                element: <ExerciseOverviewPage />,
              },
              {
                path: ":courseId/module/:moduleId/quiz/:quizId",
                element: <QuizOverviewPage />,
              },
              {
                path: ":courseId/assignment/:assignmentId",
                element: <AssignmentOverviewPage />,
              },
              {
                path: ":courseId/module/:moduleId/assignment/:assignmentId",
                element: <AssignmentOverviewPage />,
              },
              // {
              //   path: ':courseId/module/:moduleId/exercise/:exerciseId/do',
              //   element: <DoingExercisePage />,
              // },
              // {
              //   path: ':courseId/module/:moduleId/assignment/:assignmentId/do',
              //   element: <ExercisePage />,
              // },
              {
                path: ":courseId/module/:moduleId/lesson/:lessonId",
                element: <RedirectToLearningLesson />,
              },
            ],
          },
          {
            path: "information",
            element: <StudentInformationPage />,
          },
          // {
          //   path: 'test',
          //   element: <TestPage />,
          // },
          // {
          //   path: 'exercise/:courseId/module/:moduleId/section/:sectionId', // Cập nhật route cho DoingExercisePage
          //   element: <DoingExercisePage />,
          // },
          {
            path: "practice",
            element: <PracticeRoutes />,
            children: [
              {
                path: "",
                element: <PracticePage />,
              },
              {
                path: "note-identification",
                element: <NoteIdentificationRoute />,
              },
              {
                path: "key-signature-identification",
                element: <KeySignatureIdentification />,
              },
              {
                path: "keyboard-identification",
                element: <KeyboardIdentification />,
              },
              {
                path: "keyboard-note-identification",
                element: <KeyboardNoteIdentification />,
              },
              {
                path: "note-listening-identification",
                element: <NoteListeningIdentification />,
              },
              {
                path: "pitch-identification",
                element: <PitchIdentification />,
              },
              {
                path: "ai-melody-generator",
                element: <AIMelodyGeneratorPage />,
              },
              {
                path: "ai-chord-generator",
                element: <AIChordGeneratorPage />,
              },
              {
                path: "ai-rhythm-generator",
                element: <AIRhythmGeneratorPage />,
              },
              {
                path: "ai-quiz-generator",
                element: <AIQuizGeneratorPage />,
              },
            ],
          },
        ],
      },

      // Learning routes
      {
        path: "/learning",
        element: <LearningLayout />,
        children: [
          {
            path: "course/:courseId/module/:moduleId/section/:sectionId",
            element: <LearningCoursePage />,
          },
          {
            path: "course/:courseId/module/:moduleId/lesson/:lessonId",
            element: <LessonContentDisplay />,
          },
        ],
      },
    ],
  },
  {
    element: <Protected />,
    children: [
      // Trang làm quiz độc lập - không sử dụng bất kỳ layout nào
      {
        path: "/student/quiz/:quizId",
        element: <DoingQuizPage />,
      },
      {
        path: "/student/assignment/:assignmentId",
        element: <DoingAssignmentPage />,
      },
      {
        path: "/student/exercise/:exerciseId",
        element: <DoingExercisePage />,
      },
      // Teacher routes - protected with AdminTeacherRoute
      {
        path: "/teacher",
        element: <TeacherLayout />,
        children: [
          {
            path: "",
            element: <Navigate to="/teacher/overview" replace />,
          },
          {
            path: "overview",
            element: <TeacherOverviewPage />,
          },
          {
            path: "courses",
            element: <ManageCoursesPage />,
          },
          {
            path: "courses/create",
            element: <CreateCoursePage />,
          },
          {
            path: "course/:courseId",
            element: <ManageModulesPage />,
          },
          {
            path: "edit-course/:courseId",
            element: <EditCoursePage />,
          },
          {
            path: "course/:courseId/modules/create",
            element: <CreateModulePage />,
          },
          {
            path: "course/:courseId/module/:moduleId",
            element: <ModuleDetailPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/edit",
            element: <EditModulePage />,
          },
          {
            path: "course/:courseId/module/:moduleId/lessons/create",
            element: <CreateLessonPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/manage-sections",
            element: <SectionManagementPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/lessons/:lessonId/edit",
            element: <EditLessonPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/lessons/:lessonId",
            element: <LessonDetailPage />,
          },
          {
            path: "students",
            element: <ManageStudentsPage />,
          },
          {
            path: "practice",
            element: <ManagePracticePage />,
          },
          {
            path: "notifications",
            element: <TeacherNotificationsPage />,
          },
          {
            path: "profile",
            element: <TeacherProfilePage />,
          },
          {
            path: "assignments",
            element: <AssignmentReviewPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/quizzes/create",
            element: <CreateQuizPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/quizzes/:quizId",
            element: <QuizDetailPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/quizzes/:quizId/edit",
            element: <EditQuizPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/quizzes/:quizId/question-management",
            element: <QuizQuestionPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/exercises/create",
            element: <CreateExercisePage />,
          },
          {
            path: "course/:courseId/module/:moduleId/assignments/create",
            element: <CreateAssignmentPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/assignments/:assignmentId",
            element: <AssignmentDetailPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/assignments/:assignmentId/edit",
            element: <EditAssignmentPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/exercises/:exerciseId",
            element: <ExerciseDetailPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/exercises/:exerciseId/edit",
            element: <EditExercisePage />,
          },
          {
            path: "course/:courseId/module/:moduleId/exercises/:exerciseId/questions",
            element: <ExerciseQuestionPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/exercises/:exerciseId/questions/create",
            element: <ExerciseQuestionPage />,
          },
          {
            path: "course/:courseId/module/:moduleId/exercises/:exerciseId/questions/:questionId/edit",
            element: <ExerciseQuestionPage />,
          },
        ],
      },
    ],
  },
  // Admin routes - protected with AdminOnlyRoute
  {
    element: <AdminProtected />,
    children: [
      {
        path: "/admin",
        element: (
          <UserProvider>
            <LessonProvider>
              <Outlet />
            </LessonProvider>
          </UserProvider>
        ),
        children: [
          {
            path: "",
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "account",
            element: <ManageAccountPage />,
          },
          {
            path: "blocked-users",
            element: <BlockedUsersPage />,
          },
          {
            path: "lessons",
            element: <ManageLessonPage />,
          },
          {
            path: "lessons/create",
            element: <CreateLessonPage />,
          },
          {
            path: "lessons/:lessonId",
            element: <LessonDetailPage />,
          },
          {
            path: "ai-config",
            element: <AIConfigPage />,
          },
          {
            path: "system-monitoring",
            element: <SystemMonitoringPage />,
          },
          {
            path: "settings",
            element: <SystemSettingsPage />,
          },
        ],
      },
    ],
  },

  // Test routes
  {
    path: "/test-s3",
    element: <TestS3Connection />,
  },

  // 404 route
  {
    path: "/search-example",
    element: <SearchExamplePage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
