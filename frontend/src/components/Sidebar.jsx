import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../routes/ProtectedRoute.jsx";
import {
  Home,
  Upload,
  FileText,
  Users,
  Calendar,
  BarChart3,
  LogOut,
  Award,
  UserCheck,
  FolderOpen,
  ToggleLeft,
  Shield,
  FileCheck,
  X,
} from "lucide-react";

const MenuItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all group ${
        isActive
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold shadow-sm border-l-4 border-blue-600"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <div
        className={`p-1.5 rounded-lg mr-3 transition ${
          isActive
            ? "bg-blue-100 text-blue-600"
            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1">{item.label}</span>
    </Link>
  );
};

function SidebarContent({ items, user, onNavigate, onLogout }) {
  return (
    <div className="p-4 flex-1 flex flex-col">
      {/* Navigation */}
      <nav className="space-y-1 flex-1 mt-2">
        {items.map((item) => (
          <MenuItem
            key={item.path}
            item={item}
            isActive={onNavigate.isActive(item.path)}
            onClick={(e) => {
              // Prevent double navigation issues on mobile when using push helper
              e.preventDefault();
              onNavigate.push(item.path);
            }}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
        <div className="px-2 text-[10px] text-gray-500 text-center">
          <p>
            Developed by{" "}
            <button
              type="button"
              onClick={() => window.open("https://cynortech.in/", "_blank", "noopener,noreferrer")}
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              CYNORTECH
            </button>
          </p>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={() => onNavigate.push("/profile")}
              title="Profile"
              className="flex-shrink-0"
            >
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user?.name || "User"}
                  className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-white"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role?.replace("_", " ")?.toUpperCase() || "ROLE"}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      navigate("/login");
    }
  };

  const isActive = (path) => {
    // Only mark exact route as active, not parent for nested routes
    return location.pathname === path;
  };

  const sidebarItems = {
    student: [
      { path: "/student", label: "Dashboard", icon: Home },
      { path: "/student/upload", label: "Upload Certificate", icon: Upload },
      { path: "/student/certificates", label: "My Certificates", icon: FileText },
    ],
    hod: [
      { path: "/hod", label: "Dashboard", icon: Home },
      { path: "/hod/pending", label: "Pending Certificates", icon: FileCheck },
      { path: "/hod/toggle-upload", label: "Toggle Upload", icon: ToggleLeft },
      { path: "/hod/students", label: "Manage Students", icon: Users },
      { path: "/hod/analytics", label: "Analytics", icon: BarChart3 },
    ],
    director: [{ path: "/director", label: "Dashboard", icon: Home }],
    super_admin: [
      { path: "/superadmin", label: "Dashboard", icon: Home },
      { path: "/superadmin/manage-directors", label: "Manage Directors", icon: UserCheck },
      { path: "/superadmin/manage-hods", label: "Manage HODs", icon: UserCheck },
      { path: "/superadmin/manage-departments", label: "Manage Departments", icon: FolderOpen },
      { path: "/superadmin/manage-categories", label: "Manage Categories", icon: FileText },
      { path: "/superadmin/start-year", label: "Start Academic Year", icon: Calendar },
      { path: "/superadmin/audit", label: "Audit Logs", icon: Shield },
      { path: "/superadmin/excellence", label: "Excellence Awards", icon: Award },
    ],
  };

  const items = sidebarItems[user?.role] || [];

  const navHelpers = {
    isActive,
    push: (path) => navigate(path),
  };

  return (
    <>
      {/* Desktop fixed sidebar (no internal scroll) */}
      <aside className="hidden md:flex flex-col bg-white border-r border-gray-200 h-[calc(100vh-4rem)] w-64 shadow-lg sticky top-16 self-start">
        <SidebarContent items={items} user={user} onNavigate={navHelpers} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onClose}
            aria-label="Close sidebar overlay"
          />
          <aside className="relative z-50 w-64 max-w-[80%] bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-800 truncate">Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              items={items}
              user={user}
              onNavigate={{
                ...navHelpers,
                push: (path) => {
                  navigate(path);
                  onClose?.();
                },
              }}
              onLogout={() => {
                onClose?.();
                handleLogout();
              }}
            />
          </aside>
        </div>
      )}
    </>
  );
}
