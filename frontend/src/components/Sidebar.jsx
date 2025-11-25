import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../routes/ProtectedRoute.jsx";
import { 
  Home, 
  Upload, 
  FileText, 
  Users, 
  User, 
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Award,
  BookOpen,
  UserCheck,
  UserPlus,
  FolderOpen,
  Clock,
  AlertCircle
} from "lucide-react";

export default function Sidebar() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const sidebarItems = {
    student: [
      { path: "/student", label: "Dashboard", icon: Home },
      { path: "/student/upload", label: "Upload Certificate", icon: Upload },
      { path: "/student/certificates", label: "My Certificates", icon: FileText },
      { path: "/student/transcript", label: "MAP Transcript", icon: Award },
      { path: "/student/carry-forward", label: "Carry Forward", icon: Clock }
    ],
    mentor: [
      { path: "/mentor", label: "Dashboard", icon: Home },
      { path: "/mentor/pending", label: "Pending Certificates", icon: FileText },
      { path: "/mentor/students", label: "Student List", icon: Users }
    ],
    hod: [
      { path: "/hod", label: "Dashboard", icon: Home },
      { path: "/hod/pending", label: "Pending Certificates", icon: FileText },
      { path: "/hod/deadline", label: "Upload Deadline", icon: Calendar },
      { path: "/hod/mentors", label: "Manage Mentors", icon: UserPlus },
      { path: "/hod/reports", label: "Department Reports", icon: BarChart3 },
      { path: "/hod/analytics", label: "Analytics", icon: BarChart3 }
    ],
    director_admin: [
      { path: "/director", label: "Dashboard", icon: Home },
      { path: "/director/hods", label: "Manage HODs", icon: UserCheck },
      { path: "/director/categories", label: "Manage Categories", icon: FolderOpen },
      { path: "/director/analytics", label: "University Analytics", icon: BarChart3 },
      { path: "/director/performance", label: "Performance vs Strength", icon: AlertCircle },
      { path: "/director/top-weak", label: "Top & Weak Branches", icon: BarChart3 }
    ],
    super_admin: [
      { path: "/superadmin", label: "Dashboard", icon: Home },
      { path: "/superadmin/start-year", label: "Start New Academic Year", icon: Calendar },
      { path: "/superadmin/directors", label: "Manage Directors", icon: UserCheck },
      { path: "/superadmin/academic", label: "Academic Year", icon: BookOpen },
      { path: "/superadmin/audit", label: "Audit Logs", icon: FileText },
      { path: "/superadmin/excellence", label: "Excellence Awards", icon: Award },
      { path: "/superadmin/reports", label: "University Reports", icon: BarChart3 }
    ]
  };

  const items = sidebarItems[user?.role] || [];

  return (
    <aside className="w-64 bg-white border-r hidden md:block min-h-screen">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className="bg-blue-600 text-white p-2 rounded">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Sanjivani MAP</h2>
            <p className="text-xs text-gray-500">Multi-Activity Points</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive(item.path)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}