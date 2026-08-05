import { Link } from "react-router-dom";

const LoginSelection = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">Choose login type</h1>

        <p className="mt-3 text-slate-600">
          Select the account type you want to use.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            to="/login/admin"
            className="rounded-xl border border-slate-200 p-5 font-semibold hover:border-indigo-400 hover:bg-indigo-50"
          >
            Admin
          </Link>

          <Link
            to="/login/staff"
            className="rounded-xl border border-slate-200 p-5 font-semibold hover:border-indigo-400 hover:bg-indigo-50"
          >
            Staff
          </Link>

          <Link
            to="/login/student"
            className="rounded-xl border border-slate-200 p-5 font-semibold hover:border-indigo-400 hover:bg-indigo-50"
          >
            Student
          </Link>
        </div>
      </div>
    </main>
  );
};

export default LoginSelection;