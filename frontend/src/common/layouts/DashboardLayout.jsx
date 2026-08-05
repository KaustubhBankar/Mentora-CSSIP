import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  dashboardNavigation,
  getRoleLabel,
} from "../config/dashboardNavigation";
import Sidebar from "../components/dashboard/Sidebar";
import TopNavbar from "../components/dashboard/TopNavbar";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const role = user?.role?.toUpperCase();
  const navigationItems = dashboardNavigation[role] ?? [];

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const savedState = localStorage.getItem("mentora_sidebar_collapsed");

    setIsSidebarCollapsed(savedState === "true");
  }, []);

  const handleCollapseToggle = () => {
    setIsSidebarCollapsed((previousValue) => {
      const updatedValue = !previousValue;

      localStorage.setItem(
        "mentora_sidebar_collapsed",
        String(updatedValue),
      );

      return updatedValue;
    });
  };

  const handleLogout = () => {
    const loginPath = role ? `/login/${role.toLowerCase()}` : "/login";

    logout();

    navigate(loginPath, {
      replace: true,
    });
  };

  const activeNavigationItem = navigationItems
    .filter((item) => {
      if (item.end) {
        return location.pathname === item.path;
      }

      return location.pathname.startsWith(item.path);
    })
    .sort((firstItem, secondItem) => {
      return secondItem.path.length - firstItem.path.length;
    })[0];

  const pageTitle =
    activeNavigationItem?.label ??
    `${getRoleLabel(role)} Dashboard`;

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        role={role}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onCollapseToggle={handleCollapseToggle}
        onLogout={handleLogout}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <TopNavbar
          user={user}
          title={pageTitle}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;