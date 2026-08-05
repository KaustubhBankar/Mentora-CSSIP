import { ArrowLeft, Home, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { getDashboardPath } from "../../utils/roleRoutes";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleReturn = () => {
    if (isAuthenticated && user?.role) {
      navigate(getDashboardPath(user.role), {
        replace: true,
      });

      return;
    }

    navigate("/", {
      replace: true,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
          <ShieldX size={38} />
        </div>

        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Access denied
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          You cannot access this page
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Your account does not have the required role or permissions to open
          the requested page.
        </p>

        {user?.role && (
          <div className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            You are currently logged in as{" "}
            <span className="font-bold text-slate-900">{user.role}</span>.
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Go back
          </button>

          <button
            type="button"
            onClick={handleReturn}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <Home size={18} />
            {isAuthenticated ? "My dashboard" : "Home"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Unauthorized;