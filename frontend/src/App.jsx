import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import AngelCursor from "./components/AngelCursor.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import ContentAnalytics from "./pages/ContentAnalytics.jsx";
import AudienceAnalytics from "./pages/AudienceAnalytics.jsx";
import GrowthInsights from "./pages/GrowthInsights.jsx";
import RevenueAnalytics from "./pages/RevenueAnalytics.jsx";
import Reports from "./pages/Reports.jsx";
import ProStrategist from "./pages/ProStrategist.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";

function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <>
      <AngelCursor />
      <Routes>
        <Route path="/"         element={<GuestOnly><Landing /></GuestOnly>} />
        <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/dashboard"  element={<Protected><Dashboard /></Protected>} />
        <Route path="/profile"    element={<Protected><Profile /></Protected>} />
        <Route path="/settings"   element={<Protected><Settings /></Protected>} />
        <Route path="/content"    element={<Protected><ContentAnalytics /></Protected>} />
        <Route path="/audience"   element={<Protected><AudienceAnalytics /></Protected>} />
        <Route path="/growth"     element={<Protected><GrowthInsights /></Protected>} />
        <Route path="/revenue"    element={<Protected><RevenueAnalytics /></Protected>} />
        <Route path="/reports"    element={<Protected><Reports /></Protected>} />
        <Route path="/pro"        element={<Protected><ProStrategist /></Protected>} />
        <Route path="/admin/users" element={<Protected roles={["admin"]}><AdminUsers /></Protected>} />
        <Route path="/m/:page"    element={<Protected><ComingSoon /></Protected>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
