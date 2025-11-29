import { Link, useLocation, useNavigate } from "react-router-dom";
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
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const MenuItem = ({ item, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;
  
  return (
    <motion.div
      whileHover={{ x: 5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <div className={`p-1.5 rounded-lg mr-3 ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="flex-1">{item.label}</span>
        <motion.div
          animate={{ x: isHovered ? 3 : 0 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <ChevronRight className={`h-4 w-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
        </motion.div>
      </Link>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-full"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      )}
    </motion.div>
  );
};

export default function Sidebar() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePath, setActivePath] = useState(location.pathname);
  const navigate = useNavigate();
  
  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);
  
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
    }
  };
  
  const isActive = (path) => {
    return activePath === path || activePath.startsWith(path);
  };

  const sidebarItems = {
    student: [
      { path: "/student", label: "Dashboard", icon: Home },
      { path: "/student/upload", label: "Upload Certificate", icon: Upload },
      { path: "/student/certificates", label: "My Certificates", icon: FileText },
      { path: "/student/transcript", label: "MAP Transcript", icon: Award },
      { path: "/student/carry-forward", label: "Carry Forward", icon: Clock }
    ],
    // mentor role removed as per requirements
    hod: [
      { path: "/hod", label: "Dashboard", icon: Home },
      { path: "/hod/pending", label: "Pending Certificates", icon: FileText },
      { path: "/hod/deadline", label: "Upload Deadline", icon: Calendar },

      { path: "/hod/reports", label: "Department Reports", icon: BarChart3 },
      { path: "/hod/analytics", label: "Analytics", icon: BarChart3 }
    ],
    director_admin: [
      { path: "/director", label: "Dashboard", icon: Home },
      { path: "/director/hods", label: "Manage HODs", icon: UserCheck },
      { path: "/director/analytics", label: "University Analytics", icon: BarChart3 },
      { path: "/director/performance", label: "Performance vs Strength", icon: AlertCircle },
      { path: "/director/top-weak", label: "Top & Weak Branches", icon: BarChart3 },

      { path: "/director/deadline", label: "Upload Deadline", icon: Calendar },
      { path: "/director/department-reports", label: "Department Reports", icon: BarChart3 },
      { path: "/director/department-analytics", label: "Dept Analytics", icon: BarChart3 },
      { path: "/director/pending", label: "Pending Certificates", icon: FileText },
      { path: "/director/student-passwords", label: "Student Passwords", icon: Users }
    ],
    super_admin: [
      { path: "/superadmin", label: "Dashboard", icon: Home },
      { path: "/superadmin/start-year", label: "Start New Academic Year", icon: Calendar },
      { path: "/superadmin/directors", label: "Manage Directors", icon: UserCheck },
      { path: "/superadmin/categories", label: "Manage Categories", icon: FolderOpen },
      { path: "/superadmin/academic", label: "Academic Year", icon: BookOpen },
      { path: "/superadmin/audit", label: "Audit Logs", icon: FileText },
      { path: "/superadmin/excellence", label: "Excellence Awards", icon: Award },
      { path: "/superadmin/reports", label: "University Reports", icon: BarChart3 },
      { path: "/superadmin/create-student", label: "Create Student", icon: UserPlus },
      { path: "/superadmin/set-student-password", label: "Set Student Password", icon: Settings },
      { path: "/superadmin/departments", label: "Manage Departments", icon: Users },
      { path: "/superadmin/hods", label: "Manage HODs", icon: UserCheck }
    ]
  };

  const items = sidebarItems[user?.role] || [];

  return (
    <motion.aside 
      className={`bg-white border-r hidden md:flex flex-col min-h-screen ${isCollapsed ? 'w-16' : 'w-64'} shadow-lg`}
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4 flex-1 flex flex-col">
        {/* Logo and Toggle */}
        <motion.div 
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-6`}
          whileHover={{ scale: 1.02 }}
        >
          {!isCollapsed && (
            <Link to="/" className="flex items-center space-x-2">
              <motion.div 
                className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2 rounded-lg shadow-md"
                whileHover={{ rotate: 5, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="h-5 w-5" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Sanjivani MAP</h2>
                <p className="text-xs text-gray-500">Multi-Activity Points</p>
              </div>
            </Link>
          )}
          {!isCollapsed && (
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Collapse sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          )}
        </motion.div>
        
        {/* Navigation */}
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {items.map((item) => (
            <MenuItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              onClick={() => setActivePath(item.path)}
            />
          ))}
        </nav>
        
        {/* User & Logout */}
        <div className={`mt-auto pt-4 border-t ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">{user?.role?.replace('_', ' ')?.toUpperCase() || 'ROLE'}</p>
                </div>
              </div>
            )}
            
            <motion.button
              onClick={handleLogout}
              className={`p-2 rounded-lg hover:bg-red-50 text-red-500 ${isCollapsed ? 'w-full flex justify-center' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-2 text-sm">Logout</span>}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Collapse Button (at bottom when collapsed) */}
      {isCollapsed && (
        <div className="p-2 border-t">
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 w-full flex justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4 transform rotate-180" />
          </motion.button>
        </div>
      )}
    </motion.aside>
  );
}