import {
    BookOpen,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Edit3,
    GraduationCap,
    IdCard,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    RotateCcw,
    Save,
    UserRound,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import AlertMessage from "../../common/components/AlertMessage";
import PageHeader from "../../common/components/dashboard/PageHeader";
import ProfileSkeleton from "../../common/components/dashboard/ProfileSkeleton";
import {
    getStudentProfile,
    updateStudentProfile,
} from "../../services/studentService";
import { getApiErrorMessage } from "../../utils/apiError";

const emptyProfile = {
    cdacId: "",
    fullName: "",
    email: "",
    phone: "",
    githubUrl: "",
    linkedinUrl: "",
    specialization: "",
    skills: "",
    bio: "",
    profileImage: "",
};

const StudentProfile = () => {
    const { user, updateUser } = useAuth();

    const [profile, setProfile] = useState(emptyProfile);
    const [formData, setFormData] = useState(emptyProfile);

    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [validationErrors, setValidationErrors] = useState({});
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadProfile = async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await getStudentProfile();

            const normalizedProfile = normalizeStudentProfile(response, user);

            setProfile(normalizedProfile);
            setFormData(normalizedProfile);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load your student profile.",
                ),
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));

        setValidationErrors((currentErrors) => ({
            ...currentErrors,
            [name]: "",
        }));

        setSuccessMessage("");
    };

    const handleEdit = () => {
        setFormData(profile);
        setValidationErrors({});
        setError("");
        setSuccessMessage("");
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData(profile);
        setValidationErrors({});
        setError("");
        setIsEditing(false);
    };

    const validateForm = () => {
        const errors = {};

        const fullName = formData.fullName.trim();
        const email = formData.email.trim();
        const phone = formData.phone.trim();

        if (!fullName) {
            errors.fullName = "Full name is required.";
        } else if (fullName.length < 3) {
            errors.fullName =
                "Full name must contain at least 3 characters.";
        }

        if (!email) {
            errors.email = "Email address is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Enter a valid email address.";
        }

        if (phone && !/^[6-9]\d{9}$/.test(phone)) {
            errors.phone =
                "Enter a valid 10-digit Indian mobile number.";
        }

        if (
            formData.skills &&
            formData.skills.trim().length > 500
        ) {
            errors.skills =
                "Skills must not exceed 500 characters.";
        }

        if (
            formData.address &&
            formData.address.trim().length > 500
        ) {
            errors.address =
                "Address must not exceed 500 characters.";
        }

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        setIsSaving(true);

        try {
            const requestData = {
                phone: formData.phone.trim(),
                githubUrl: formData.githubUrl.trim(),
                linkedinUrl: formData.linkedinUrl.trim(),
                specialization: formData.specialization.trim(),
                skills: formData.skills.trim(),
                bio: formData.bio.trim(),
                profileImage: formData.profileImage.trim(),
            };

            const response = await updateStudentProfile(requestData);

            const updatedProfile = normalizeStudentProfile(
                response,
                {
                    ...profile,
                    ...requestData,
                },
            );

            setProfile(updatedProfile);
            setFormData(updatedProfile);
            setIsEditing(false);

            updateUser({
                fullName: updatedProfile.fullName,
                email: updatedProfile.email,
            });

            setSuccessMessage(
                "Your profile has been updated successfully.",
            );
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to update your profile.",
                ),
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <div>
            <PageHeader
                eyebrow="Student Profile"
                title="My profile"
                description="View and maintain your academic, professional and contact information."
                action={
                    !isEditing && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            <Edit3 size={18} />
                            Edit profile
                        </button>
                    )
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

            <div className="grid gap-6 xl:grid-cols-3">
                <ProfileSummaryCard
                    profile={profile}
                    isEditing={isEditing}
                />

                <div className="space-y-6 xl:col-span-2">
                    {isEditing ? (
                        <ProfileEditForm
                            formData={formData}
                            validationErrors={validationErrors}
                            isSaving={isSaving}
                            onChange={handleChange}
                            onCancel={handleCancel}
                            onReset={() => setFormData(profile)}
                            onSubmit={handleSubmit}
                        />
                    ) : (
                        <>
                            <ContactInformation profile={profile} />
                            <AcademicInformation profile={profile} />
                            <ProfessionalInformation profile={profile} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const normalizeStudentProfile = (response, fallback = {}) => {
  const source = response?.data ?? response ?? {};

  return {
    cdacId:
      source.cdacId ??
      fallback.cdacId ??
      "",

    fullName:
      source.fullName ??
      fallback.fullName ??
      "",

    email:
      source.email ??
      fallback.email ??
      "",

    phone:
      source.phone ??
      fallback.phone ??
      "",

    githubUrl:
      source.githubUrl ??
      fallback.githubUrl ??
      "",

    linkedinUrl:
      source.linkedinUrl ??
      fallback.linkedinUrl ??
      "",

    specialization:
      source.specialization ??
      fallback.specialization ??
      "",

    skills:
      Array.isArray(source.skills)
        ? source.skills.join(", ")
        : source.skills ??
          fallback.skills ??
          "",

    bio:
      source.bio ??
      fallback.bio ??
      "",

    profileImage:
      source.profileImage ??
      fallback.profileImage ??
      "",
  };
};

const ProfileSummaryCard = ({ profile, isEditing }) => {
    const initials = profile.fullName
        ? profile.fullName
            .split(" ")
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
        : "ST";

    return (
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-100 text-3xl font-bold text-indigo-700">
                    {initials}
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                    {profile.fullName || "Student"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {profile.cdacId || "CDAC ID not available"}
                </p>

                <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    APPROVED
                </span>
            </div>

            <div className="mt-7 space-y-4 border-t border-slate-100 pt-6">
                <SummaryItem
                    icon={Mail}
                    label="Email"
                    value={profile.email}
                />

                <SummaryItem
                    icon={Phone}
                    label="Phone"
                    value={profile.phone}
                />

                <SummaryItem
                    icon={GraduationCap}
                    label="Course"
                    value={profile.course}
                />

                <SummaryItem
                    icon={Building2}
                    label="Branch"
                    value={profile.branch}
                />
            </div>

            {isEditing && (
                <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-700">
                    You are currently editing your profile. Save or cancel your
                    changes using the buttons in the form.
                </div>
            )}
        </aside>
    );
};

const SummaryItem = ({ icon: Icon, label, value }) => {
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

const ContactInformation = ({ profile }) => {
    return (
        <ProfileSection
            title="Contact information"
            description="Your personal contact and location details."
            icon={UserRound}
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <ReadOnlyField
                    label="Full name"
                    value={profile.fullName}
                    icon={UserRound}
                />

                <ReadOnlyField
                    label="Email address"
                    value={profile.email}
                    icon={Mail}
                />

                <ReadOnlyField
                    label="Mobile number"
                    value={profile.phone}
                    icon={Phone}
                />

                <ReadOnlyField
                    label="City"
                    value={profile.city}
                    icon={MapPin}
                />

                <div className="sm:col-span-2">
                    <ReadOnlyField
                        label="Address"
                        value={profile.address}
                        icon={MapPin}
                    />
                </div>
            </div>
        </ProfileSection>
    );
};

const AcademicInformation = ({ profile }) => {
    return (
        <ProfileSection
            title="Academic information"
            description="Course, batch and educational background."
            icon={GraduationCap}
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <ReadOnlyField
                    label="CDAC ID"
                    value={profile.cdacId}
                    icon={IdCard}
                />

                <ReadOnlyField
                    label="Course"
                    value={profile.course}
                    icon={BookOpen}
                />

                <ReadOnlyField
                    label="Batch"
                    value={profile.batch}
                    icon={CalendarDays}
                />

                <ReadOnlyField
                    label="Branch"
                    value={profile.branch}
                    icon={Building2}
                />

                <ReadOnlyField
                    label="Qualification"
                    value={profile.qualification}
                    icon={GraduationCap}
                />

                <ReadOnlyField
                    label="Specialization"
                    value={profile.specialization}
                    icon={BookOpen}
                />
            </div>
        </ProfileSection>
    );
};

const ProfessionalInformation = ({ profile }) => {
    return (
        <ProfileSection
            title="Skills and interests"
            description="Your technical skills and professional area of interest."
            icon={BriefcaseBusiness}
        >
            <ReadOnlyField
                label="Skills"
                value={profile.skills}
                icon={BriefcaseBusiness}
            />
        </ProfileSection>
    );
};

const ProfileSection = ({
    title,
    description,
    icon: Icon,
    children,
}) => {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Icon size={21} />
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        {title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="mt-6">{children}</div>
        </section>
    );
};

const ReadOnlyField = ({ label, value, icon: Icon }) => {
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

const ProfileEditForm = ({
    formData,
    validationErrors,
    isSaving,
    onChange,
    onCancel,
    onReset,
    onSubmit,
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className="space-y-6"
            noValidate
        >
            <ProfileSection
                title="Personal information"
                description="Update your name and contact details."
                icon={UserRound}
            >
                <div className="grid gap-5 sm:grid-cols-2">
                    <EditField
                        id="fullName"
                        name="fullName"
                        label="Full name"
                        value={formData.fullName}
                        onChange={onChange}
                        error={validationErrors.fullName}
                        icon={UserRound}
                        required
                    />

                    <EditField
                        id="email"
                        name="email"
                        label="Email address"
                        type="email"
                        value={formData.email}
                        onChange={onChange}
                        error={validationErrors.email}
                        icon={Mail}
                        required
                    />

                    <EditField
                        id="phone"
                        name="phone"
                        label="Mobile number"
                        value={formData.phone}
                        onChange={onChange}
                        error={validationErrors.phone}
                        icon={Phone}
                        placeholder="10-digit mobile number"
                    />

                    <EditField
                        id="city"
                        name="city"
                        label="City"
                        value={formData.city}
                        onChange={onChange}
                        error={validationErrors.city}
                        icon={MapPin}
                    />

                    <div className="sm:col-span-2">
                        <TextAreaField
                            id="address"
                            name="address"
                            label="Address"
                            value={formData.address}
                            onChange={onChange}
                            error={validationErrors.address}
                            placeholder="Enter your address"
                            rows={3}
                        />
                    </div>
                </div>
            </ProfileSection>

            <ProfileSection
                title="Academic information"
                description="Update your course and educational information."
                icon={GraduationCap}
            >
                <div className="grid gap-5 sm:grid-cols-2">
                    <EditField
                        id="course"
                        name="course"
                        label="Course"
                        value={formData.course}
                        onChange={onChange}
                        icon={BookOpen}
                        placeholder="Example: PG-DAC"
                    />

                    <EditField
                        id="batch"
                        name="batch"
                        label="Batch"
                        value={formData.batch}
                        onChange={onChange}
                        icon={CalendarDays}
                        placeholder="Example: March 2026"
                    />

                    <EditField
                        id="branch"
                        name="branch"
                        label="Branch"
                        value={formData.branch}
                        onChange={onChange}
                        icon={Building2}
                        placeholder="Example: CDAC Pune"
                    />

                    <EditField
                        id="qualification"
                        name="qualification"
                        label="Qualification"
                        value={formData.qualification}
                        onChange={onChange}
                        icon={GraduationCap}
                        placeholder="Example: B.E. Computer Engineering"
                    />

                    <div className="sm:col-span-2">
                        <EditField
                            id="specialization"
                            name="specialization"
                            label="Specialization or domain"
                            value={formData.specialization}
                            onChange={onChange}
                            icon={BookOpen}
                            placeholder="Example: Full Stack Development"
                        />
                    </div>
                </div>
            </ProfileSection>

            <ProfileSection
                title="Professional information"
                description="Add your technical skills and interests."
                icon={BriefcaseBusiness}
            >
                <TextAreaField
                    id="skills"
                    name="skills"
                    label="Skills"
                    value={formData.skills}
                    onChange={onChange}
                    error={validationErrors.skills}
                    placeholder="Example: Java, Spring Boot, React, MySQL"
                    rows={4}
                />
            </ProfileSection>

            <div className="flex flex-col-reverse justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
                <button
                    type="button"
                    onClick={onReset}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RotateCcw size={18} />
                    Reset changes
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <X size={18} />
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                >
                    {isSaving ? (
                        <LoaderCircle
                            size={18}
                            className="animate-spin"
                        />
                    ) : (
                        <Save size={18} />
                    )}

                    {isSaving ? "Saving..." : "Save profile"}
                </button>
            </div>
        </form>
    );
};

const EditField = ({
    id,
    name,
    label,
    type = "text",
    value,
    onChange,
    error,
    icon: Icon,
    placeholder = "",
    required = false,
}) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-slate-700"
            >
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <div className="relative">
                <Icon
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 ${error
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        }`}
                />
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

const TextAreaField = ({
  id,
  name,
  label,
  value = "",
  onChange,
  error,
  placeholder,
  rows = 4,
  maxLength = 500,
}) => {
  const safeValue = value ?? "";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <textarea
        id={id}
        name={name}
        value={safeValue}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        }`}
      />

      <div className="mt-2 flex justify-between gap-4">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <span />
        )}

        <span className="text-xs text-slate-400">
          {safeValue.length}/{maxLength}
        </span>
      </div>
    </div>
  );
};

export default StudentProfile;