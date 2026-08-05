import {
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  User,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiError";
import AuthLayout from "../components/AuthLayout";

const initialFormData = {
  role: "STUDENT",
  cdacId: "",
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [validationErrors, setValidationErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setValidationErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setServerError("");
  };

  const handleRoleChange = (role) => {
    setFormData((previousData) => ({
      ...previousData,
      role,
    }));

    setServerError("");
  };

  const validateForm = () => {
    const errors = {};

    const trimmedCdacId = formData.cdacId.trim();
    const trimmedFullName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();

    if (!formData.role) {
      errors.role = "Please select an account type.";
    }

    if (!trimmedCdacId) {
      errors.cdacId = "CDAC ID is required.";
    } else if (trimmedCdacId.length < 4) {
      errors.cdacId = "Please enter a valid CDAC ID.";
    }

    if (!trimmedFullName) {
      errors.fullName = "Full name is required.";
    } else if (trimmedFullName.length < 3) {
      errors.fullName = "Full name must contain at least 3 characters.";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedFullName)) {
      errors.fullName = "Full name contains invalid characters.";
    }

    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password = "Password must contain at least 8 characters.";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password =
        "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain at least one number.";
    } else if (!/[!@#$%^&*()_+\-=]/.test(formData.password)) {
      errors.password =
        "Password must contain at least one special character.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        cdacId: formData.cdacId.trim().toUpperCase(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };

      await registerUser(registrationData);

      setRegistrationSuccess(true);
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "Registration failed. Please verify your information and try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    const selectedRole = formData.role.toLowerCase();

    navigate(`/login/${selectedRole}`, {
      replace: true,
    });
  };

  if (registrationSuccess) {
    return (
      <AuthLayout
        title="Registration successful"
        subtitle="Your account has been created and is awaiting administrator approval."
        showBackButton={false}
      >
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Account created successfully
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            Your registration has been submitted. An administrator must approve
            your account before you can log in.
          </p>

          <div className="mt-5 rounded-xl bg-white p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">CDAC ID</span>
              <span className="font-semibold text-slate-900">
                {formData.cdacId.toUpperCase()}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4">
              <span className="text-slate-500">Account type</span>
              <span className="font-semibold text-slate-900">
                {formData.role}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4">
              <span className="text-slate-500">Status</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                PENDING
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoToLogin}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
        >
          Go to {formData.role.toLowerCase()} login
        </button>

        <Link
          to="/"
          className="mt-4 block text-center text-sm font-semibold text-slate-600 hover:text-indigo-600"
        >
          Return to home page
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register using your valid CDAC ID. Your account will require administrator approval."
      showBackButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {serverError}
          </div>
        )}

        {/* Account role */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Register as
          </label>

          <div className="grid grid-cols-2 gap-3">
            <RoleButton
              role="STUDENT"
              title="Student"
              description="Create a student account"
              icon={GraduationCap}
              selectedRole={formData.role}
              onClick={handleRoleChange}
            />

            <RoleButton
              role="STAFF"
              title="Staff"
              description="Create a staff account"
              icon={UsersRound}
              selectedRole={formData.role}
              onClick={handleRoleChange}
            />
          </div>

          {validationErrors.role && (
            <p className="mt-2 text-sm text-red-600">
              {validationErrors.role}
            </p>
          )}
        </div>

        {/* CDAC ID */}
        <FormField
          id="cdacId"
          name="cdacId"
          label="CDAC ID"
          type="text"
          placeholder={
            formData.role === "STUDENT"
              ? "Example: STUDENT001"
              : "Example: STAFF001"
          }
          value={formData.cdacId}
          onChange={handleChange}
          error={validationErrors.cdacId}
          icon={User}
          autoComplete="username"
        />

        {/* Full name */}
        <FormField
          id="fullName"
          name="fullName"
          label="Full name"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          error={validationErrors.fullName}
          icon={User}
          autoComplete="name"
        />

        {/* Email */}
        <FormField
          id="email"
          name="email"
          label="Email address"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleChange}
          error={validationErrors.email}
          icon={Mail}
          autoComplete="email"
        />

        {/* Password */}
        <PasswordField
          id="password"
          name="password"
          label="Password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          error={validationErrors.password}
          showPassword={showPassword}
          onTogglePassword={() =>
            setShowPassword((previousValue) => !previousValue)
          }
          autoComplete="new-password"
        />

        {/* Password strength information */}
        <PasswordRequirements password={formData.password} />

        {/* Confirm password */}
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          placeholder="Enter your password again"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={validationErrors.confirmPassword}
          showPassword={showConfirmPassword}
          onTogglePassword={() =>
            setShowConfirmPassword((previousValue) => !previousValue)
          }
          autoComplete="new-password"
        />

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          Only users with a valid, pre-issued CDAC ID can register. Login will
          be available after administrator approval.
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isLoading && <LoaderCircle size={20} className="animate-spin" />}

          {isLoading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to={`/login/${formData.role.toLowerCase()}`}
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Login here
          </Link>
        </p>

        <Link
          to="/"
          className="block text-center text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          Return to home page
        </Link>
      </form>
    </AuthLayout>
  );
};

const RoleButton = ({
  role,
  title,
  description,
  icon: Icon,
  selectedRole,
  onClick,
}) => {
  const isSelected = selectedRole === role;

  return (
    <button
      type="button"
      onClick={() => onClick(role)}
      className={`rounded-xl border p-4 text-left transition ${
        isSelected
          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
          : "border-slate-300 bg-white hover:border-indigo-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          isSelected
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon size={21} />
      </div>

      <p className="mt-3 font-semibold text-slate-900">{title}</p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </button>
  );
};

const FormField = ({
  id,
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  autoComplete,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          size={19}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          }`}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const PasswordField = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
  autoComplete,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={19}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          }`}
        />

        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const PasswordRequirements = ({ password }) => {
  const requirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "One special character",
      valid: /[!@#$%^&*()_+\-=]/.test(password),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
      {requirements.map((requirement) => (
        <div
          key={requirement.label}
          className={`flex items-center gap-2 text-xs ${
            requirement.valid ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <CheckCircle2 size={15} />

          <span>{requirement.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Register;