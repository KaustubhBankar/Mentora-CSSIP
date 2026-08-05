import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Network,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const features = [
  {
    title: "Role-Based Access",
    description:
      "Dedicated and secure experiences for administrators, staff members, and students.",
    icon: ShieldCheck,
  },
  {
    title: "User Management",
    description:
      "Administrators can approve, reject, block, unblock, and manage registered users.",
    icon: UserRoundCheck,
  },
  {
    title: "Mentor Allocation",
    description:
      "Allocate mentors to students and make staff–student interaction easier to manage.",
    icon: Network,
  },
  {
    title: "Professional Profiles",
    description:
      "Students and staff can maintain their academic and professional information.",
    icon: BadgeCheck,
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pb-20 pt-36 sm:pb-28 sm:pt-44">
          <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
                <BookOpenCheck size={17} />
                CDAC Staff–Student Interaction Platform
              </div>

              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Connect students with the{" "}
                <span className="text-indigo-600">right mentors</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Mentora provides a centralized platform for profile management,
                administrative approval, mentor allocation, and meaningful
                interaction between CDAC staff and students.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  Create an account
                  <ArrowRight size={19} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  Login to Mentora
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Secure JWT authentication
                </div>

                <div className="flex items-center gap-2">
                  <UsersRound size={18} className="text-emerald-600" />
                  Role-specific dashboards
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70 sm:p-8">
                <div className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Mentora Dashboard</p>
                      <h2 className="mt-1 text-2xl font-semibold">
                        Welcome back
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500">
                      <UsersRound size={25} />
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-slate-400">Students</p>
                      <p className="mt-2 text-3xl font-bold">120+</p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-slate-400">Mentors</p>
                      <p className="mt-2 text-3xl font-bold">24</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-5 text-slate-900">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Mentor allocation</p>
                        <p className="text-sm text-slate-500">
                          Current allocation overview
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[80, 65, 90].map((width, index) => (
                        <div key={index}>
                          <div className="mb-1 flex justify-between text-xs text-slate-500">
                            <span>Group {index + 1}</span>
                            <span>{width}%</span>
                          </div>

                          <div className="h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-indigo-600"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-semibold uppercase tracking-widest text-indigo-600">
                Platform features
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything required for effective mentoring
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                A structured platform connecting administrators, mentors, and
                students through secure role-based workflows.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-10">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Begin your Mentora journey
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Register using your pre-issued CDAC ID and access your dashboard
              after administrator approval.
            </p>

            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-900 transition hover:bg-indigo-50"
            >
              Register now
              <ArrowRight size={19} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-sm text-slate-500 sm:flex-row sm:px-8 lg:px-10">
          <p>© 2026 Mentora. All rights reserved.</p>
          <p>CDAC Staff–Student Interaction Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;