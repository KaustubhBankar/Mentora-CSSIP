import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const AuthLayout = ({
  title,
  subtitle,
  children,
  showBackButton = true,
}) => {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left information section */}
        <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
                <GraduationCap size={28} />
              </div>

              <div>
                <p className="text-2xl font-bold">Mentora</p>
                <p className="text-sm text-slate-400">
                  Staff–Student Interaction Platform
                </p>
              </div>
            </Link>
          </div>

          <div className="relative max-w-xl">
            <p className="mb-4 font-semibold uppercase tracking-[0.25em] text-indigo-400">
              Learn. Connect. Grow.
            </p>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              Building stronger connections between students and mentors.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              Access your personalized dashboard, manage your profile, connect
              with mentors, and participate in structured academic interaction.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck size={21} className="text-indigo-300" />
                </div>

                <div>
                  <h2 className="font-semibold">Secure authentication</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Role-based access using JWT authentication and protected
                    dashboard routes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <UsersRound size={21} className="text-indigo-300" />
                </div>

                <div>
                  <h2 className="font-semibold">Dedicated dashboards</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Separate interfaces for administrators, staff members, and
                    students.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <CheckCircle2 size={21} className="text-indigo-300" />
                </div>

                <div>
                  <h2 className="font-semibold">Verified registrations</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Registration is completed using a valid CDAC ID and
                    administrator approval.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative text-sm text-slate-500">
            © 2026 Mentora. All rights reserved.
          </div>
        </section>

        {/* Right form section */}
        <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <GraduationCap size={24} />
                </div>

                <div>
                  <p className="text-xl font-bold text-slate-900">Mentora</p>
                  <p className="text-xs text-slate-500">
                    Staff–Student Platform
                  </p>
                </div>
              </Link>
            </div>

            {showBackButton && (
              <Link
                to="/login"
                className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
              >
                <ArrowLeft size={18} />
                Back to login selection
              </Link>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>

              <p className="mt-3 leading-7 text-slate-600">{subtitle}</p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;