import {
    Building2,
    CheckCircle2,
    ChevronRight,
    GraduationCap,
    LoaderCircle,
    RefreshCcw,
    Search,
    UserCheck,
    Users,
    UsersRound,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AlertMessage from "../../common/components/AlertMessage";
import EmptyState from "../../common/components/EmptyState";
import PageHeader from "../../common/components/dashboard/PageHeader";
import {
    allocateMentor,
    getAllUsers,
    getBranches,
} from "../../services/adminService";
import { getApiErrorMessage } from "../../utils/apiError";

const MentorAllocation = () => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [students, setStudents] = useState([]);
    const [branches, setBranches] = useState([]);

    const [selectedBranchId, setSelectedBranchId] = useState("");
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    const [studentSearch, setStudentSearch] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isAllocating, setIsAllocating] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [allocationResults, setAllocationResults] = useState([]);

    const loadAllocationData = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const [usersResponse, branchesResponse] = await Promise.all([
                getAllUsers(),
                getBranches(),
            ]);

            const users = normalizeUsers(usersResponse);
            const normalizedBranches = normalizeBranches(branchesResponse);

            setStaffMembers(
                users.filter(
                    (user) =>
                        user.role === "STAFF" &&
                        user.status === "APPROVED",
                ),
            );

            setStudents(
                users.filter(
                    (user) =>
                        user.role === "STUDENT" &&
                        user.status === "APPROVED",
                ),
            );

            setBranches(normalizedBranches);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load mentors, students, and branches.",
                ),
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllocationData();
    }, [loadAllocationData]);

    const filteredStaffMembers = useMemo(() => {
        if (!selectedBranchId) {
            return staffMembers;
        }

        return staffMembers.filter(
            (staff) =>
                !staff.branchId ||
                String(staff.branchId) === String(selectedBranchId),
        );
    }, [staffMembers, selectedBranchId]);

    const filteredStudents = useMemo(() => {
        const search = studentSearch.trim().toLowerCase();

        return students.filter((student) => {
            const matchesBranch =
                !selectedBranchId ||
                !student.branchId ||
                String(student.branchId) === String(selectedBranchId);

            const matchesSearch =
                !search ||
                [
                    student.fullName,
                    student.cdacId,
                    student.email,
                    student.specialization,
                ].some((value) =>
                    String(value ?? "").toLowerCase().includes(search),
                );

            return matchesBranch && matchesSearch;
        });
    }, [students, selectedBranchId, studentSearch]);

    const selectedStaff = staffMembers.find(
        (staff) => String(staff.id) === String(selectedStaffId),
    );

    const selectedBranch = branches.find(
        (branch) =>
            String(branch.id) === String(selectedBranchId),
    );

    const selectedStudents = students.filter((student) =>
        selectedStudentIds.includes(student.id),
    );

    const handleBranchChange = (event) => {
        const branchId = event.target.value;

        setSelectedBranchId(branchId);
        setSelectedStaffId("");
        setSelectedStudentIds([]);
        setStudentSearch("");
        setError("");
        setSuccessMessage("");
        setAllocationResults([]);
    };

    const handleStudentToggle = (studentId) => {
        setSelectedStudentIds((currentIds) =>
            currentIds.includes(studentId)
                ? currentIds.filter((id) => id !== studentId)
                : [...currentIds, studentId],
        );

        setError("");
        setSuccessMessage("");
    };

    const handleSelectAllVisible = () => {
        const visibleIds = filteredStudents.map(
            (student) => student.id,
        );

        const allVisibleSelected = visibleIds.every((id) =>
            selectedStudentIds.includes(id),
        );

        if (allVisibleSelected) {
            setSelectedStudentIds((currentIds) =>
                currentIds.filter((id) => !visibleIds.includes(id)),
            );
        } else {
            setSelectedStudentIds((currentIds) => [
                ...new Set([...currentIds, ...visibleIds]),
            ]);
        }
    };

    const validateAllocation = () => {
        if (!selectedBranchId) {
            return "Please select a branch.";
        }

        if (!selectedStaffId) {
            return "Please select a staff mentor.";
        }

        if (selectedStudentIds.length === 0) {
            return "Please select at least one student.";
        }

        return "";
    };

    const handleAllocate = async () => {
        const validationMessage = validateAllocation();

        if (validationMessage) {
            setError(validationMessage);
            return;
        }

        const confirmed = window.confirm(
            `Assign ${selectedStudentIds.length} student${selectedStudentIds.length === 1 ? "" : "s"
            } to ${selectedStaff?.fullName}?`,
        );

        if (!confirmed) {
            return;
        }

        setIsAllocating(true);
        setError("");
        setSuccessMessage("");
        setAllocationResults([]);

        try {
            const response = await allocateMentor({
                staffId: Number(selectedStaffId),
                studentIds: selectedStudentIds.map(Number),
                branchId: Number(selectedBranchId),
            });

            const results = normalizeAllocationResults(response);

            setAllocationResults(results);

            setSuccessMessage(
                `${results.length || selectedStudentIds.length} student${results.length === 1 ? "" : "s"
                } allocated successfully.`,
            );

            /*
             * The backend currently prevents duplicate allocation but does not
             * provide an endpoint to list all allocations. Remove successfully
             * allocated students from this page so they cannot be immediately
             * selected again during the current session.
             */
            setStudents((currentStudents) =>
                currentStudents.filter(
                    (student) =>
                        !selectedStudentIds.includes(student.id),
                ),
            );

            setSelectedStudentIds([]);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to complete mentor allocation.",
                ),
            );
        } finally {
            setIsAllocating(false);
        }
    };

    const resetSelection = () => {
        setSelectedBranchId("");
        setSelectedStaffId("");
        setSelectedStudentIds([]);
        setStudentSearch("");
        setError("");
        setSuccessMessage("");
        setAllocationResults([]);
    };

    if (isLoading) {
        return <AllocationSkeleton />;
    }

    return (
        <div>
            <PageHeader
                eyebrow="Administration"
                title="Mentor allocation"
                description="Select a branch, staff mentor, and one or more students to create mentor assignments."
                action={
                    <button
                        type="button"
                        onClick={loadAllocationData}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                        <RefreshCcw size={18} />
                        Refresh data
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

            <AllocationSteps
                hasBranch={Boolean(selectedBranchId)}
                hasStaff={Boolean(selectedStaffId)}
                hasStudents={selectedStudentIds.length > 0}
            />

            <div className="mt-7 grid gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <BranchSelection
                        branches={branches}
                        selectedBranchId={selectedBranchId}
                        onChange={handleBranchChange}
                    />

                    <StaffSelection
                        staffMembers={filteredStaffMembers}
                        selectedStaffId={selectedStaffId}
                        onChange={(event) => {
                            setSelectedStaffId(event.target.value);
                            setError("");
                            setSuccessMessage("");
                            setAllocationResults([]);
                        }}
                        disabled={!selectedBranchId}
                    />

                    <StudentSelection
                        students={filteredStudents}
                        selectedStudentIds={selectedStudentIds}
                        searchTerm={studentSearch}
                        onSearchChange={setStudentSearch}
                        onToggle={handleStudentToggle}
                        onSelectAll={handleSelectAllVisible}
                        disabled={!selectedBranchId || !selectedStaffId}
                    />
                </div>

                <AllocationSummary
                    branch={selectedBranch}
                    staff={selectedStaff}
                    students={selectedStudents}
                    isAllocating={isAllocating}
                    onAllocate={handleAllocate}
                    onReset={resetSelection}
                />
            </div>

            {allocationResults.length > 0 && (
                <AllocationResultTable results={allocationResults} />
            )}
        </div>
    );
};

