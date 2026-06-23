const BASE_URL = import.meta.env.VITE_API_URL || "https://mip-student-dropout-ews.onrender.com";

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(path);
  const token = localStorage.getItem("ews_token");

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}

// Authentication
export async function loginApi(username: string, password: string) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  
  if (data.token) {
    localStorage.setItem("ews_token", data.token);
    localStorage.setItem("ews_role", data.role);
    localStorage.setItem("ews_user_name", data.name);
    localStorage.setItem("ews_username", data.username);
  }
  return data;
}

export function logoutApi() {
  localStorage.removeItem("ews_token");
  localStorage.removeItem("ews_role");
  localStorage.removeItem("ews_user_name");
  localStorage.removeItem("ews_username");
}

export function getAuthUser() {
  const token = localStorage.getItem("ews_token");
  if (!token) return null;
  return {
    token,
    role: localStorage.getItem("ews_role") || "teacher",
    name: localStorage.getItem("ews_user_name") || "User",
    username: localStorage.getItem("ews_username") || "user",
  };
}

// Student CRUD
export async function getStudents(q: string = "", risk: string = "all") {
  return apiRequest(`/students?q=${encodeURIComponent(q)}&risk=${encodeURIComponent(risk)}`);
}

export async function getStudentById(id: string) {
  return apiRequest(`/students/${id}`);
}

export async function addStudent(studentData: any) {
  return apiRequest("/students", {
    method: "POST",
    body: JSON.stringify(studentData),
  });
}

export async function deleteStudent(id: string) {
  return apiRequest(`/students/${id}`, {
    method: "DELETE",
  });
}

export async function updateStudent(id: string, studentData: any) {
  return apiRequest(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(studentData),
  });
}

// Analytics
export async function getAnalyticsData() {
  return apiRequest("/analytics");
}

// Interventions
export async function getInterventionsData() {
  return apiRequest("/interventions");
}

export async function addIntervention(interventionData: any) {
  return apiRequest("/interventions", {
    method: "POST",
    body: JSON.stringify(interventionData),
  });
}

export async function updateInterventionStatus(id: number, status: string, notes: string = "") {
  return apiRequest(`/interventions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  });
}

// AI Assistant
export async function askAssistantApi(message: string) {
  return apiRequest<{ response: string; data: any }>("/assistant", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
