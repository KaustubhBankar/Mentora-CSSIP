import {
  BookOpenCheck,
  CheckCircle2,
  Eye,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import AlertMessage from "../../common/components/AlertMessage";
import EmptyState from "../../common/components/EmptyState";
import PageHeader from "../../common/components/dashboard/PageHeader";
import StudentsSkeleton from "../../common/components/dashboard/StudentsSkeleton";
import StatCard from "../../common/components/dashboard/StatCard";
import { getMyStudents } from "../../services/mentorService";
import { getApiErrorMessage } from "../../utils/apiError";

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadStudents = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      try {
        const response = await getMyStudents();

        const normalizedStudents =
          normalizeStudentsResponse(response);

        setStudents(normalizedStudents);
      } catch (requestError) {
        if (requestError.response?.status === 404) {
          setStudents([]);
        } else {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load your assigned students.",
            ),
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          student.fullName,
          student.cdacId,
          student.email,
          student.course,
          student.batch,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    return {
      total: students.length,

      approved: students.filter(
        (student) => student.status === "APPROVED",
      ).length,

      profileComplete: students.filter(
        (student) => student.profileCompletion >= 80,
      ).length,

      incomplete: students.filter(
        (student) => student.profileCompletion < 80,
      ).length,
    };
  }, [students]);

  if (isLoading) {
    return <StudentsSkeleton />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Mentorship"
        title="My students"
        description="View students assigned to you and review their academic and profile information."
        action={
          <button
            type="button"
            onClick={() =>
              loadStudents({
                refresh: true,
              })
            }
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              size={18}
              className={
                isRefreshing ? "animate-spin" : ""
              }
            />

            {isRefreshing ? "Refreshing..." : "Refresh"}
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

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students assigned"
          description="You do not currently have any students assigned to you. Student information will appear here after an administrator completes the mentor allocation."
          action={
            <button
              type="button"
              onClick={() =>
                loadStudents({
                  refresh: true,
                })
              }
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              <RefreshCcw
                size={18}
                className={
                  isRefreshing ? "animate-spin" : ""
                }
              />

              Check again
            </button>
          }
        />
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Assigned students"
              value={statistics.total}
              description="Total students under you"
              icon={Users}
            />

            <StatCard
              title="Approved accounts"
              value={statistics.approved}
              description="Active student accounts"
              icon={UserCheck}
            />

            <StatCard
              title="Profiles completed"
              value={statistics.profileComplete}
              description="At least 80% complete"
              icon={CheckCircle2}
            />

            <StatCard
              title="Profiles incomplete"
              value={statistics.incomplete}
              description="Require more information"
              icon={BookOpenCheck}
            />
          </section>

          <StudentFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            resultCount={filteredStudents.length}
          />

          {filteredStudents.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching students"
              description="No assigned students match the current search or status filter."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id ?? student.cdacId}
                  student={student}
                  onView={() =>
                    setSelectedStudent(student)
                  }
                />
              ))}
            </section>
          )}
        </>
      )}

      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};


const normalizeStudentsResponse = (response) => {
  const source = response?.data ?? response ?? {};

  const studentsSource = Array.isArray(source)
    ? source
    : source.students ??
      source.mentees ??
      source.assignedStudents ??
      source.content ??
      [];

  if (!Array.isArray(studentsSource)) {
    return [];
  }

  return studentsSource.map(normalizeStudent);
};

const normalizeStudent = (student) => {
  const profileCompletion =
    calculateProfileCompletion(student);

  return {
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

    email:
      student.email ??
      "",

    phone:
      student.phone ??
      student.mobile ??
      student.mobileNumber ??
      "",

    course:
      student.course ??
      student.courseName ??
      "",

    batch:
      student.batch ??
      student.batchName ??
      "",

    branch:
      student.branch ??
      student.branchName ??
      "",

    qualification:
      student.qualification ??
      "",

    specialization:
      student.specialization ??
      student.domain ??
      "",

    skills: Array.isArray(student.skills)
      ? student.skills.join(", ")
      : student.skills ?? "",

    city:
      student.city ??
      "",

    address:
      student.address ??
      "",

    status: String(
      student.status ??
        student.userStatus ??
        "APPROVED",
    ).toUpperCase(),

    profileCompletion:
      student.profileCompletion ??
      student.profilePercentage ??
      profileCompletion,
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
    student.city,
  ];

  const completedFields = fields.filter((field) => {
    if (Array.isArray(field)) {
      return field.length > 0;
    }

    return String(field ?? "").trim() !== "";
  }).length;

  return Math.round(
    (completedFields / fields.length) * 100,
  );
};

