import { ArrowUpRight } from "lucide-react";

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  onClick,
}) => {
  const Component = onClick ? "button" : "article";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        onClick
          ? "cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-100"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Icon size={23} />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {description}
        </p>

        {trend && (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={15} />
            {trend}
          </span>
        )}
      </div>
    </Component>
  );
};

export default StatCard;