import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChevronDown,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import NotificationBell from "./NotificationBell";

const Logo = () => (
  <div className="flex items-center gap-2">
    <img src="/logo.png" alt="MentorMind 3.0" className="h-8 w-auto" />
    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
      MentorMind 3.0
    </span>
  </div>
);

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".relative")) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 z-50">
      <div className="flex items-center justify-between px-4 h-full">

        {/* Mobile toggle + Logo */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Logo />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications - replaced with modern NotificationBell component */}
          <NotificationBell />
          {/* User dropdown */}
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 pr-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 z-[60]">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <p className="font-bold text-gray-800 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <Settings className="w-4 h-4" /> Profile
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;