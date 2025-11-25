import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./ProtectedRoute.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import { useEffect } from "react";

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user role doesn't match expected routes
  useEffect(() => {
    if (!user) return;
    
    const roleRouteMap = {
      super_admin: "/superadmin",
      director_admin: "/director",
      hod: "/hod",
      mentor: "/mentor",
      student: "/student"
    };
    
    const expectedRoute = roleRouteMap[user.role];
    if (expectedRoute && !window.location.pathname.startsWith(expectedRoute)) {
      // Allow access to common routes
      const commonRoutes = ["/profile", "/settings"];
      const isCommonRoute = commonRoutes.some(route => window.location.pathname.startsWith(route));
      
      if (!isCommonRoute) {
        navigate(expectedRoute);
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}