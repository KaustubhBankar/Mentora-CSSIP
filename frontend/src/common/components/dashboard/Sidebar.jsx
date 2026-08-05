import {
  GraduationCap,
  LogOut,
  PanelLeftClose,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { dashboardNavigation } from "../../config/dashboardNavigation";

const Sidebar = ({
  role,
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onCollapseToggle,
  onLogout,
}) => {
  const navigationItems = dashboardNavigation[role] ?? [];

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses =
      "group flex items-center rounded-xl transition-all duration-200";

    const spacingClasses = isCollapsed
      ? "justify-center px-3 py-3"
      : "gap-3 px-4 py-3";

    const colorClasses = isActive
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/20"
      : "text-slate-300 hover:bg-white/10 hover:text-white";

    return `${baseClasses} ${spacingClasses} ${colorClasses}`;
  };

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close dashboard navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-white transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        } ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className={`flex h-20 items-center border-b border-white/10 ${
            isCollapsed ? "justify-center px-3" : "justify-between px-5"
          }`}
        >
          <NavLink
            to={`/${role.toLowerCase()}/dashboard`}
            onClick={onMobileClose}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-950/40">
              <GraduationCap size={25} />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xl font-bold">Mentora</p>
                <p className="truncate text-xs text-slate-400">
                  Staff–Student Platform
                </p>
              </div>
            )}
          </NavLink>

          {!isCollapsed && (
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close sidebar"
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={21} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {!isCollapsed && (
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Navigation
            </p>
          )}

          <div className="space-y-2">
            {navigationItems.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={onMobileClose}
                title={isCollapsed ? label : undefined}
                className={getNavLinkClass}
              >
                <Icon size={21} className="shrink-0" />

                {!isCollapsed && (
                  <span className="truncate text-sm font-medium">{label}</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex w-full items-center rounded-xl text-slate-300 transition hover:bg-red-500/15 hover:text-red-300 ${
              isCollapsed
                ? "justify-center px-3 py-3"
                : "gap-3 px-4 py-3"
            }`}
          >
            <LogOut size={21} />

            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>

          <button
            type="button"
            onClick={onCollapseToggle}
            className={`mt-2 hidden w-full items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white lg:flex ${
              isCollapsed
                ? "justify-center px-3 py-3"
                : "gap-3 px-4 py-3"
            }`}
          >
            <PanelLeftClose
              size={21}
              className={`transition-transform ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />

            {!isCollapsed && (
              <span className="text-sm font-medium">Collapse sidebar</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;