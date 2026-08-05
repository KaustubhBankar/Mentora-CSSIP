import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRoleLabel } from "../../config/dashboardNavigation";

const TopNavbar = ({
  user,
  title,
  onMenuClick,
  onLogout,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const rolePath = user?.role?.toLowerCase();

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open dashboard navigation"
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
            {title}
          </h1>

          <p className="hidden text-sm text-slate-500 sm:block">
            Welcome back, {user?.fullName ?? "User"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() =>
              setIsProfileMenuOpen((previousValue) => !previousValue)
            }
            className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-slate-200 hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
              {userInitials}
            </div>

            <div className="hidden max-w-40 text-left md:block">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.fullName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {getRoleLabel(user?.role)}
              </p>
            </div>

            <ChevronDown
              size={17}
              className={`hidden text-slate-400 transition-transform md:block ${
                isProfileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-4">
                <p className="truncate font-semibold text-slate-900">
                  {user?.fullName}
                </p>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {user?.email || user?.cdacId}
                </p>

                <span className="mt-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  {user?.role}
                </span>
              </div>

              {rolePath && (
                <div className="p-2">
                  <Link
                    to={`/${rolePath}/profile`}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <UserRound size={18} />
                    My profile
                  </Link>

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Settings size={18} />
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;