export const getDashboardPath = (role) => {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "/admin/dashboard";

    case "STAFF":
      return "/staff/dashboard";

    case "STUDENT":
      return "/student/dashboard";

    default:
      return "/";
  }
};