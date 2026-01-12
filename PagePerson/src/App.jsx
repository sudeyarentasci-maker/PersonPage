import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./conponents/ProtectedRoute";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import HrDashboard from "./pages/HrDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route - Login */}
          <Route path="/" element={<LoginWrapper />} />

          {/* Protected Routes - Dashboards */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr"
            element={
              <ProtectedRoute allowedRoles={['HR']}>
                <HrDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

/**
 * LoginWrapper - Eğer kullanıcı zaten giriş yaptıysa dashboard'a yönlendir
 */
function LoginWrapper() {
  const { isAuthenticated, getDashboardPath, loading } = useAuth();

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (isAuthenticated) {
    const dashboardPath = getDashboardPath();
    return <Navigate to={dashboardPath} replace />;
  }

  return <Login />;
}

export default App;

