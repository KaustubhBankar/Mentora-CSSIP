export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong. Please try again.",
) => {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "The request took too long. Please try again.";
    }

    return "Unable to connect to the server. Make sure the backend services and API Gateway are running.";
  }

  const responseData = error.response.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (responseData?.detail) {
    return responseData.detail;
  }

  if (
    responseData?.errors &&
    typeof responseData.errors === "object"
  ) {
    const validationMessages = Object.values(
      responseData.errors,
    ).filter(Boolean);

    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }
  }

  switch (error.response.status) {
    case 400:
      return "Invalid registration information. Please check all entered fields.";

    case 401:
      return "Authentication failed.";

    case 403:
      return "You are not authorized to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 409:
      return "An account with this CDAC ID or email already exists.";

    case 500:
      return "The server encountered an error. Please try again later.";

    case 503:
      return "A backend service is currently unavailable.";

    default:
      return fallbackMessage;
  }
};