import {
  BookOpenCheck,
  CalendarDays,
  Crown,
  Mail,
  RefreshCcw,
  Search,
  UserCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import AlertMessage from "../../common/components/AlertMessage";
import EmptyState from "../../common/components/EmptyState";
import GroupSkeleton from "../../common/components/dashboard/GroupSkeleton";
import PageHeader from "../../common/components/dashboard/PageHeader";
import { getMyGroup } from "../../services/mentorService";
import { getApiErrorMessage } from "../../utils/apiError";

const MyGroup = () => {
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadGroup = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError("");

    try {
      const response = await getMyGroup();
      const normalizedGroup = normalizeGroupResponse(response);

      setGroup(normalizedGroup);
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setGroup(null);
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to load your mentoring group.",
          ),
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const filteredMembers = useMemo(() => {
    if (!group?.members) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return group.members;
    }

    return group.members.filter((member) => {
      return [
        member.fullName,
        member.cdacId,
        member.email,
        member.course,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [group, searchTerm]);

  if (isLoading) {
    return <GroupSkeleton />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Student Group"
        title="My group"
        description="View your assigned mentoring group, group mentor and fellow students."
        action={
          <button
            type="button"
            onClick={() => loadGroup({ refresh: true })}
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

      {!group ? (
        <EmptyState
          icon={UsersRound}
          title="No group assigned yet"
          description="You have not been added to a mentoring group. Group details will appear here after an administrator completes the allocation."
          action={
            <button
              type="button"
              onClick={() => loadGroup({ refresh: true })}
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
          <GroupSummaryCard group={group} />

          <div className="space-y-6 xl:col-span-2">
            <GroupMentorCard mentor={group.mentor} />

            <GroupMembersSection
              members={filteredMembers}
              totalMembers={group.members.length}
              currentUserId={user?.userId}
              currentCdacId={user?.cdacId}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const normalizeGroupResponse = (response) => {
  const source = response?.data ?? response ?? {};

  const groupSource =
    source.group ??
    source.mentorGroup ??
    source.groupDetails ??
    source;

  const groupExists =
    groupSource?.id ||
    groupSource?.groupId ||
    groupSource?.name ||
    groupSource?.groupName;

  if (!groupExists) {
    return null;
  }

  const mentorSource =
    groupSource.mentor ??
    source.mentor ??
    groupSource.staff ??
    source.staff ??
    null;

  const membersSource =
    groupSource.members ??
    groupSource.students ??
    source.members ??
    source.students ??
    [];

  return {
    id:
      groupSource.id ??
      groupSource.groupId ??
      null,

    name:
      groupSource.name ??
      groupSource.groupName ??
      "Mentoring Group",

    description:
      groupSource.description ??
      groupSource.groupDescription ??
      "",

    course:
      groupSource.course ??
      groupSource.courseName ??
      "",

    batch:
      groupSource.batch ??
      groupSource.batchName ??
      "",

    createdAt:
      groupSource.createdAt ??
      groupSource.allocatedAt ??
      source.allocatedAt ??
      "",

    status:
      groupSource.status ??
      source.status ??
      "ACTIVE",

    mentor: mentorSource
      ? normalizeMentor(mentorSource)
      : null,

    members: Array.isArray(membersSource)
      ? membersSource.map(normalizeMember)
      : [],
  };
};

const normalizeMentor = (mentor) => {
  return {
    id:
      mentor.id ??
      mentor.userId ??
      mentor.staffId ??
      null,

    cdacId:
      mentor.cdacId ??
      mentor.cdac_id ??
      "",

    fullName:
      mentor.fullName ??
      mentor.name ??
      mentor.staffName ??
      "Assigned Mentor",

    email:
      mentor.email ??
      "",

    phone:
      mentor.phone ??
      mentor.mobile ??
      mentor.mobileNumber ??
      "",

    designation:
      mentor.designation ??
      mentor.position ??
      "Staff Mentor",
  };
};

const normalizeMember = (member) => {
  return {
    id:
      member.id ??
      member.userId ??
      member.studentId ??
      null,

    cdacId:
      member.cdacId ??
      member.cdac_id ??
      "",

    fullName:
      member.fullName ??
      member.name ??
      member.studentName ??
      "Student",

    email:
      member.email ??
      "",

    course:
      member.course ??
      member.courseName ??
      "",

    profileStatus:
      member.profileStatus ??
      member.status ??
      "ACTIVE",
  };
};

const GroupSummaryCard = ({ group }) => {
  return (
    <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-950 p-6 text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500">
          <UsersRound size={28} />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
          Mentoring group
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          {group.name}
        </h2>

        <p className="mt-3 leading-7 text-slate-300">
          {group.description ||
            "Your assigned peer mentoring and academic support group."}
        </p>
      </div>

      <div className="space-y-4 p-6">
        <GroupSummaryItem
          icon={UsersRound}
          label="Total members"
          value={group.members.length}
        />

        <GroupSummaryItem
          icon={BookOpenCheck}
          label="Course"
          value={group.course}
        />

        <GroupSummaryItem
          icon={CalendarDays}
          label="Batch"
          value={group.batch}
        />

        <GroupSummaryItem
          icon={CalendarDays}
          label="Created on"
          value={formatDate(group.createdAt)}
        />

        <div className="border-t border-slate-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Group status
          </p>

          <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {String(group.status || "ACTIVE").toUpperCase()}
          </span>
        </div>
      </div>
    </aside>
  );
};

const GroupSummaryItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words font-semibold text-slate-900">
          {value || value === 0 ? value : "Not provided"}
        </p>
      </div>
    </div>
  );
};

const GroupMentorCard = ({ mentor }) => {
  if (!mentor) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
        <UserCheck size={34} className="mx-auto text-slate-400" />

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          No group mentor available
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Mentor details have not been included in the group response.
        </p>
      </section>
    );
  }

  const initials = getInitials(mentor.fullName);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
            {initials}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">
                {mentor.fullName}
              </h3>

              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                <Crown size={13} />
                Mentor
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {mentor.designation || "Staff Mentor"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {mentor.cdacId}
            </p>
          </div>
        </div>

        {mentor.email && (
          <a
            href={`mailto:${mentor.email}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Mail size={17} />
            Contact mentor
          </a>
        )}
      </div>
    </section>
  );
};

const GroupMembersSection = ({
  members,
  totalMembers,
  currentUserId,
  currentCdacId,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Group members
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {totalMembers} student
            {totalMembers === 1 ? "" : "s"} in this group
          </p>
        </div>

        <div className="relative w-full sm:w-72">
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
            placeholder="Search group members"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      {members.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <Search size={34} className="mx-auto text-slate-400" />

          <h4 className="mt-4 font-semibold text-slate-900">
            No matching members
          </h4>

          <p className="mt-2 text-sm text-slate-500">
            Try searching with a different name or CDAC ID.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {members.map((member) => {
            const isCurrentUser =
              (currentUserId &&
                String(member.id) === String(currentUserId)) ||
              (currentCdacId &&
                member.cdacId?.toUpperCase() ===
                  currentCdacId.toUpperCase());

            return (
              <GroupMemberCard
                key={member.id ?? member.cdacId}
                member={member}
                isCurrentUser={isCurrentUser}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

const GroupMemberCard = ({
  member,
  isCurrentUser,
}) => {
  const initials = getInitials(member.fullName);

  return (
    <article
      className={`rounded-2xl border p-5 transition hover:shadow-md ${
        isCurrentUser
          ? "border-indigo-300 bg-indigo-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${
            isCurrentUser
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate font-bold text-slate-900">
              {member.fullName}
            </h4>

            {isCurrentUser && (
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                You
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {member.cdacId || "CDAC ID unavailable"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        <MemberDetail
          icon={Mail}
          value={member.email}
        />

        <MemberDetail
          icon={BookOpenCheck}
          value={member.course}
        />
      </div>
    </article>
  );
};

const MemberDetail = ({ icon: Icon, value }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <Icon size={16} className="shrink-0 text-slate-400" />

      <span className="truncate">
        {value || "Not provided"}
      </span>
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

export default MyGroup;