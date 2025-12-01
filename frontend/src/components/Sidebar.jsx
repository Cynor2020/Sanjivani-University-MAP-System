import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../routes/ProtectedRoute.jsx";
import { 
  Home, Upload, FileText, Users, Calendar, BarChart3, 
  LogOut, Award, BookOpen, UserCheck, FolderOpen, 
  ToggleLeft, Shield, FileCheck
} from "lucide-react";

const MenuItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all group ${
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold shadow-sm border-l-4 border-blue-600'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <div className={`p-1.5 rounded-lg mr-3 transition ${
        isActive 
          ? 'bg-blue-100 text-blue-600' 
          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1">{item.label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
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
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const sidebarItems = {
    student: [
      { path: "/student", label: "Dashboard", icon: Home },
      { path: "/student/upload", label: "Upload Certificate", icon: Upload },
      { path: "/student/certificates", label: "My Certificates", icon: FileText }
    ],
    hod: [
      { path: "/hod", label: "Dashboard", icon: Home },
      { path: "/hod/pending", label: "Pending Certificates", icon: FileCheck },
      { path: "/hod/toggle-upload", label: "Toggle Upload", icon: ToggleLeft },
      { path: "/hod/students", label: "Manage Students", icon: Users },
      { path: "/hod/analytics", label: "Analytics", icon: BarChart3 }
    ],
    director: [
      { path: "/director", label: "Dashboard", icon: Home }
    ],
    super_admin: [
      { path: "/superadmin", label: "Dashboard", icon: Home },
      { path: "/superadmin/manage-directors", label: "Manage Directors", icon: UserCheck },
      { path: "/superadmin/manage-hods", label: "Manage HODs", icon: UserCheck },
      { path: "/superadmin/manage-departments", label: "Manage Departments", icon: FolderOpen },
      { path: "/superadmin/manage-categories", label: "Manage Categories", icon: FileText },
      { path: "/superadmin/start-year", label: "Start Academic Year", icon: Calendar },
      { path: "/superadmin/audit", label: "Audit Logs", icon: Shield },
      { path: "/superadmin/excellence", label: "Excellence Awards", icon: Award }
    ]
  };

  const items = sidebarItems[user?.role] || [];

  return (
    <aside className="hidden md:flex flex-col bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] w-64 shadow-lg">
      <div className="p-4 flex-1 flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="mb-6">
          <Link 
            to={items[0]?.path || "/"} 
            className="flex items-center space-x-2 group"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2 rounded-lg shadow-md group-hover:shadow-lg transition">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Sanjivani MAP
              </h2>
              <p className="text-xs text-gray-500">Activity Points System</p>
            </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {items.map((item) => (
            <MenuItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
            />
          ))}
        </nav>
        
        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="px-4 py-3 text-xs text-gray-500 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-3">
            <p className="font-semibold text-gray-700">Developed by</p>
            <p className="text-blue-600 font-bold mt-1">CYNOR Team SET</p>
            <p className="mt-1 text-gray-400">© {new Date().getFullYear()}</p>
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role?.replace('_', ' ')?.toUpperCase() || 'ROLE'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}