import api from "./api";

export const getStaffTasks = async () =>
  (await api.get("/api/tasks/staff")).data;

export const getStudentTasks = async () =>
  (await api.get("/api/tasks/student")).data;

export const createTask = async ({ taskData, attachment }) => {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(taskData)], { type: "application/json" }),
  );
  if (attachment) formData.append("attachment", attachment);
  return (await api.post("/api/tasks", formData)).data;
};

export const updateTask = async (id, data) =>
  (await api.put(`/api/tasks/${id}`, data)).data;

export const deleteTask = async (id) => api.delete(`/api/tasks/${id}`);

export const submitTaskSolution = async ({ taskId, githubUrl, note, file }) => {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob(
      [JSON.stringify({ githubUrl: githubUrl?.trim() || null, note: note?.trim() || null })],
      { type: "application/json" },
    ),
  );
  if (file) formData.append("file", file);
  return (await api.post(`/api/tasks/${taskId}/submissions`, formData)).data;
};

export const getTaskSubmissions = async (taskId) =>
  (await api.get(`/api/tasks/${taskId}/submissions`)).data;

export const getStudentSubmissions = async () =>
  (await api.get("/api/tasks/student/submissions")).data;

export const reviewTaskSubmission = async ({ submissionId, status, feedback }) =>
  (await api.put(`/api/tasks/submissions/${submissionId}/review`, { status, feedback })).data;

const downloadBlob = (response, fallbackName) => {
  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const fileName = match?.[1] || fallbackName;
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const downloadTaskAttachment = async (taskId) => {
  const response = await api.get(`/api/tasks/${taskId}/attachment`, { responseType: "blob" });
  downloadBlob(response, `task-${taskId}-attachment`);
};

export const downloadSubmissionFile = async (submissionId) => {
  const response = await api.get(`/api/tasks/submissions/${submissionId}/file`, { responseType: "blob" });
  downloadBlob(response, `submission-${submissionId}`);
};
