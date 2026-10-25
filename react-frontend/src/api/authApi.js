import apiClient from "./apiClient";

export async function registerStudent(studentData) {
  const response = await apiClient.post("/auth/register", studentData);
  return response.data;
}

export async function loginStudent(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
}

export async function loginAdmin(credentials) {
  const response = await apiClient.post("/auth/admin/login", credentials);
  return response.data;
}