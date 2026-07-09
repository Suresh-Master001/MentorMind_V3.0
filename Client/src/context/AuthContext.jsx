import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { login as apiLogin, register as apiRegister, orgSetup as apiOrgSetup, logout as apiLogout, getCurrentUser } from "../services/authService";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://mentormind-v3-0-s.onrender.com";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Extract the user object from various response shapes:
 * - { user: {...}, token: "..." }  → user object
 * - { token: "...", name: "...", email: "..." }  → the data without token
 * - { name: "...", email: "..." }  → the data itself
 */
const extractUserFromResponse = (data) => {
  if (data.user && typeof data.user === "object") {
    return data.user;
  }
  // If data has a token but no nested user, strip the token
  if (data.token) {
    const { token: _token, ...userFields } = data;
    return userFields;
  }
  return data;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (cancelled) return;
        if (currentUser) {
          const u = extractUserFromResponse(currentUser);
          setUser(u);
          setIsAuthenticated(true);
          // Sync localStorage with clean user object
          localStorage.setItem("user", JSON.stringify(u));
        } else {
          // No valid session — clear stale state
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (_error) {
        if (!cancelled) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    initAuth();
    return () => { cancelled = true; };
  }, []);

  // Socket: connect/reconnect whenever the authenticated user changes
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socket = io(SOCKET_URL, {
      auth: { userId: user._id },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("task:assigned", (data) => {
      window.dispatchEvent(new CustomEvent("mm:task-assigned", { detail: data }));
    });

    socket.on("task:completed", (data) => {
      window.dispatchEvent(new CustomEvent("mm:task-completed", { detail: data }));
    });

    socket.on("task:delayed", (data) => {
      window.dispatchEvent(new CustomEvent("mm:task-delayed", { detail: data }));
    });

    socket.on("notification:new", (data) => {
      window.dispatchEvent(new CustomEvent("mm:notification-new", { detail: data }));
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, isAuthenticated]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      const loggedInUser = extractUserFromResponse(data);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return { success: true, user: loggedInUser };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }, []);

  const register = useCallback(async (name, email, password, skills, teamName = "", companyName = "", role = "member") => {
    try {
      const data = await apiRegister(name, email, password, skills, teamName, companyName, role);
      const registeredUser = extractUserFromResponse(data);
      setUser(registeredUser);
      setIsAuthenticated(true);
      return { success: true, user: registeredUser };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }, []);

  const orgSetup = useCallback(async (name, email, password, companyName, companyEmail, description) => {
    try {
      const data = await apiOrgSetup(name, email, password, companyName, companyEmail, description);
      const orgUser = extractUserFromResponse(data);
      setUser(orgUser);
      setIsAuthenticated(true);
      return { success: true, user: orgUser };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const isAdminOrTeamLead = useCallback(() => {
    return user?.role === "admin" || user?.role === "Team Lead";
  }, [user]);

  return <AuthContext.Provider value={{
    user,
    isAuthenticated,
    loading,
    login,
    register,
    orgSetup,
    logout,
    isAdminOrTeamLead,
  }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
