import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoader from "../common/components/PageLoader";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  if (isAuthLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please log in to continue.",
        }}
      />
    );
  }

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    role.toUpperCase(),
  );

  const userRole = user?.role?.toUpperCase();

  const hasRequiredRole =
    normalizedAllowedRoles.length === 0 ||
    normalizedAllowedRoles.includes(userRole);

  if (!hasRequiredRole) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          attemptedPath: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;