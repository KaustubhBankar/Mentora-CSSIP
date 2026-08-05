import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getStoredUser,
  getToken,
  removeAuthData,
  saveAuthData,
} from "../utils/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAuthentication = () => {
      const storedToken = getToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        removeAuthData();
        setToken(null);
        setUser(null);
      }

      setIsAuthLoading(false);
    };

    initializeAuthentication();
  }, []);

  useEffect(() => {
  const handleUnauthorized = () => {
    removeAuthData();
    setToken(null);
    setUser(null);

    window.location.href = "/login";
  };

  window.addEventListener("mentora:unauthorized", handleUnauthorized);

  return () => {
    window.removeEventListener(
      "mentora:unauthorized",
      handleUnauthorized,
    );
  };
}, []);

  const login = useCallback(({ token: receivedToken, user: receivedUser }) => {
    if (!receivedToken || !receivedUser) {
      throw new Error("Invalid login data received.");
    }

    const normalizedUser = {
      ...receivedUser,
      role: receivedUser.role?.toUpperCase(),
    };

    saveAuthData({
      token: receivedToken,
      user: normalizedUser,
    });

    setToken(receivedToken);
    setUser(normalizedUser);
  }, []);

  const logout = useCallback(() => {
    removeAuthData();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return null;
      }

      const updatedUser = {
        ...currentUser,
        ...updatedUserData,
        role:
          updatedUserData.role?.toUpperCase() ??
          currentUser.role?.toUpperCase(),
      };

      const currentToken = getToken();

      if (currentToken) {
        saveAuthData({
          token: currentToken,
          user: updatedUser,
        });
      }

      return updatedUser;
    });
  }, []);

  const isAuthenticated = Boolean(token && user);

  const hasRole = useCallback(
    (...allowedRoles) => {
      if (!user?.role) {
        return false;
      }

      const normalizedRoles = allowedRoles
        .flat()
        .filter(Boolean)
        .map((role) => role.toUpperCase());

      return normalizedRoles.includes(user.role.toUpperCase());
    },
    [user],
  );

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isAuthLoading,
      login,
      logout,
      updateUser,
      hasRole,
    }),
    [
      user,
      token,
      isAuthenticated,
      isAuthLoading,
      login,
      logout,
      updateUser,
      hasRole,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};