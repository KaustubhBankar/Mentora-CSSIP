import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-indigo-700"
        : "text-slate-600 hover:text-indigo-700"
    }`;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={closeMenu}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <GraduationCap size={23} />
          </div>

          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">
              Mentora
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              Staff–Student Interaction Platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <a
            href="#features"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700"
          >
            Features
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700"
          >
            About
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Register
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setIsMenuOpen((previous) => !previous)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-4">
            <NavLink to="/" className={navLinkClass} onClick={closeMenu}>
              Home
            </NavLink>

            <a
              href="#features"
              className="text-sm font-medium text-slate-600"
              onClick={closeMenu}
            >
              Features
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600"
              onClick={closeMenu}
            >
              About
            </a>

            <div className="mt-2 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-lg border border-indigo-200 px-4 py-2.5 text-center text-sm font-semibold text-indigo-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;