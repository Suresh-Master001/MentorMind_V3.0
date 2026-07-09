import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  LogOut,
  User,
  ShieldCheck,
  FileText,
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const role = user?.role;

  const allItems = (() => {
    if (role === "admin") {
      return [
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Projects", path: "/projects", icon: <FolderKanban size={18} /> },
        { name: "Tasks", path: "/tasks", icon: <CheckSquare size={18} /> },
        { name: "Teams", path: "/teams", icon: <Users size={18} /> },
        { name: "Reports", path: "/reports", icon: <BarChart3 size={18} /> },
        { name: "Admin Panel", path: "/admin", icon: <ShieldCheck size={18} /> },
        { name: "Profile", path: "/profile", icon: <User size={18} /> },
      ];
    }

    if (role === "Team Lead") {
      return [
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Projects", path: "/projects", icon: <FolderKanban size={18} /> },
        { name: "My Tasks", path: "/tasks", icon: <CheckSquare size={18} /> },
        { name: "Teams", path: "/teams", icon: <Users size={18} /> },
        { name: "Reports", path: "/reports", icon: <BarChart3 size={18} /> },
        { name: "Profile", path: "/profile", icon: <User size={18} /> },
      ];
    }

    return [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "My Tasks", path: "/tasks", icon: <CheckSquare size={18} /> },
      { name: "My Report", path: "/my-report", icon: <FileText size={18} /> },
      { name: "Profile", path: "/profile", icon: <User size={18} /> },
    ];
  })();
  return (
    <>
      <div
        className={`fixed md:static top-18 pt-4 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <nav className="px-4 space-y-2">
          {allItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 w-full px-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;