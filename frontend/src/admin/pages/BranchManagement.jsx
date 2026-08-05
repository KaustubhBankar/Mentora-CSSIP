import {
    Building2,
    CheckCircle2,
    Edit3,
    LoaderCircle,
    MapPin,
    Plus,
    RefreshCcw,
    Search,
    ToggleLeft,
    ToggleRight,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AlertMessage from "../../common/components/AlertMessage";
import EmptyState from "../../common/components/EmptyState";
import PageHeader from "../../common/components/dashboard/PageHeader";
import {
    createBranch,
    getBranches,
    updateBranch,
    updateBranchStatus,
} from "../../services/adminService";
import { getApiErrorMessage } from "../../utils/apiError";

const createEmptyForm = () => ({
    branchName: "",
    branchCode: "",
    batchYear: new Date().getFullYear(),
    center: "",
});

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [processingBranchId, setProcessingBranchId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState(createEmptyForm);
    const [validationErrors, setValidationErrors] = useState({});

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadBranches = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await getBranches();
            setBranches(normalizeBranches(response));
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load branches.",
                ),
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    const filteredBranches = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return branches;
        }

        return branches.filter((branch) =>
            [
                branch.branchName,
                branch.branchCode,
                branch.center,
                branch.batchYear,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(search),
            ),
        );
    }, [branches, searchTerm]);

    const resetModalState = () => {
        setIsModalOpen(false);
        setEditingBranch(null);
        setFormData(createEmptyForm());
        setValidationErrors({});
    };

    const openCreateModal = () => {
        setEditingBranch(null);
        setFormData(createEmptyForm());
        setValidationErrors({});
        setError("");
        setIsModalOpen(true);
    };

    const openEditModal = (branch) => {
        setEditingBranch(branch);

        setFormData({
            branchName: branch.branchName ?? "",
            branchCode: branch.branchCode ?? "",
            batchYear: branch.batchYear ?? new Date().getFullYear(),
            center: branch.center ?? "",
        });

        setValidationErrors({});
        setError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (isSaving) {
            return;
        }

        resetModalState();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        setValidationErrors((current) => ({
            ...current,
            [name]: "",
        }));
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.branchName.trim()) {
            errors.branchName = "Branch name is required.";
        }

        if (!formData.branchCode.trim()) {
            errors.branchCode = "Branch code is required.";
        }

        if (!formData.center.trim()) {
            errors.center = "Center is required.";
        }

        const batchYear = Number(formData.batchYear);

        if (!formData.batchYear) {
            errors.batchYear = "Batch year is required.";
        } else if (!Number.isInteger(batchYear) || batchYear < 2000 || batchYear > 2100) {
            errors.batchYear = "Enter a valid batch year.";
        }

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        try {
            const requestData = {
                branchCode: formData.branchCode.trim().toUpperCase(),
                branchName: formData.branchName.trim(),
                batchYear: Number(formData.batchYear),
                center: formData.center.trim(),
            };

            if (editingBranch) {
                const response = await updateBranch(
                    editingBranch.id,
                    requestData,
                );

                const updatedBranch = normalizeBranch(
                    response?.data ?? response ?? {
                        ...editingBranch,
                        ...requestData,
                    },
                );

                setBranches((current) =>
                    current.map((branch) =>
                        branch.id === editingBranch.id
                            ? {
                                ...branch,
                                ...updatedBranch,
                            }
                            : branch,
                    ),
                );

                setSuccessMessage("Branch updated successfully.");
            } else {
                const response = await createBranch(requestData);

                const createdBranch = normalizeBranch(
                    response?.data ?? response ?? requestData,
                );

                setBranches((current) => [createdBranch, ...current]);

                setSuccessMessage("Branch created successfully.");
            }

            resetModalState();
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    editingBranch
                        ? "Unable to update the branch."
                        : "Unable to create the branch.",
                ),
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (branch) => {
        const nextStatus = !branch.active;

        setProcessingBranchId(branch.id);
        setError("");
        setSuccessMessage("");

        try {
            const response = await updateBranchStatus(
                branch.id,
                nextStatus,
            );

            const updatedBranch = normalizeBranch(
                response?.data ?? response ?? {
                    ...branch,
                    active: nextStatus,
                },
            );

            setBranches((current) =>
                current.map((item) =>
                    item.id === branch.id
                        ? {
                            ...item,
                            ...updatedBranch,
                            active: updatedBranch.active,
                        }
                        : item,
                ),
            );

            setSuccessMessage(
                `${branch.branchName} was ${
                    nextStatus ? "activated" : "deactivated"
                } successfully.`,
            );
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to change branch status.",
                ),
            );
        } finally {
            setProcessingBranchId(null);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Administration"
                title="Branch management"
                description="Create and maintain the CDAC branches available across the platform."
                action={
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                    >
                        <Plus size={18} />
                        Add branch
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

            <section className="mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                <div className="relative w-full sm:max-w-md">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search branch name, code, center, or year"
                        className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                </div>

                <button
                    type="button"
                    onClick={loadBranches}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                >
                    <RefreshCcw
                        size={18}
                        className={isLoading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </section>

            {isLoading ? (
                <BranchSkeleton />
            ) : filteredBranches.length === 0 ? (
                <EmptyState
                    icon={Building2}
                    title="No branches found"
                    description="Create your first branch or change the current search term."
                    action={
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                        >
                            <Plus size={18} />
                            Create branch
                        </button>
                    }
                />
            ) : (
                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredBranches.map((branch) => (
                        <BranchCard
                            key={branch.id ?? branch.branchCode}
                            branch={branch}
                            isProcessing={processingBranchId === branch.id}
                            onEdit={() => openEditModal(branch)}
                            onStatusChange={() => handleStatusChange(branch)}
                        />
                    ))}
                </section>
            )}

            {isModalOpen && (
                <BranchFormModal
                    formData={formData}
                    validationErrors={validationErrors}
                    isSaving={isSaving}
                    isEditing={Boolean(editingBranch)}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

const normalizeBranches = (response) => {
    const source = response?.data ?? response ?? {};

    const branches = Array.isArray(source)
        ? source
        : source.branches ?? source.content ?? [];

    return Array.isArray(branches)
        ? branches.map(normalizeBranch)
        : [];
};

const normalizeBranch = (branch) => {
  const activeValue =
    branch.active ??
    branch.enabled ??
    (branch.status
      ? String(branch.status).toUpperCase() === "ACTIVE"
      : true);

  return {
    id: branch.id ?? branch.branchId ?? null,
    branchCode: branch.branchCode ?? branch.code ?? "",
    branchName: branch.branchName ?? branch.name ?? "Branch",
    batchYear: branch.batchYear ?? null,
    center: branch.center ?? branch.location ?? "",
    active: Boolean(activeValue),
  };
};

const BranchCard = ({
    branch,
    isProcessing,
    onEdit,
    onStatusChange,
}) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Building2 size={23} />
            </div>

            <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                    branch.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                }`}
            >
                {branch.active ? "ACTIVE" : "INACTIVE"}
            </span>
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-900">
            {branch.branchName}
        </h3>

        <p className="mt-1 text-sm font-semibold text-indigo-600">
            {branch.branchCode || "No code"}
        </p>

        <div className="mt-5 flex items-start gap-2 text-sm text-slate-600">
            <MapPin size={17} className="mt-0.5 shrink-0 text-slate-400" />
            <span>{branch.center || "Center not provided"}</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-500">
            Batch year: {branch.batchYear || "Not provided"}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
            <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
                <Edit3 size={17} />
                Edit
            </button>

            <button
                type="button"
                onClick={onStatusChange}
                disabled={isProcessing}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                    branch.active
                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
            >
                {branch.active ? (
                    <ToggleLeft size={18} />
                ) : (
                    <ToggleRight size={18} />
                )}

                {isProcessing
                    ? "Updating..."
                    : branch.active
                        ? "Deactivate"
                        : "Activate"}
            </button>
        </div>
    </article>
);

const BranchFormModal = ({
    formData,
    validationErrors,
    isSaving,
    isEditing,
    onChange,
    onSubmit,
    onClose,
}) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <button
            type="button"
            aria-label="Close branch form"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        <form
            onSubmit={onSubmit}
            className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            noValidate
        >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                        Branch details
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        {isEditing ? "Edit branch" : "Create branch"}
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                >
                    <X size={22} />
                </button>
            </div>

            <div className="space-y-5 p-6">
                <FormField
                    label="Branch name"
                    name="branchName"
                    value={formData.branchName}
                    onChange={onChange}
                    error={validationErrors.branchName}
                    placeholder="Example: PG-DAC"
                />

                <FormField
                    label="Branch code"
                    name="branchCode"
                    value={formData.branchCode}
                    onChange={onChange}
                    error={validationErrors.branchCode}
                    placeholder="Example: PGDAC"
                />

                <FormField
                    label="Batch year"
                    name="batchYear"
                    type="number"
                    value={formData.batchYear}
                    onChange={onChange}
                    error={validationErrors.batchYear}
                    placeholder="Example: 2026"
                />

                <FormField
                    label="Center"
                    name="center"
                    value={formData.center}
                    onChange={onChange}
                    error={validationErrors.center}
                    placeholder="Example: CDAC Pune"
                />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {isSaving ? (
                        <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                        <CheckCircle2 size={18} />
                    )}

                    {isSaving
                        ? "Saving..."
                        : isEditing
                            ? "Save changes"
                            : "Create branch"}
                </button>
            </div>
        </form>
    </div>
);

const FormField = ({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
    type = "text",
}) => (
    <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
            {label}
        </label>

        <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${
                error
                    ? "border-red-400 focus:ring-4 focus:ring-red-100"
                    : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            }`}
        />

        {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
    </div>
);

const BranchSkeleton = () => (
    <div className="grid animate-pulse gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <div
                key={index}
                className="h-72 rounded-2xl bg-slate-200"
            />
        ))}
    </div>
);

export default BranchManagement;