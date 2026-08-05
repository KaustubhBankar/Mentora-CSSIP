const GroupSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-start justify-between gap-5">
        <div className="space-y-3">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-9 w-64 rounded bg-slate-200" />
          <div className="h-5 w-96 max-w-full rounded bg-slate-200" />
        </div>

        <div className="h-11 w-28 rounded-xl bg-slate-200" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-80 rounded-2xl bg-slate-200" />

        <div className="space-y-6 xl:col-span-2">
          <div className="h-56 rounded-2xl bg-slate-200" />
          <div className="h-96 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default GroupSkeleton;