import { GraduationCap, LoaderCircle } from "lucide-react";

const PageLoader = ({ message = "Loading Mentora..." }) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <GraduationCap size={32} />
        </div>

        <LoaderCircle
          size={28}
          className="mx-auto mt-6 animate-spin text-indigo-600"
        />

        <p className="mt-3 font-medium text-slate-600">{message}</p>
      </div>
    </main>
  );
};

export default PageLoader;