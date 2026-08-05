import api from "./api";

export const getMyMentor = async () => {
  const response = await api.get("/api/mentor/my-mentor");

  return response.data;
};

export const getMyGroup = async () => {
    const response = await api.get("/api/mentor/my-group");

    return response.data;
}

export const getMyStudents = async () => {
  const response = await api.get("/api/mentor/my-students");

  return response.data;
};