import { ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <div className="w-full max-w-xl text-center">
        <p className="text-8xl font-black tracking-tight text-indigo-200">
          404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-600">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Go back
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            <Home size={18} />
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;