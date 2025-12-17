// src/utils/api.js
export const API_BASE = "http://localhost:3000/api".replace(/\/$/, "");

export function apiUrl(path = "") {
  const cleaned = String(path || "").replace(/^\/+/, "");
  return cleaned ? `${API_BASE}/${cleaned}` : API_BASE;
}

export function getToken() {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.token;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  }
  return null;
}

export function getHeaders(contentType = "application/json") {
  const headers = {
    Accept: "application/json",
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      const text = await response.text();
      if (text) errorMessage = text;
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error en apiFetch:", error);
    throw error;
  }
}

// Métodos HTTP convenience
export const api = {
  get: (path, options = {}) => {
    const url = apiUrl(path);
    return apiFetch(url, {
      ...options,
      method: "GET",
      headers: getHeaders(),
    });
  },

  post: (path, data, options = {}) => {
    const url = apiUrl(path);
    return apiFetch(url, {
      ...options,
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  patch: (path, data, options = {}) => {
    const url = apiUrl(path);
    return apiFetch(url, {
      ...options,
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  delete: (path, options = {}) => {
    const url = apiUrl(path);
    return apiFetch(url, {
      ...options,
      method: "DELETE",
      headers: getHeaders(),
    });
  },
};