import api from "./api";

export const getAllUsers = async () => {
  const response = await api.get("/api/admin/users");
  return response.data;
};

export const approveUser = async (userId) => {
  const response = await api.put(`/api/admin/users/${userId}/approve`);
  return response.data;
};

export const rejectUser = async (userId) => {
  const response = await api.put(`/api/admin/users/${userId}/reject`);
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await api.put(`/api/admin/users/${userId}/block`);
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await api.put(`/api/admin/users/${userId}/unblock`);
  return response.data;
};

export const getBranches = async () => {
  const response = await api.get("/api/admin/branches");
  return response.data;
};

export const createBranch = async (branchData) => {
  const response = await api.post("/api/admin/branches", branchData);
  return response.data;
};

export const updateBranch = async (branchId, branchData) => {
  const response = await api.put(
    `/api/admin/branches/${branchId}`,
    branchData,
  );

  return response.data;
};

export const updateBranchStatus = async (branchId, active) => {
  const response = await api.put(
    `/api/admin/branches/${branchId}/status`,
    { active },
  );

  return response.data;
  
};

export const allocateMentor = async (allocationData) => {
  const response = await api.post(
    "/api/mentor/allocate",
    allocationData,
  );

  return response.data;
};