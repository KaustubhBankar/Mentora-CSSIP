import {
  BookOpenCheck,
  MessageSquareText,
  RefreshCcw,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import AlertMessage from "../../common/components/AlertMessage";
import EmptyState from "../../common/components/EmptyState";
import PageHeader from "../../common/components/dashboard/PageHeader";
import StatCard from "../../common/components/dashboard/StatCard";
import { getMyStudents } from "../../services/mentorService";
import { getStaffProfile } from "../../services/staffService";
import { getApiErrorMessage } from "../../utils/apiError";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [profile, setProfile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [studentsResponse, profileResponse] =
        await Promise.allSettled([
          getMyStudents(),
          getStaffProfile(),
        ]);

      if (studentsResponse.status === "fulfilled") {
        setStudents(
          normalizeStudents(studentsResponse.value),
        );
      } else if (
        studentsResponse.reason?.response?.status === 404
      ) {
        setStudents([]);
      } else {
        throw studentsResponse.reason;
      }

      if (profileResponse.status === "fulfilled") {
        setProfile(
          normalizeStaffProfile(
            profileResponse.value,
            user,
          ),
        );
      } else {
        setProfile(normalizeStaffProfile({}, user));
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to load the staff dashboard.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statistics = useMemo(() => {
    const completedProfiles = students.filter(
      (student) => student.profileCompletion >= 80,
    ).length;

    return {
      totalStudents: students.length,
      completedProfiles,
      incompleteProfiles:
        students.length - completedProfiles,
    };
  }, [students]);

  const recentStudents = students.slice(0, 5);

  return (
    <div>
      <PageHeader
        eyebrow="Staff Area"
        title={`Welcome, ${
          user?.fullName ?? "Staff Member"
        }`}
        description="Review assigned students and manage your mentoring profile."
        action={
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCcw
              size={18}
              className={
                isLoading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        }
      />

      <div className="mb-6">
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Assigned students"
          value={
            isLoading
              ? "..."
              : statistics.totalStudents
          }
          description="Students under mentorship"
          icon={Users}
          onClick={() =>
            navigate("/staff/students")
          }
        />

        <StatCard
          title="Completed profiles"
          value={
            isLoading
              ? "..."
              : statistics.completedProfiles
          }
          description="At least 80% complete"
          icon={UserCheck}
          onClick={() =>
            navigate("/staff/students")
          }
        />

        <StatCard
          title="Incomplete profiles"
          value={
            isLoading
              ? "..."
              : statistics.incompleteProfiles
          }
          description="Require more information"
          icon={BookOpenCheck}
          onClick={() =>
            navigate("/staff/students")
          }
        />

        <StatCard
          title="Announcements"
          value="0"
          description="Feature available later"
          icon={MessageSquareText}
          onClick={() =>
            navigate("/staff/announcements")
          }
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Assigned students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recently assigned students
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/staff/students")
              }
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </button>
          </div>

          {isLoading ? (
            <StudentsListSkeleton />
          ) : recentStudents.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No students assigned"
                description="Assigned students will appear after an administrator completes mentor allocation."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentStudents.map((student) => (
                <StudentRow
                  key={student.id ?? student.cdacId}
                  student={student}
                  onView={() =>
                    navigate("/staff/students")
                  }
                />
              ))}
            </div>
          )}
        </article>

        <article className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            My profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Professional account information
          </p>

          <div className="mt-6 space-y-5">
            <ProfileItem
              label="Full name"
              value={profile?.fullName}
            />

            <ProfileItem
              label="Designation"
              value={profile?.designation}
            />

            <ProfileItem
              label="Department"
              value={profile?.department}
            />

            <ProfileItem
              label="Specialization"
              value={profile?.specialization}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/staff/profile")
            }
            className="mt-7 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            View profile
          </button>
        </article>
      </section>
    </div>
  );
};

const normalizeStudents = (response) => {
  const source = response?.data ?? response ?? {};

  const students = Array.isArray(source)
    ? source
    : source.students ??
      source.mentees ??
      source.assignedStudents ??
      source.content ??
      [];

  if (!Array.isArray(students)) {
    return [];
  }

  return students.map((student) => ({
    id:
      student.id ??
      student.userId ??
      student.studentId ??
      null,

    cdacId:
      student.cdacId ??
      student.cdac_id ??
      "",

    fullName:
      student.fullName ??
      student.name ??
      student.studentName ??
      "Student",

    email: student.email ?? "",

    course:
      student.course ??
      student.courseName ??
      "",

    profileCompletion:
      student.profileCompletion ??
      student.profilePercentage ??
      calculateProfileCompletion(student),
  }));
};

const normalizeStaffProfile = (
  response,
  fallbackUser,
) => {
  const source = response?.data ?? response ?? {};

  return {
    fullName:
      source.fullName ??
      source.name ??
      fallbackUser?.fullName ??
      "",

    designation:
      source.designation ??
      source.position ??
      "Staff Mentor",

    department:
      source.department ??
      source.branchName ??
      "",

    specialization:
      source.specialization ??
      source.domain ??
      source.expertise ??
      "",
  };
};

const calculateProfileCompletion = (student) => {
  const fields = [
    student.fullName ?? student.name,
    student.email,
    student.phone ?? student.mobile,
    student.course ?? student.courseName,
    student.batch ?? student.batchName,
    student.branch ?? student.branchName,
    student.qualification,
    student.specialization ?? student.domain,
    student.skills,
  ];

  const completed = fields.filter((field) => {
    if (Array.isArray(field)) {
      return field.length > 0;
    }

    return String(field ?? "").trim() !== "";
  }).length;

  return Math.round(
    (completed / fields.length) * 100,
  );
};

const StudentRow = ({
  student,
  onView,
}) => {
  const initials = getInitials(student.fullName);

  return (
    <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {student.fullName}
          </p>

          <p className="mt-1 truncate text-sm text-slate-500">
            {student.cdacId}
            {student.course
              ? ` · ${student.course}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-slate-500">
            Profile
          </p>

          <p className="font-bold text-slate-900">
            {student.profileCompletion}%
          </p>
        </div>

        <button
          type="button"
          onClick={onView}
          className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
        >
          View
        </button>
      </div>
    </div>
  );
};

const ProfileItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
      {label}
    </p>

    <p className="mt-1 font-semibold text-slate-900">
      {value || "Not provided"}
    </p>
  </div>
);

const StudentsListSkeleton = () => (
  <div className="animate-pulse space-y-3 p-5">
    {Array.from({ length: 4 }).map(
      (_, index) => (
        <div
          key={index}
          className="h-20 rounded-xl bg-slate-200"
        />
      ),
    )}
  </div>
);

const getInitials = (fullName) => {
  if (!fullName) {
    return "ST";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
};

export default StaffDashboard;