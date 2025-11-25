import { useAuth } from "../routes/ProtectedRoute.jsx";
import { Bell, Menu, X, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Format user role for display
  const formatRole = (role) => {
    const roleMap = {
      super_admin: "Super Admin",
      director_admin: "Director",
      hod: "HOD",
      mentor: "Mentor",
      student: "Student"
    };
    return roleMap[role] || role;
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-blue-600 text-white p-1 rounded mr-2">
                <User className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Sanjivani MAP</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Bell */}
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>
            
            {/* User Profile */}
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">{formatRole(user?.role)}</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button (duplicate for consistent spacing) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <div className="flex items-center px-4 py-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-base font-medium text-gray-900">{user?.name}</div>
                <div className="text-sm text-gray-500">{formatRole(user?.role)}</div>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-gray-200">
              <button className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <Bell className="mr-3 h-5 w-5" />
                Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}