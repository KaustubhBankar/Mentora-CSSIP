import {
  Building2,
  RefreshCcw,
  ShieldCheck,
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
import {
  approveUser,
  getAllUsers,
  getBranches,
  rejectUser,
} from "../../services/adminService";
import { getApiErrorMessage } from "../../utils/apiError";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [usersResponse, branchesResponse] = await Promise.all([
        getAllUsers(),
        getBranches(),
      ]);

      setUsers(normalizeUsers(usersResponse));
      setBranches(normalizeBranches(branchesResponse));
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to load the administrator dashboard.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statistics = useMemo(() => {
    return {
      totalUsers: users.length,

      pendingUsers: users.filter(
        (currentUser) => currentUser.status === "PENDING",
      ).length,

      approvedUsers: users.filter(
        (currentUser) => currentUser.status === "APPROVED",
      ).length,

      totalBranches: branches.length,
    };
  }, [users, branches]);

  const pendingUsers = useMemo(() => {
    return users
      .filter((currentUser) => currentUser.status === "PENDING")
      .slice(0, 5);
  }, [users]);

  const handleUserAction = async (selectedUser, action) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedUser.fullName}?`,
    );

    if (!confirmed) {
      return;
    }

    setProcessingUserId(selectedUser.id);
    setError("");
    setSuccessMessage("");

    try {
      if (action === "approve") {
        await approveUser(selectedUser.id);
      } else {
        await rejectUser(selectedUser.id);
      }

      const updatedStatus =
        action === "approve" ? "APPROVED" : "REJECTED";

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === selectedUser.id
            ? {
                ...currentUser,
                status: updatedStatus,
              }
            : currentUser,
        ),
      );

      setSuccessMessage(
        `${selectedUser.fullName} was ${updatedStatus.toLowerCase()} successfully.`,
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          `Unable to ${action} this account.`,
        ),
      );
    } finally {
      setProcessingUserId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title={`Welcome, ${user?.fullName ?? "Administrator"}`}
        description="Review platform activity, user registrations, branches, and mentor allocations."
        action={
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              size={18}
              className={isLoading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        }
      />

      <div className="mb-6 space-y-3">
        <AlertMessage
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />

        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total users"
          value={isLoading ? "..." : statistics.totalUsers}
          description="Registered accounts"
          icon={Users}
          onClick={() => navigate("/admin/users")}
        />

        <StatCard
          title="Pending approvals"
          value={isLoading ? "..." : statistics.pendingUsers}
          description="Accounts awaiting review"
          icon={UserCheck}
          onClick={() => navigate("/admin/pending-users")}
        />

        <StatCard
          title="Approved users"
          value={isLoading ? "..." : statistics.approvedUsers}
          description="Active platform accounts"
          icon={ShieldCheck}
          onClick={() => navigate("/admin/users")}
        />

        <StatCard
          title="Branches"
          value={isLoading ? "..." : statistics.totalBranches}
          description="Available branches"
          icon={Building2}
          onClick={() => navigate("/admin/branches")}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pending registrations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review recently registered student and staff accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/pending-users")}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all pending users
            </button>
          </div>

          {isLoading ? (
            <PendingUsersSkeleton />
          ) : pendingUsers.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={UserCheck}
                title="No pending registrations"
                description="There are currently no accounts awaiting administrator approval."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingUsers.map((pendingUser) => (
                <PendingUserRow
                  key={pendingUser.id ?? pendingUser.cdacId}
                  user={pendingUser}
                  isProcessing={processingUserId === pendingUser.id}
                  onApprove={() =>
                    handleUserAction(pendingUser, "approve")
                  }
                  onReject={() =>
                    handleUserAction(pendingUser, "reject")
                  }
                />
              ))}
            </div>
          )}
        </article>

        <article className="h-fit rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
            Quick actions
          </p>

          <h2 className="mt-3 text-2xl font-bold">
            Manage the platform
          </h2>

          <p className="mt-3 leading-7 text-slate-300">
            Access the most important administrative operations from one place.
          </p>

          <div className="mt-6 space-y-3">
            <QuickAction
              label="Manage users"
              onClick={() => navigate("/admin/users")}
            />

            <QuickAction
              label="Manage branches"
              onClick={() => navigate("/admin/branches")}
            />

            <QuickAction
              label="Allocate mentors"
              onClick={() =>
                navigate("/admin/mentor-allocation")
              }
            />
          </div>
        </article>
      </section>
    </div>
  );
};

const normalizeUsers = (response) => {
  const source = response?.data ?? response ?? {};

  const users = Array.isArray(source)
    ? source
    : source.users ?? source.content ?? [];

  if (!Array.isArray(users)) {
    return [];
  }

  return users.map((currentUser) => ({
    id: currentUser.id ?? currentUser.userId ?? null,

    cdacId:
      currentUser.cdacId ??
      currentUser.cdac_id ??
      "",

    fullName:
      currentUser.fullName ??
      currentUser.name ??
      "User",

    email: currentUser.email ?? "",

    role: String(
      currentUser.role ?? "STUDENT",
    ).toUpperCase(),

    status: String(
      currentUser.status ?? "PENDING",
    ).toUpperCase(),
  }));
};

const normalizeBranches = (response) => {
  const source = response?.data ?? response ?? {};

  const branches = Array.isArray(source)
    ? source
    : source.branches ?? source.content ?? [];

  return Array.isArray(branches) ? branches : [];
};

const PendingUserRow = ({
  user,
  isProcessing,
  onApprove,
  onReject,
}) => {
  const initials = getInitials(user.fullName);

  return (
    <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
          {initials}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-slate-900">
              {user.fullName}
            </p>

            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
              {user.role}
            </span>
          </div>

          <p className="mt-1 truncate text-sm text-slate-500">
            {user.cdacId} · {user.email}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={isProcessing}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Approve"}
        </button>

        <button
          type="button"
          onClick={onReject}
          disabled={isProcessing}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

const QuickAction = ({ label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/15"
    >
      <span>{label}</span>
      <span>→</span>
    </button>
  );
};

const PendingUsersSkeleton = () => {
  return (
    <div className="animate-pulse space-y-3 p-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-20 rounded-xl bg-slate-200"
        />
      ))}
    </div>
  );
};

const getInitials = (fullName) => {
  if (!fullName) {
    return "U";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export default AdminDashboard;