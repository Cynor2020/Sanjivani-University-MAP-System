import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./ProtectedRoute.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    
    const roleRouteMap = {
      super_admin: "/superadmin",
      director: "/director",
      hod: "/hod",
      student: "/student"
    };
    
    const expectedRoute = roleRouteMap[user.role];
    if (expectedRoute && !window.location.pathname.startsWith(expectedRoute)) {
      const commonRoutes = ["/profile", "/settings"];
      const isCommonRoute = commonRoutes.some(route => 
        window.location.pathname.startsWith(route)
      );
      
      if (!isCommonRoute) {
        navigate(expectedRoute);
      }
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((v) => !v)} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 transition-all duration-300">
          <div className="w-full mx-auto">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
