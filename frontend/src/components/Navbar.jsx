import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../routes/ProtectedRoute.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button.jsx";
import { Menu, X, LogOut, Home, BookOpen } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      logout();
      navigate("/login");
    }
  };

  const getRoleTitle = (role) => {
    const roleMap = {
      super_admin: "Super Admin",
      director: "Director",
      hod: "HOD",
      student: "Student"
    };
    return roleMap[role] || "User";
  };

  const getDashboardPath = (role) => {
    const pathMap = {
      super_admin: "/superadmin",
      director: "/director",
      hod: "/hod",
      student: "/student"
    };
    return pathMap[role] || "/";
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={getDashboardPath(user?.role)} 
            className="flex items-center space-x-3 group"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg shadow-md group-hover:shadow-lg transition">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Sanjivani MAP
              </h1>
              <p className="text-xs text-gray-500">{getRoleTitle(user?.role)}</p>
            </div>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(getDashboardPath(user?.role))}
              className={`font-medium transition ${
                location.pathname === getDashboardPath(user?.role) 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="hidden lg:flex items-center space-x-3">
                <button onClick={() => navigate('/profile')} title="Profile">
                  {user?.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt={user?.name || "User"} 
                      className="h-9 w-9 rounded-full object-cover shadow-md border-2 border-white"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
                <div className="text-right hidden xl:block">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                navigate(getDashboardPath(user?.role));
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-lg transition ${
                location.pathname === getDashboardPath(user?.role) 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </button>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4 mb-3">
              <button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} title="Profile">
                {user?.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={user?.name || "User"} 
                    className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-white"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>
              <div className="ml-3 flex-1">
                <div className="text-base font-semibold text-gray-900">{user?.name || "User"}</div>
                <div className="text-sm text-gray-500 truncate">{user?.email || ""}</div>
              </div>
            </div>
            
            <div className="px-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
