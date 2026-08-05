const StudentsSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-start justify-between gap-5">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-9 w-64 rounded bg-slate-200" />
          <div className="h-5 w-96 max-w-full rounded bg-slate-200" />
        </div>

        <div className="h-11 w-28 rounded-xl bg-slate-200" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="h-20 rounded-2xl bg-slate-200" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-64 rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    </div>
  );
};

export default StudentsSkeleton;