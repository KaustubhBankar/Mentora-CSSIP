import api from "./api";

export const getStudentProfile = async () => {
  const response = await api.get("/api/student/profile");

  return response.data;
};

export const updateStudentProfile = async (profileData) => {
  const response = await api.put(
    "/api/student/profile",
    profileData,
  );

  return response.data;
};

export const getStudentMentor = async () => {
    const res = await api.get("/api/student/mentor");
    return res.data;
};

export const getStudentTasks = async () => {
    const res = await api.get("/api/student/tasks");
    return res.data;
};

export const getAnnouncements = async () => {
    const res = await api.get("/api/student/announcements");
    return res.data;
};