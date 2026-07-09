import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle window resize - close sidebar on small screens automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Desktop: open sidebar by default
        setSidebarOpen(true);
      } else {
        // Mobile: close sidebar by default  
        setSidebarOpen(false);
      }
    };

    // Set initial state based on current window size
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Navbar - Fixed at top, includes mobile menu toggle */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Container - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden pt-16">
        
        {/* Sidebar - Fixed on left */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 relative z-0">
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;