const normalizeUsers = (response) => {
    const source = response?.data ?? response ?? {};

    const users = Array.isArray(source)
        ? source
        : source.users ?? source.content ?? [];

    return Array.isArray(users)
        ? users.map((user) => ({
            id: user.id ?? user.userId ?? null,
            cdacId: user.cdacId ?? user.cdac_id ?? "",
            fullName: user.fullName ?? user.name ?? "User",
            email: user.email ?? "",
            role: String(user.role ?? "").toUpperCase(),
            status: String(user.status ?? "").toUpperCase(),
            branchId: user.branchId ?? user.branch?.id ?? null,
            branchName:
                user.branchName ?? user.branch?.branchName ?? "",
            specialization: user.specialization ?? "",
            designation: user.designation ?? "",
            department: user.department ?? "",
        }))
        : [];
};

const normalizeBranches = (response) => {
    const source = response?.data ?? response ?? {};

    const branches = Array.isArray(source)
        ? source
        : source.branches ?? source.content ?? [];

    return Array.isArray(branches)
        ? branches.map((branch) => ({
            id: branch.id ?? branch.branchId ?? null,
            branchCode:
                branch.branchCode ?? branch.code ?? "",
            branchName:
                branch.branchName ?? branch.name ?? "Branch",
            batchYear:
                branch.batchYear ?? branch.year ?? "",
            center:
                branch.center ?? branch.location ?? "",
        }))
        : [];
};

