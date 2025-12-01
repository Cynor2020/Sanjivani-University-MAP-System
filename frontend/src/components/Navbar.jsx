import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../routes/ProtectedRoute.jsx";
import { Menu } from "lucide-react";

const SANJIVANI_SITE = "https://sanjivani.edu.in/";
const SANJIVANI_LOGO = "https://sanjivani.edu.in/images/SU%20LOGO.png";

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isProfilePage = location.pathname.startsWith("/profile");

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-blue-100 shadow-sm sticky top-0 z-50">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Logo + university name (desktop + mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => window.open(SANJIVANI_SITE, "_blank", "noopener,noreferrer")}
              className="flex-shrink-0"
              title="Sanjivani University Website"
            >
              <img
                src={SANJIVANI_LOGO}
                alt="Sanjivani University"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
              />
            </button>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                Sanjivani University
              </span>
            </div>
          </div>

          {/* Right: Profile + menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop: avatar + name */}
            <button
              type="button"
              onClick={() => {
                if (!isProfilePage) navigate("/profile");
              }}
              title="Profile"
              className="hidden md:flex items-center gap-2"
            >
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user?.name || "User"}
                  className="h-9 w-9 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 max-w-[140px] truncate">
                {user?.name || "User"}
              </span>
            </button>

            {/* Mobile: only avatar */}
            <button
              type="button"
              onClick={() => {
                if (!isProfilePage) navigate("/profile");
              }}
              title="Profile"
              className="md:hidden flex-shrink-0"
            >
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user?.name || "User"}
                  className="h-9 w-9 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </button>

            {/* Mobile + desktop: sidebar toggle button (3-line menu) */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition md:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
