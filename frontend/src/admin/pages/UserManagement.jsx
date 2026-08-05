import {
  Ban,
  CheckCircle2,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AlertMessage from "../../common/components/AlertMessage";
import EmptyState from "../../common/components/EmptyState";
import PageHeader from "../../common/components/dashboard/PageHeader";
import StatCard from "../../common/components/dashboard/StatCard";
import {
  approveUser,
  blockUser,
  getAllUsers,
  rejectUser,
  unblockUser,
} from "../../services/adminService";
import { getApiErrorMessage } from "../../utils/apiError";

const UserManagement = ({
  initialStatusFilter = "ALL",
}) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState(
    initialStatusFilter,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAllUsers();
      setUsers(normalizeUsers(response));
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to load registered users.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        [user.fullName, user.cdacId, user.email].some((value) =>
          String(value ?? "").toLowerCase().includes(search),
        );

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const statistics = useMemo(
    () => ({
      total: users.length,
      pending: users.filter((user) => user.status === "PENDING").length,
      approved: users.filter((user) => user.status === "APPROVED").length,
      blocked: users.filter((user) => user.status === "BLOCKED").length,
    }),
    [users],
  );

  const handleAction = async (user, action) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.fullName}?`,
    );

    if (!confirmed) {
      return;
    }

    setProcessingUserId(user.id);
    setError("");
    setSuccessMessage("");

    try {
      let response;

      switch (action) {
        case "approve":
          response = await approveUser(user.id);
          break;

        case "reject":
          response = await rejectUser(user.id);
          break;

        case "block":
          response = await blockUser(user.id);
          break;

        case "unblock":
          response = await unblockUser(user.id);
          break;

        default:
          return;
      }

      const updatedUser = normalizeUser(response?.data ?? response ?? {});

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                ...updatedUser,
                status:
                  updatedUser.status ||
                  getStatusAfterAction(action),
              }
            : currentUser,
        ),
      );

      setSuccessMessage(
        `${user.fullName} was ${getActionPastTense(action)} successfully.`,
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          `Unable to ${action} this user.`,
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
        title={
          initialStatusFilter === "PENDING"
            ? "Pending approvals"
            : "User management"
        }
        description={
          initialStatusFilter === "PENDING"
            ? "Review and approve or reject newly registered student and staff accounts."
            : "Review and manage all registered student and staff accounts."
        }
        action={
          <button
            type="button"
            onClick={loadUsers}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
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
          value={statistics.total}
          description="Registered accounts"
          icon={Users}
        />

        <StatCard
          title="Pending"
          value={statistics.pending}
          description="Awaiting approval"
          icon={UserCheck}
        />

        <StatCard
          title="Approved"
          value={statistics.approved}
          description="Active accounts"
          icon={ShieldCheck}
        />

        <StatCard
          title="Blocked"
          value={statistics.blocked}
          description="Restricted accounts"
          icon={Ban}
        />
      </section>

      <section className="my-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search name, CDAC ID or email"
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
        >
          <option value="ALL">All roles</option>
          <option value="STUDENT">Students</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admins</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </section>

      {isLoading ? (
        <UserTableSkeleton />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            initialStatusFilter === "PENDING"
              ? "No pending users"
              : "No users found"
          }
          description={
            initialStatusFilter === "PENDING"
              ? "There are currently no accounts waiting for administrator approval."
              : "No registered users match the selected filters."
          }
        />
      ) : (
        <UserTable
          users={filteredUsers}
          processingUserId={processingUserId}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

const normalizeUsers = (response) => {
  const source = response?.data ?? response ?? {};

  const users = Array.isArray(source)
    ? source
    : source.users ?? source.content ?? [];

  return Array.isArray(users) ? users.map(normalizeUser) : [];
};

const normalizeUser = (user) => ({
  id:
    user.id !== undefined && user.id !== null
      ? String(user.id)
      : user.userId !== undefined && user.userId !== null
        ? String(user.userId)
        : null,
  cdacId: user.cdacId ?? user.cdac_id ?? "",
  fullName: user.fullName ?? user.name ?? "User",
  email: user.email ?? "",
  role: String(user.role ?? "STUDENT").toUpperCase(),
  status: String(user.status ?? "PENDING").toUpperCase(),
});

const getStatusAfterAction = (action) => {
  const statuses = {
    approve: "APPROVED",
    reject: "REJECTED",
    block: "BLOCKED",
    unblock: "APPROVED",
  };

  return statuses[action];
};

const getActionPastTense = (action) => {
  const values = {
    approve: "approved",
    reject: "rejected",
    block: "blocked",
    unblock: "unblocked",
  };

  return values[action];
};

const UserTable = ({ users, processingUserId, onAction }) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id ?? user.cdacId}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">
                    {user.fullName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {user.cdacId} · {user.email}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                    {user.role}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <UserActions
                      user={user}
                      isProcessing={String(processingUserId) === String(user.id)}
                      onAction={onAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const UserActions = ({ user, isProcessing, onAction }) => {
  if (user.role === "ADMIN") {
    return (
      <span className="text-sm text-slate-400">
        Protected account
      </span>
    );
  }

  if (user.status === "PENDING") {
    return (
      <>
        <ActionButton
          label="Approve"
          disabled={isProcessing}
          onClick={() => onAction(user, "approve")}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        />

        <ActionButton
          label="Reject"
          disabled={isProcessing}
          onClick={() => onAction(user, "reject")}
          className="border border-red-200 text-red-600 hover:bg-red-50"
        />
      </>
    );
  }

  if (user.status === "BLOCKED") {
    return (
      <ActionButton
        label="Unblock"
        disabled={isProcessing}
        onClick={() => onAction(user, "unblock")}
        className="bg-indigo-600 text-white hover:bg-indigo-700"
      />
    );
  }

  if (user.status === "REJECTED") {
    return (
      <span className="text-sm font-medium text-slate-400">
        No actions available
      </span>
    );
  }

  return (
    <ActionButton
      label="Block"
      disabled={isProcessing}
      onClick={() => onAction(user, "block")}
      className="border border-red-200 text-red-600 hover:bg-red-50"
    />
  );
};

const ActionButton = ({
  label,
  onClick,
  disabled,
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {disabled ? "Processing..." : label}
  </button>
);

const statusStyles = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-slate-200 text-slate-700",
  BLOCKED: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-bold ${
      statusStyles[status] ?? "bg-slate-100 text-slate-700"
    }`}
  >
    {status}
  </span>
);

const UserTableSkeleton = () => (
  <div className="animate-pulse space-y-3 rounded-2xl bg-white p-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="h-16 rounded-xl bg-slate-200"
      />
    ))}
  </div>
);

export default UserManagement;