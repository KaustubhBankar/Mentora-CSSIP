const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      {Icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon size={30} />
        </div>
      )}

      <h3 className="mt-5 text-xl font-bold text-slate-900">
        {title}
      </h3>

      {description && (
        <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;