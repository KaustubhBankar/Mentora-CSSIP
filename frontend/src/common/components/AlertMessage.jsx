import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

const alertStyles = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },

  error: {
    container: "border-red-200 bg-red-50 text-red-800",
    icon: AlertCircle,
  },

  info: {
    container: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Info,
  },
};

const AlertMessage = ({
  type = "info",
  message,
  onClose,
}) => {
  if (!message) {
    return null;
  }

  const selectedStyle = alertStyles[type] ?? alertStyles.info;
  const Icon = selectedStyle.icon;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${selectedStyle.container}`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />

      <p className="flex-1 text-sm leading-6">{message}</p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close message"
          className="rounded-lg p-1 transition hover:bg-black/5"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;