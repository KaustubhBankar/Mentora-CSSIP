const PageHeader = ({
  eyebrow,
  title,
  description,
  action,
}) => {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-start">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;