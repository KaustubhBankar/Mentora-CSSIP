import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  UserCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AlertMessage from "../../common/components/AlertMessage";
import EmptyState from "../../common/components/EmptyState";
import MentorSkeleton from "../../common/components/dashboard/MentorSkeleton";
import PageHeader from "../../common/components/dashboard/PageHeader";
import { getMyMentor } from "../../services/mentorService";
import { getApiErrorMessage } from "../../utils/apiError";

const MyMentor = () => {
  const [mentor, setMentor] = useState(null);
  const [allocation, setAllocation] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMentor = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError("");

    try {
      const response = await getMyMentor();

      const normalizedData = normalizeMentorResponse(response);

      setMentor(normalizedData.mentor);
      setAllocation(normalizedData.allocation);
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 404) {
        setMentor(null);
        setAllocation(null);
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to load your assigned mentor.",
          ),
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMentor();
  }, [loadMentor]);

  if (isLoading) {
    return <MentorSkeleton />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Mentorship"
        title="My mentor"
        description="View the staff member assigned to guide and support you throughout your course."
        action={
          <button
            type="button"
            onClick={() => loadMentor({ refresh: true })}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
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

      {!mentor ? (
        <EmptyState
          icon={UserCheck}
          title="No mentor assigned yet"
          description="An administrator has not assigned a mentor to your account. Your mentor details will appear here once an allocation is completed."
          action={
            <button
              type="button"
              onClick={() => loadMentor({ refresh: true })}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              <RefreshCcw
                size={18}
                className={isRefreshing ? "animate-spin" : ""}
              />

              Check again
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <MentorSummaryCard mentor={mentor} />

          <div className="space-y-6 xl:col-span-2">
            <MentorInformation mentor={mentor} />

            <AllocationInformation
              mentor={mentor}
              allocation={allocation}
            />

            <MentorshipGuidelines />
          </div>
        </div>
      )}
    </div>
  );
};

const normalizeMentorResponse = (response) => {
  const source = response?.data ?? response ?? {};

  const mentorSource =
    source.mentor ??
    source.staff ??
    source.mentorDetails ??
    source;

  const hasMentor =
    mentorSource?.id ||
    mentorSource?.userId ||
    mentorSource?.cdacId ||
    mentorSource?.fullName ||
    mentorSource?.name;

  if (!hasMentor) {
    return {
      mentor: null,
      allocation: null,
    };
  }

  return {
    mentor: {
      id:
        mentorSource.id ??
        mentorSource.userId ??
        mentorSource.staffId ??
        null,

      cdacId:
        mentorSource.cdacId ??
        mentorSource.cdac_id ??
        "",

      fullName:
        mentorSource.fullName ??
        mentorSource.name ??
        mentorSource.staffName ??
        "Assigned Mentor",

      email:
        mentorSource.email ??
        mentorSource.emailAddress ??
        "",

      phone:
        mentorSource.phone ??
        mentorSource.mobile ??
        mentorSource.mobileNumber ??
        "",

      designation:
        mentorSource.designation ??
        mentorSource.position ??
        "Staff Mentor",

      department:
        mentorSource.department ??
        mentorSource.branch ??
        mentorSource.branchName ??
        "",

      qualification:
        mentorSource.qualification ??
        "",

      specialization:
        mentorSource.specialization ??
        mentorSource.domain ??
        mentorSource.expertise ??
        "",

      experience:
        mentorSource.experience ??
        mentorSource.yearsOfExperience ??
        "",

      officeLocation:
        mentorSource.officeLocation ??
        mentorSource.location ??
        "",

      bio:
        mentorSource.bio ??
        mentorSource.about ??
        "",
    },

    allocation: {
      allocationId:
        source.allocationId ??
        source.id ??
        null,

      groupName:
        source.groupName ??
        source.group?.name ??
        source.mentorGroup ??
        "",

      allocatedAt:
        source.allocatedAt ??
        source.assignedAt ??
        source.createdAt ??
        "",

      status:
        source.status ??
        source.allocationStatus ??
        "ACTIVE",
    },
  };
};

const MentorSummaryCard = ({ mentor }) => {
  const initials = getInitials(mentor.fullName);

  const handleEmail = () => {
    if (mentor.email) {
      window.location.href = `mailto:${mentor.email}`;
    }
  };

  const handleCall = () => {
    if (mentor.phone) {
      window.location.href = `tel:${mentor.phone}`;
    }
  };

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-indigo-100 text-4xl font-bold text-indigo-700">
          {initials}
        </div>

        <h2 className="mt-5 text-2xl font-bold text-slate-900">
          {mentor.fullName}
        </h2>

        <p className="mt-1 text-slate-500">
          {mentor.designation || "Staff Mentor"}
        </p>

        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          ASSIGNED
        </span>
      </div>

      <div className="mt-7 space-y-4 border-t border-slate-100 pt-6">
        <SummaryDetail
          icon={Mail}
          label="Email"
          value={mentor.email}
        />

        <SummaryDetail
          icon={Phone}
          label="Phone"
          value={mentor.phone}
        />

        <SummaryDetail
          icon={Building2}
          label="Department"
          value={mentor.department}
        />

        <SummaryDetail
          icon={MapPin}
          label="Office location"
          value={mentor.officeLocation}
        />
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <button
          type="button"
          onClick={handleEmail}
          disabled={!mentor.email}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Mail size={17} />
          Send email
        </button>

        <button
          type="button"
          onClick={handleCall}
          disabled={!mentor.phone}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <Phone size={17} />
          Call mentor
        </button>
      </div>
    </aside>
  );
};

