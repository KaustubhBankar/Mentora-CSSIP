import { Construction } from "lucide-react";
import PageHeader from "../components/dashboard/PageHeader";

const ComingSoon = ({
  title = "Feature coming soon",
  description = "This screen will be implemented in the next development phase.",
}) => {
  return (
    <div>
      <PageHeader
        eyebrow="Mentora"
        title={title}
        description={description}
      />

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Construction size={30} />
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-900">
          This module is under development
        </h3>

        <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
          We have created the navigation route. The complete UI and backend
          integration will be added component by component.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;