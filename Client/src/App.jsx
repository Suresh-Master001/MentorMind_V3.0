import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrgSetup from "./pages/OrgSetup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import MyTasks from "./pages/MyTasks";
import Teams from "./pages/Teams";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import OrganizationRegister from "./pages/OrganizationRegister";
import MyReport from "./pages/MyReport";
import AdminPanel from "./pages/AdminPanel";
import AdminRegister from "./pages/AdminRegister";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// Route wrapper for admin/Team Lead only pages
const AdminManagerRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdminOrTeamLead } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminOrTeamLead()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * If authenticated → show the landing / marketing page.
 * If NOT authenticated → show the landing / marketing page.
 * This is the public home route for non-logged-in users.
 * Authenticated users who somehow land here will NOT be redirected.
 * Instead, the Navbar/Layout handles showing the correct UI.
 */
const PublicHomeRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already logged in, redirect to dashboard immediately
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes — only shown when NOT logged in */}
        <Route path="/" element={<PublicHomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/org/setup" element={<OrgSetup />} />

        {/* Dashboard — all authenticated users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* My Tasks — all authenticated users */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <MyTasks />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Profile — all authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Organization Register — all authenticated users */}
        <Route
          path="/organization/register"
          element={
            <ProtectedRoute>
              <OrganizationRegister />
            </ProtectedRoute>
          }
        />

        {/* Admin/Manager only pages */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin", "Team Lead"]}>
                <Layout><Projects /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin", "Team Lead"]}>
                <Layout><ProjectDetail /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin", "Team Lead"]}>
                <Layout><Teams /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin", "Team Lead"]}>
                <Layout><Reports /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <Layout><AdminPanel /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-report"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["member"]}>
                <Layout><MyReport /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Redirect to login for any unknown route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;