const StudentFilters = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  resultCount,
}) => {
  return (
    <section className="my-7 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
      <div className="relative w-full lg:max-w-md">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search name, CDAC ID, email or course"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">
          {resultCount} result
          {resultCount === 1 ? "" : "s"}
        </p>

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        >
          <option value="ALL">All statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="BLOCKED">Blocked</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
    </section>
  );
};

const StudentCard = ({ student, onView }) => {
  const initials = getInitials(student.fullName);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-700">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-900">
              {student.fullName}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {student.cdacId || "CDAC ID unavailable"}
            </p>

            <StatusBadge status={student.status} />
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
          <CardDetail
            icon={Mail}
            value={student.email}
          />

          <CardDetail
            icon={GraduationCap}
            value={student.course}
          />

          <CardDetail
            icon={MapPin}
            value={student.branch || student.city}
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              Profile completion
            </span>

            <span className="font-bold text-slate-900">
              {student.profileCompletion}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{
                width: `${Math.min(
                  student.profileCompletion,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 p-4">
        <button
          type="button"
          onClick={onView}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-indigo-50"
        >
          <Eye size={17} />
          View student details
        </button>
      </div>
    </article>
  );
};

const CardDetail = ({ icon: Icon, value }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <Icon
        size={16}
        className="shrink-0 text-slate-400"
      />

      <span className="truncate">
        {value || "Not provided"}
      </span>
    </div>
  );
};

const statusStyles = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  BLOCKED: "bg-red-100 text-red-700",
  REJECTED: "bg-slate-200 text-slate-700",
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = String(
    status || "APPROVED",
  ).toUpperCase();

  const style =
    statusStyles[normalizedStatus] ??
    "bg-slate-100 text-slate-700";

  return (
    <span
      className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${style}`}
    >
      {normalizedStatus}
    </span>
  );
};

const StudentDetailsModal = ({
  student,
  onClose,
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );

      document.body.style.overflow = "";
    };
  }, [onClose]);

  const initials = getInitials(student.fullName);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close student details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-details-title"
        className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Student details
            </p>

            <h2
              id="student-details-title"
              className="mt-1 text-2xl font-bold text-slate-900"
            >
              Profile overview
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={23} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-5 rounded-2xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-indigo-500 text-2xl font-bold">
              {initials}
            </div>

            <div className="min-w-0">
              <h3 className="text-2xl font-bold">
                {student.fullName}
              </h3>

              <p className="mt-1 text-slate-300">
                {student.cdacId}
              </p>

              <div className="mt-3">
                <StatusBadge status={student.status} />
              </div>
            </div>
          </div>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailItem
              icon={Mail}
              label="Email"
              value={student.email}
            />

            <DetailItem
              icon={Phone}
              label="Phone"
              value={student.phone}
            />

            <DetailItem
              icon={GraduationCap}
              label="Course"
              value={student.course}
            />

            <DetailItem
              icon={BookOpenCheck}
              label="Batch"
              value={student.batch}
            />

            <DetailItem
              icon={MapPin}
              label="Branch"
              value={student.branch}
            />

            <DetailItem
              icon={GraduationCap}
              label="Qualification"
              value={student.qualification}
            />

            <DetailItem
              icon={BookOpenCheck}
              label="Specialization"
              value={student.specialization}
            />

            <DetailItem
              icon={MapPin}
              label="City"
              value={student.city}
            />
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Technical skills
            </p>

            <p className="mt-3 leading-7 text-slate-700">
              {student.skills || "No skills provided."}
            </p>
          </section>

          {student.address && (
            <section className="mt-6 rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Address
              </p>

              <p className="mt-3 leading-7 text-slate-700">
                {student.address}
              </p>
            </section>
          )}

          <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            {student.email && (
              <a
                href={`mailto:${student.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                <Mail size={18} />
                Send email
              </a>
            )}

            {student.phone && (
              <a
                href={`tel:${student.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Phone size={18} />
                Call student
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={16} />

        <p className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words font-semibold text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
};


const getInitials = (fullName) => {
  if (!fullName) {
    return "ST";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export default MyStudents;