const normalizeAllocationResults = (response) => {
    const source = response?.data ?? response ?? [];

    const results = Array.isArray(source)
        ? source
        : source.allocations ?? [];

    return results.map((allocation) => ({
        allocationId:
            allocation.allocationId ?? allocation.id ?? null,

        staffId: allocation.staffId ?? null,
        staffName:
            allocation.staffName ?? "Staff Mentor",

        studentId: allocation.studentId ?? null,
        studentName:
            allocation.studentName ?? "Student",

        branchId: allocation.branchId ?? null,
        branch:
            allocation.branch ??
            allocation.branchName ??
            "",

        allocatedOn:
            allocation.allocatedOn ??
            allocation.allocatedAt ??
            "",
    }));
};

const AllocationSteps = ({
    hasBranch,
    hasStaff,
    hasStudents,
}) => {
    const steps = [
        {
            label: "Select branch",
            complete: hasBranch,
        },
        {
            label: "Select mentor",
            complete: hasStaff,
        },
        {
            label: "Select students",
            complete: hasStudents,
        },
        {
            label: "Confirm allocation",
            complete: false,
        },
    ];

    return (
        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex min-w-[650px] items-center">
                {steps.map((step, index) => (
                    <div
                        key={step.label}
                        className="flex flex-1 items-center"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step.complete
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                            >
                                {step.complete ? (
                                    <CheckCircle2 size={20} />
                                ) : (
                                    index + 1
                                )}
                            </div>

                            <span
                                className={`text-sm font-semibold ${step.complete
                                        ? "text-emerald-700"
                                        : "text-slate-600"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <ChevronRight
                                size={20}
                                className="mx-4 shrink-0 text-slate-300"
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

const BranchSelection = ({
    branches,
    selectedBranchId,
    onChange,
}) => {
    return (
        <SelectionSection
            number="1"
            icon={Building2}
            title="Select branch"
            description="Choose the branch for this mentor allocation."
        >
            {branches.length === 0 ? (
                <EmptyState
                    icon={Building2}
                    title="No branches available"
                    description="Create a branch before allocating mentors."
                />
            ) : (
                <select
                    value={selectedBranchId}
                    onChange={onChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                    <option value="">Choose a branch</option>

                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.branchName}
                            {branch.branchCode
                                ? ` (${branch.branchCode})`
                                : ""}
                            {branch.batchYear
                                ? ` - ${branch.batchYear}`
                                : ""}
                        </option>
                    ))}
                </select>
            )}
        </SelectionSection>
    );
};

const StaffSelection = ({
    staffMembers,
    selectedStaffId,
    onChange,
    disabled,
}) => {
    return (
        <SelectionSection
            number="2"
            icon={UserCheck}
            title="Select staff mentor"
            description="Only approved staff accounts are available."
            disabled={disabled}
        >
            <select
                value={selectedStaffId}
                onChange={onChange}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
                <option value="">
                    {disabled
                        ? "Select a branch first"
                        : "Choose a staff mentor"}
                </option>

                {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                        {staff.fullName} — {staff.cdacId}
                        {staff.designation
                            ? ` — ${staff.designation}`
                            : ""}
                    </option>
                ))}
            </select>

            {!disabled && staffMembers.length === 0 && (
                <p className="mt-3 text-sm text-amber-700">
                    No approved staff members are available for this branch.
                </p>
            )}
        </SelectionSection>
    );
};

const StudentSelection = ({
    students,
    selectedStudentIds,
    searchTerm,
    onSearchChange,
    onToggle,
    onSelectAll,
    disabled,
}) => {
    const allSelected =
        students.length > 0 &&
        students.every((student) =>
            selectedStudentIds.includes(student.id),
        );

    return (
        <SelectionSection
            number="3"
            icon={GraduationCap}
            title="Select students"
            description="Choose one or more approved students for this mentor."
            disabled={disabled}
        >
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row">
                <div className="relative flex-1">
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
                        disabled={disabled}
                        placeholder="Search name, CDAC ID, email, specialization"
                        className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                    />
                </div>

                <button
                    type="button"
                    onClick={onSelectAll}
                    disabled={disabled || students.length === 0}
                    className="rounded-xl border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {allSelected
                        ? "Deselect visible"
                        : "Select all visible"}
                </button>
            </div>

            {disabled ? (
                <div className="rounded-xl bg-slate-100 px-5 py-10 text-center text-slate-500">
                    Select a branch and mentor first.
                </div>
            ) : students.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No students available"
                    description="There are no approved students matching this branch or search."
                />
            ) : (
                <div className="grid max-h-[500px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                    {students.map((student) => (
                        <StudentSelectionCard
                            key={student.id}
                            student={student}
                            selected={selectedStudentIds.includes(
                                student.id,
                            )}
                            onToggle={() => onToggle(student.id)}
                        />
                    ))}
                </div>
            )}
        </SelectionSection>
    );
};

const StudentSelectionCard = ({
    student,
    selected,
    onToggle,
}) => {
    const initials = getInitials(student.fullName);

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${selected
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
        >
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${selected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
            >
                {initials}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">
                            {student.fullName}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {student.cdacId}
                        </p>
                    </div>

                    <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${selected
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                    >
                        {selected && <CheckCircle2 size={16} />}
                    </div>
                </div>

                <p className="mt-3 truncate text-sm text-slate-500">
                    {student.email}
                </p>

                {student.specialization && (
                    <p className="mt-1 truncate text-sm text-slate-500">
                        {student.specialization}
                    </p>
                )}
            </div>
        </button>
    );
};

const SelectionSection = ({
    number,
    icon: Icon,
    title,
    description,
    disabled = false,
    children,
}) => {
    return (
        <section
            className={`rounded-2xl border bg-white p-6 shadow-sm ${disabled
                    ? "border-slate-200 opacity-75"
                    : "border-slate-200"
                }`}
        >
            <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-5">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Icon size={22} />

                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                        {number}
                    </span>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </section>
    );
};

const AllocationSummary = ({
    branch,
    staff,
    students,
    isAllocating,
    onAllocate,
    onReset,
}) => {
    const canAllocate =
        branch && staff && students.length > 0;

    return (
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-28">
            <div className="rounded-t-2xl bg-slate-950 p-6 text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500">
                    <UsersRound size={24} />
                </div>

                <h2 className="mt-5 text-2xl font-bold">
                    Allocation summary
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                    Review the selected details before creating the assignments.
                </p>
            </div>

            <div className="space-y-5 p-6">
                <SummaryBlock
                    label="Branch"
                    value={branch?.branchName}
                    secondary={
                        branch
                            ? `${branch.branchCode || ""}${branch.batchYear
                                ? ` · ${branch.batchYear}`
                                : ""
                            }`
                            : ""
                    }
                    icon={Building2}
                />

                <SummaryBlock
                    label="Staff mentor"
                    value={staff?.fullName}
                    secondary={staff?.cdacId}
                    icon={UserCheck}
                />

                <div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Selected students
                        </p>

                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                            {students.length}
                        </span>
                    </div>

                    {students.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                            No students selected.
                        </p>
                    ) : (
                        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                                        {getInitials(student.fullName)}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {student.fullName}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {student.cdacId}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onAllocate}
                    disabled={!canAllocate || isAllocating}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {isAllocating ? (
                        <LoaderCircle
                            size={19}
                            className="animate-spin"
                        />
                    ) : (
                        <UserCheck size={19} />
                    )}

                    {isAllocating
                        ? "Creating allocations..."
                        : "Confirm allocation"}
                </button>

                <button
                    type="button"
                    onClick={onReset}
                    disabled={isAllocating}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                    <X size={18} />
                    Reset selection
                </button>
            </div>
        </aside>
    );
};

const SummaryBlock = ({
    label,
    value,
    secondary,
    icon: Icon,
}) => {
    return (
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Icon size={18} />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </p>

                <p className="mt-1 truncate font-semibold text-slate-900">
                    {value || "Not selected"}
                </p>

                {secondary && (
                    <p className="mt-1 text-sm text-slate-500">
                        {secondary}
                    </p>
                )}
            </div>
        </div>
    );
};

const AllocationResultTable = ({ results }) => {
    return (
        <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50 px-6 py-5">
                <CheckCircle2
                    size={24}
                    className="text-emerald-600"
                />

                <div>
                    <h2 className="font-bold text-emerald-900">
                        Allocation completed
                    </h2>

                    <p className="text-sm text-emerald-700">
                        {results.length} assignment
                        {results.length === 1 ? "" : "s"} created.
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="px-5 py-4">Student</th>
                            <th className="px-5 py-4">Mentor</th>
                            <th className="px-5 py-4">Branch</th>
                            <th className="px-5 py-4">Allocated on</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {results.map((result) => (
                            <tr key={result.allocationId}>
                                <td className="px-5 py-4 font-semibold text-slate-900">
                                    {result.studentName}
                                </td>

                                <td className="px-5 py-4 text-slate-700">
                                    {result.staffName}
                                </td>

                                <td className="px-5 py-4 text-slate-700">
                                    {result.branch || "Not provided"}
                                </td>

                                <td className="px-5 py-4 text-slate-500">
                                    {formatDateTime(result.allocatedOn)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
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

const formatDateTime = (value) => {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const AllocationSkeleton = () => {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-24 rounded-2xl bg-slate-200" />

            <div className="grid gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <div className="h-44 rounded-2xl bg-slate-200" />
                    <div className="h-44 rounded-2xl bg-slate-200" />
                    <div className="h-96 rounded-2xl bg-slate-200" />
                </div>

                <div className="h-[500px] rounded-2xl bg-slate-200" />
            </div>
        </div>
    );
};

export default MentorAllocation;

