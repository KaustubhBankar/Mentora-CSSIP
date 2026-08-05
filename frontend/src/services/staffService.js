import api from "./api";

export const getStaffProfile = async () => {
  const response = await api.get("/api/staff/profile");
  return response.data;
};

export const updateStaffProfile = async (profileData) => {
  const response = await api.put("/api/staff/profile", profileData);
  return response.data;
};