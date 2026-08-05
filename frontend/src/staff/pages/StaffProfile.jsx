import {
  BriefcaseBusiness,
  Building2,
  Edit3,
  GraduationCap,
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
  getStaffProfile,
  updateStaffProfile,
} from "../../services/staffService";
import { getApiErrorMessage } from "../../utils/apiError";

const emptyProfile = {
  cdacId: "",
  fullName: "",
  email: "",
  phone: "",
  designation: "",
  department: "",
  qualification: "",
  specialization: "",
  experience: "",
  officeLocation: "",
  bio: "",
};

const StaffProfile = () => {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(emptyProfile);
  const [formData, setFormData] = useState(emptyProfile);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getStaffProfile();
        const normalizedProfile = normalizeStaffProfile(response, user);

        setProfile(normalizedProfile);
        setFormData(normalizedProfile);
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to load your staff profile.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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

    setSuccessMessage("");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (
      formData.phone.trim() &&
      !/^[6-9]\d{9}$/.test(formData.phone.trim())
    ) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }

    if (
      formData.experience &&
      Number(formData.experience) < 0
    ) {
      errors.experience = "Experience cannot be negative.";
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
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        qualification: formData.qualification.trim(),
        specialization: formData.specialization.trim(),
        experience: formData.experience
          ? Number(formData.experience)
          : null,
        officeLocation: formData.officeLocation.trim(),
        bio: formData.bio.trim(),
      };

      const response = await updateStaffProfile(requestData);

      const updatedProfile = normalizeStaffProfile(response, {
        ...user,
        ...requestData,
      });

      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);

      updateUser({
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
      });

      setSuccessMessage("Staff profile updated successfully.");
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to update your staff profile.",
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
        eyebrow="Staff Profile"
        title="My profile"
        description="Manage your professional, academic, and contact information."
        action={
          !isEditing && (
            <button
              type="button"
              onClick={() => {
                setFormData(profile);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
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
        <StaffSummary profile={profile} />

        <div className="xl:col-span-2">
          {isEditing ? (
            <StaffProfileForm
              formData={formData}
              validationErrors={validationErrors}
              isSaving={isSaving}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onReset={() => setFormData(profile)}
              onCancel={() => {
                setFormData(profile);
                setValidationErrors({});
                setIsEditing(false);
              }}
            />
          ) : (
            <StaffDetails profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
};

const normalizeStaffProfile = (response, fallbackUser) => {
  const source = response?.data ?? response ?? {};

  return {
    cdacId:
      source.cdacId ??
      source.cdac_id ??
      fallbackUser?.cdacId ??
      "",

    fullName:
      source.fullName ??
      source.name ??
      fallbackUser?.fullName ??
      "",

    email:
      source.email ??
      fallbackUser?.email ??
      "",

    phone:
      source.phone ??
      source.mobile ??
      source.mobileNumber ??
      "",

    designation:
      source.designation ??
      source.position ??
      "",

    department:
      source.department ??
      source.branch ??
      source.branchName ??
      "",

    qualification:
      source.qualification ?? "",

    specialization:
      source.specialization ??
      source.domain ??
      source.expertise ??
      "",

    experience:
      source.experience ??
      source.yearsOfExperience ??
      "",

    officeLocation:
      source.officeLocation ??
      source.location ??
      "",

    bio:
      source.bio ??
      source.about ??
      "",
  };
};

const StaffSummary = ({ profile }) => {
  const initials = getInitials(profile.fullName);

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-100 text-3xl font-bold text-indigo-700">
          {initials}
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          {profile.fullName || "Staff Member"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {profile.designation || "Staff Mentor"}
        </p>

        <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          APPROVED
        </span>
      </div>

      <div className="mt-7 space-y-4 border-t border-slate-100 pt-6">
        <SummaryItem icon={Mail} label="Email" value={profile.email} />
        <SummaryItem icon={Phone} label="Phone" value={profile.phone} />
        <SummaryItem
          icon={Building2}
          label="Department"
          value={profile.department}
        />
        <SummaryItem
          icon={MapPin}
          label="Office"
          value={profile.officeLocation}
        />
      </div>
    </aside>
  );
};

const SummaryItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
      <Icon size={17} />
    </div>

    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

const StaffDetails = ({ profile }) => (
  <div className="space-y-6">
    <DetailSection title="Professional information" icon={BriefcaseBusiness}>
      <DetailGrid>
        <DetailItem label="Designation" value={profile.designation} />
        <DetailItem label="Department" value={profile.department} />
        <DetailItem
          label="Experience"
          value={
            profile.experience
              ? `${profile.experience} years`
              : ""
          }
        />
        <DetailItem
          label="Office location"
          value={profile.officeLocation}
        />
      </DetailGrid>
    </DetailSection>

    <DetailSection title="Academic information" icon={GraduationCap}>
      <DetailGrid>
        <DetailItem label="Qualification" value={profile.qualification} />
        <DetailItem
          label="Specialization"
          value={profile.specialization}
        />
      </DetailGrid>
    </DetailSection>

    <DetailSection title="About" icon={UserRound}>
      <p className="leading-7 text-slate-700">
        {profile.bio || "No professional biography provided."}
      </p>
    </DetailSection>
  </div>
);

const DetailSection = ({ title, icon: Icon, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
        <Icon size={21} />
      </div>

      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    </div>

    <div className="mt-6">{children}</div>
  </section>
);

const DetailGrid = ({ children }) => (
  <div className="grid gap-5 sm:grid-cols-2">{children}</div>
);

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
      {label}
    </p>

    <p className="mt-2 font-semibold text-slate-900">
      {value || "Not provided"}
    </p>
  </div>
);

const StaffProfileForm = ({
  formData,
  validationErrors,
  isSaving,
  onChange,
  onSubmit,
  onReset,
  onCancel,
}) => (
  <form onSubmit={onSubmit} className="space-y-6" noValidate>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Full name"
          name="fullName"
          value={formData.fullName}
          onChange={onChange}
          error={validationErrors.fullName}
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          error={validationErrors.email}
        />

        <FormField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          error={validationErrors.phone}
        />

        <FormField
          label="Designation"
          name="designation"
          value={formData.designation}
          onChange={onChange}
        />

        <FormField
          label="Department"
          name="department"
          value={formData.department}
          onChange={onChange}
        />

        <FormField
          label="Qualification"
          name="qualification"
          value={formData.qualification}
          onChange={onChange}
        />

        <FormField
          label="Specialization"
          name="specialization"
          value={formData.specialization}
          onChange={onChange}
        />

        <FormField
          label="Experience in years"
          name="experience"
          type="number"
          value={formData.experience}
          onChange={onChange}
          error={validationErrors.experience}
        />

        <div className="sm:col-span-2">
          <FormField
            label="Office location"
            name="officeLocation"
            value={formData.officeLocation}
            onChange={onChange}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Professional bio
          </label>

          <textarea
            name="bio"
            rows="5"
            value={formData.bio}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>
    </section>

    <div className="flex flex-col-reverse justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
      <button
        type="button"
        onClick={onReset}
        disabled={isSaving}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
      >
        <RotateCcw size={18} />
        Reset
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600"
      >
        <X size={18} />
        Cancel
      </button>

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:bg-indigo-400"
      >
        {isSaving ? (
          <LoaderCircle size={18} className="animate-spin" />
        ) : (
          <Save size={18} />
        )}

        {isSaving ? "Saving..." : "Save profile"}
      </button>
    </div>
  </form>
);

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
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

const getInitials = (fullName) =>
  fullName
    ? fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("")
    : "SM";

export default StaffProfile;