const TOKEN_KEY = "mentora_token";
const USER_KEY = "mentora_user";

export const saveAuthData = ({ token, user }) => {
  if (!token || !user) {
    throw new Error("Token and user details are required.");
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    removeAuthData();
    return null;
  }
};

export const removeAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const hasStoredAuthentication = () => {
  const token = getToken();
  const user = getStoredUser();

  return Boolean(token && user);
};