const SummaryDetail = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
};

const getInitials = (fullName) => {
  if (!fullName) {
    return "MT";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const MentorInformation = ({ mentor }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
          <UserRound size={21} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Mentor information
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Professional and academic information about your mentor.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <InformationCard
          icon={UserRound}
          label="Full name"
          value={mentor.fullName}
        />

        <InformationCard
          icon={UserCheck}
          label="CDAC ID"
          value={mentor.cdacId}
        />

        <InformationCard
          icon={BriefcaseBusiness}
          label="Designation"
          value={mentor.designation}
        />

        <InformationCard
          icon={Building2}
          label="Department"
          value={mentor.department}
        />

        <InformationCard
          icon={GraduationCap}
          label="Qualification"
          value={mentor.qualification}
        />

        <InformationCard
          icon={BookOpen}
          label="Specialization"
          value={mentor.specialization}
        />

        <InformationCard
          icon={CalendarDays}
          label="Experience"
          value={formatExperience(mentor.experience)}
        />

        <InformationCard
          icon={MapPin}
          label="Office location"
          value={mentor.officeLocation}
        />
      </div>

      {mentor.bio && (
        <div className="mt-5 rounded-xl bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            About mentor
          </p>

          <p className="mt-3 leading-7 text-slate-700">
            {mentor.bio}
          </p>
        </div>
      )}
    </section>
  );
};

const InformationCard = ({ icon: Icon, label, value }) => {
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

const formatExperience = (experience) => {
  if (experience === null || experience === undefined || experience === "") {
    return "";
  }

  if (typeof experience === "number") {
    return `${experience} year${experience === 1 ? "" : "s"}`;
  }

  const numericValue = Number(experience);

  if (!Number.isNaN(numericValue)) {
    return `${numericValue} year${numericValue === 1 ? "" : "s"}`;
  }

  return experience;
};

const AllocationInformation = ({ mentor, allocation }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
          <UsersRound size={21} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Mentor allocation
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Details of your current mentor assignment.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <AllocationItem
          label="Assigned mentor"
          value={mentor.fullName}
        />

        <AllocationItem
          label="Group"
          value={allocation?.groupName}
        />

        <AllocationItem
          label="Allocation date"
          value={formatDate(allocation?.allocatedAt)}
        />

        <AllocationItem
          label="Allocation status"
          value={allocation?.status || "ACTIVE"}
          isStatus
        />
      </div>
    </section>
  );
};

const AllocationItem = ({
  label,
  value,
  isStatus = false,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      {isStatus && value ? (
        <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          {String(value).toUpperCase()}
        </span>
      ) : (
        <p className="mt-2 font-semibold text-slate-900">
          {value || "Not provided"}
        </p>
      )}
    </div>
  );
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};


const MentorshipGuidelines = () => {
  const guidelines = [
    "Discuss your academic and project progress regularly.",
    "Prepare questions before contacting your mentor.",
    "Inform your mentor about blockers as early as possible.",
    "Maintain professional and respectful communication.",
  ];

  return (
    <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
        Mentorship guidelines
      </p>

      <h3 className="mt-3 text-2xl font-bold">
        Make the most of your mentorship
      </h3>

      <p className="mt-3 max-w-2xl leading-7 text-slate-300">
        Regular, prepared and professional communication will help your mentor
        guide you more effectively.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {guidelines.map((guideline, index) => (
          <div
            key={guideline}
            className="flex items-start gap-3 rounded-xl bg-white/10 p-4"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold">
              {index + 1}
            </div>

            <p className="text-sm leading-6 text-slate-200">
              {guideline}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MyMentor;