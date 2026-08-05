import {
  BookOpenCheck,
  CalendarCheck,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import PageHeader from "../../common/components/dashboard/PageHeader";
import StatCard from "../../common/components/dashboard/StatCard";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div role="button"
      tabIndex={0}
      onClick={() => navigate("/student/mentor")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          navigate("/student/mentor");
        }
      }}
      className="cursor-pointer">
      <PageHeader
        eyebrow="Student Area"
        title={`Welcome, ${user?.fullName ?? "Student"}`}
        description="View your profile, assigned mentor, group details and learning activity."
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Profile status"
          value="85%"
          description="Complete your profile"
          icon={BookOpenCheck}
        />

        <StatCard
          title="Assigned mentor"
          value="1"
          description="View mentor details"
          icon={UserCheck}
          onClick={() => navigate("/student/mentor")}
        />

        <StatCard
          title="My group"
          value="Group A"
          description="Current allocated group"
          icon={UsersRound}
        />

        <StatCard
          title="Upcoming tasks"
          value="0"
          description="No pending tasks"
          icon={CalendarCheck}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="text-lg font-bold text-slate-900">
            Student overview
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Your account and academic information
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <DetailItem label="Full name" value={user?.fullName} />
            <DetailItem label="CDAC ID" value={user?.cdacId} />
            <DetailItem label="Email" value={user?.email} />
            <DetailItem label="Role" value={user?.role} />
          </div>
        </article>

        <article className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-300">
            Getting started
          </p>

          <h3 className="mt-3 text-2xl font-bold">
            Complete your Mentora profile
          </h3>

          <p className="mt-3 leading-7 text-slate-300">
            Add your course, batch, skills and professional information to help
            your mentor understand your goals.
          </p>

          <button
            type="button"
            onClick={() => navigate("/student/profile")}
            className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-indigo-50"
          >
            Complete profile
          </button>
        </article>
      </section>
    </div>
  );
};

const DetailItem = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
};

export default StudentDashboard;