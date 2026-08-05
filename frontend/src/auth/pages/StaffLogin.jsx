import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiError";
import { getDashboardPath } from "../../utils/roleRoutes";
import { useAuth } from "../AuthContext";
import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";

const StaffLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStaffLogin = async (loginData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser({
        cdacId: loginData.cdacId,
        password: loginData.password,
      });

      const responseRole = response.role?.toUpperCase();

      if (responseRole !== "STAFF") {
        setError(
          `This account belongs to the ${responseRole} role. Please use the correct login page.`,
        );

        return;
      }

      const authenticatedUser = {
        userId: response.userId,
        cdacId: response.cdacId,
        fullName: response.fullName,
        email: response.email,
        role: responseRole,
      };

      login({
        token: response.token,
        user: authenticatedUser,
      });

      navigate(getDashboardPath(responseRole), {
        replace: true,
      });
    } catch (loginError) {
      setError(
        getApiErrorMessage(
          loginError,
          "Staff login failed. Please check your credentials.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Staff Login"
      subtitle="Enter your credentials to manage your profile and assigned students."
    >
      <LoginForm
        role="STAFF"
        onSubmit={handleStaffLogin}
        isLoading={isLoading}
        error={error}
      />
    </AuthLayout>
  );
};

export default StaffLogin;