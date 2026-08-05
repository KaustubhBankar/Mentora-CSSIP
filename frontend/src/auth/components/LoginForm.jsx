import { Eye, EyeOff, LoaderCircle, LockKeyhole, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const LoginForm = ({ role, onSubmit, isLoading = false, error = "" }) => {
  const [formData, setFormData] = useState({
    cdacId: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }));

    setValidationErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.cdacId.trim()) {
      errors.cdacId = "CDAC ID is required.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must contain at least 6 characters.";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    onSubmit({
      cdacId: formData.cdacId.trim(),
      password: formData.password,
      expectedRole: role,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="cdacId"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          CDAC ID
        </label>

        <div className="relative">
          <User
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="cdacId"
            name="cdacId"
            type="text"
            value={formData.cdacId}
            onChange={handleChange}
            placeholder="Enter your CDAC ID"
            autoComplete="username"
            className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 ${
              validationErrors.cdacId
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            }`}
          />
        </div>

        {validationErrors.cdacId && (
          <p className="mt-2 text-sm text-red-600">
            {validationErrors.cdacId}
          </p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </label>

          <button
            type="button"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Forgot password?
          </button>
        </div>

        <div className="relative">
          <LockKeyhole
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 ${
              validationErrors.password
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            }`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((previousValue) => !previousValue)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {validationErrors.password && (
          <p className="mt-2 text-sm text-red-600">
            {validationErrors.password}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
        />

        <label htmlFor="rememberMe" className="text-sm text-slate-600">
          Remember me on this device
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {isLoading && <LoaderCircle size={20} className="animate-spin" />}

        {isLoading ? "Signing in..." : `Login as ${role}`}
      </button>

      {role !== "ADMIN" && (
        <p className="text-center text-sm text-slate-600">
          Do not have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Register here
          </Link>
        </p>
      )}
    </form>
  );
};

export default LoginForm;