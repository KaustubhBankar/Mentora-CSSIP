const ProfileSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-28 rounded-2xl bg-slate-200" />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-80 rounded-2xl bg-slate-200" />

        <div className="space-y-5 xl:col-span-2">
          <div className="h-48 rounded-2xl bg-slate-200" />
          <div className="h-72 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;