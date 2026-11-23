import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// AUTH
import Login from "./auth/Login";

// PUBLIC PAGES
import Home from "./pages/Home";
import About from "./pages/About";
import Academics from "./pages/Academics";
import Admissions from "./pages/Admissions";
import Notices from "./pages/Notices";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import StudentAI from "./pages/StudentAI";
import PublicTeachers from "./pages/Teachers";

// ADMIN PAGES
import AdminDashboard from "./admin/AdminDashboard";
import AdminAdmissions from "./admin/Admissions";
import CreateUser from "./admin/CreateUser";
import AdminGallery from "./admin/Gallery";
import AdminNotices from "./admin/Notices";
import AdminSettings from "./admin/Settings";
import Students from "./admin/Students";
import Teachers from "./admin/Teachers";
import AdminSubjects from "./admin/Subject";
import AdminAttendance from "./admin/Attendance";
import AdminResults from "./admin/Results";

// STUDENT PAGES
import StudentDashboard from "./student/StudentDashboard";
import StudentAttendance from "./student/Attendance";
import StudentProfile from "./student/Profile";
import StudentResults from "./student/Results";
import StudentSubjects from "./student/Subjects";
import StudentAIStudy from "./student/AIStudy";

// TEACHER PAGES
import TeacherDashboard from "./teacher/TeacherDashboard";
import TeacherAttendance from "./teacher/Attendance";
import TeacherProfile from "./teacher/Profile";
import TeacherResults from "./teacher/Results";
import TeacherStudents from "./teacher/Students";

// ==========================================
// AUTH DATA
// ==========================================

function getAuthData() {
  const token =
    localStorage.getItem("schoolToken") ||
    sessionStorage.getItem("schoolToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const userData =
    localStorage.getItem("schoolUser") ||
    sessionStorage.getItem("schoolUser") ||
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  let user = null;

  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error("User JSON error:", error);
    }
  }

  return { token, user };
}

// ==========================================
// ROLE PROTECTED ROUTES
// ==========================================

function AdminRoute({ children }) {
  const { token, user } = getAuthData();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (String(user.role || "").toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function StudentRoute({ children }) {
  const { token, user } = getAuthData();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (String(user.role || "").toLowerCase() !== "student") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function TeacherRoute({ children }) {
  const { token, user } = getAuthData();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (String(user.role || "").toLowerCase() !== "teacher") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ==========================================
// APP
// ==========================================

function App() {
  const location = useLocation();

  // Navbar/Footer should be hidden only on dashboard areas.
  // Public routes such as /teachers and /student-ai keep them visible.
  const isDashboardRoute =
    location.pathname.startsWith("/admin/") ||
    location.pathname === "/admin" ||
    location.pathname.startsWith("/student/") ||
    location.pathname === "/student" ||
    location.pathname.startsWith("/teacher/") ||
    location.pathname === "/teacher";

  return (
    <div className="min-h-screen bg-[#17120d]">
      {!isDashboardRoute && <Navbar />}

      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* PUBLIC WEBSITE */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/academics" element={<Academics />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/student-ai" element={<StudentAI />} />

        {/* PUBLIC TEACHERS DIRECTORY */}
        <Route path="/teachers" element={<PublicTeachers />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Navigate to="/admin/dashboard" replace />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={<AdminRoute><AdminDashboard /></AdminRoute>}
        />
        <Route
          path="/admin/admissions"
          element={<AdminRoute><AdminAdmissions /></AdminRoute>}
        />
        <Route
          path="/admin/create-user"
          element={<AdminRoute><CreateUser /></AdminRoute>}
        />
        <Route
          path="/admin/students"
          element={<AdminRoute><Students /></AdminRoute>}
        />
        <Route
          path="/admin/teachers"
          element={<AdminRoute><Teachers /></AdminRoute>}
        />
        <Route
          path="/admin/subjects"
          element={<AdminRoute><AdminSubjects /></AdminRoute>}
        />
        <Route
          path="/admin/attendance"
          element={<AdminRoute><AdminAttendance /></AdminRoute>}
        />
        <Route
          path="/admin/results"
          element={<AdminRoute><AdminResults /></AdminRoute>}
        />
        <Route
          path="/admin/gallery"
          element={<AdminRoute><AdminGallery /></AdminRoute>}
        />
        <Route
          path="/admin/notices"
          element={<AdminRoute><AdminNotices /></AdminRoute>}
        />
        <Route
          path="/admin/settings"
          element={<AdminRoute><AdminSettings /></AdminRoute>}
        />

        {/* STUDENT ROUTES */}
        <Route
          path="/student"
          element={
            <StudentRoute>
              <Navigate to="/student/dashboard" replace />
            </StudentRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={<StudentRoute><StudentDashboard /></StudentRoute>}
        />
        <Route
          path="/student/attendance"
          element={<StudentRoute><StudentAttendance /></StudentRoute>}
        />
        <Route
          path="/student/profile"
          element={<StudentRoute><StudentProfile /></StudentRoute>}
        />
        <Route
          path="/student/results"
          element={<StudentRoute><StudentResults /></StudentRoute>}
        />
        <Route
          path="/student/subjects"
          element={<StudentRoute><StudentSubjects /></StudentRoute>}
        />
        <Route
          path="/student/ai-study"
          element={<StudentRoute><StudentAIStudy /></StudentRoute>}
        />

        {/* TEACHER ROUTES */}
        <Route
          path="/teacher"
          element={
            <TeacherRoute>
              <Navigate to="/teacher/dashboard" replace />
            </TeacherRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={<TeacherRoute><TeacherDashboard /></TeacherRoute>}
        />
        <Route
          path="/teacher/attendance"
          element={<TeacherRoute><TeacherAttendance /></TeacherRoute>}
        />
        <Route
          path="/teacher/students"
          element={<TeacherRoute><TeacherStudents /></TeacherRoute>}
        />
        <Route
          path="/teacher/results"
          element={<TeacherRoute><TeacherResults /></TeacherRoute>}
        />
        <Route
          path="/teacher/profile"
          element={<TeacherRoute><TeacherProfile /></TeacherRoute>}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;
