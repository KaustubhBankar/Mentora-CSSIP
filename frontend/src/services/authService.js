import api from "./api";

export const loginUser = async ({ cdacId, password }) => {
  const response = await api.post("/api/auth/login", {
    cdacId,
    password,
  });

  return response.data;
};

export const registerUser = async (registrationData) => {
  const response = await api.post("/api/auth/register", registrationData);

  return response.data;
};