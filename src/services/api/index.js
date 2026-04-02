const jsonHeaders = {
  "Content-Type": "application/json"
};

function createApiError(message, status, code, rawMessage) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.rawMessage = rawMessage || message;
  return error;
}

function getErrorCodeFromStatus(status) {
  if (status === 400) {
    return "BAD_REQUEST";
  }

  if (status === 401) {
    return "AUTH_REQUIRED";
  }

  if (status === 403) {
    return "FORBIDDEN";
  }

  if (status === 404) {
    return "NOT_FOUND";
  }

  if (status === 408 || status === 504) {
    return "TIMEOUT";
  }

  if (status === 413) {
    return "FILE_TOO_LARGE";
  }

  if (status === 429) {
    return "RATE_LIMITED";
  }

  if (status >= 500) {
    return "SERVICE_UNAVAILABLE";
  }

  return "REQUEST_FAILED";
}

function getDefaultMessageForCode(code) {
  switch (code) {
    case "AUTH_REQUIRED":
      return "Please sign in and try again.";
    case "FORBIDDEN":
      return "You do not have permission to perform this action.";
    case "NOT_FOUND":
      return "The requested content could not be found.";
    case "TIMEOUT":
      return "The request took too long. Please try again.";
    case "FILE_TOO_LARGE":
      return "The selected file is too large.";
    case "RATE_LIMITED":
      return "Requests are too frequent. Please try again later.";
    case "SERVICE_UNAVAILABLE":
      return "The service is temporarily unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function normalizeHttpError(response, data, fallbackMessage) {
  const rawMessage = data?.message || response.statusText || fallbackMessage || "Request failed";
  const code = getErrorCodeFromStatus(response.status);
  const message = getDefaultMessageForCode(code);
  return createApiError(message, response.status, code, rawMessage);
}

export function getReadableErrorMessage(error, t) {
  switch (error?.code) {
    case "NETWORK_UNAVAILABLE":
      return t("error.network.body");
    case "TIMEOUT":
      return t("error.timeout.body");
    case "AUTH_REQUIRED":
      return t("error.auth.body");
    case "NOT_FOUND":
      return t("error.notFound.body");
    case "SERVICE_UNAVAILABLE":
      return t("error.service.body");
    case "FILE_TOO_LARGE":
      return t("error.upload.body");
    default:
      return t("error.generic.body");
  }
}

export function getErrorTone(error) {
  if (error?.code === "NETWORK_UNAVAILABLE" || error?.code === "TIMEOUT") {
    return "network";
  }

  if (error?.code === "AUTH_REQUIRED" || error?.code === "NOT_FOUND") {
    return "info";
  }

  return "error";
}

export function resolveAssetUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("blob:") || path.startsWith("data:") || /^https?:\/\//.test(path)) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? jsonHeaders : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    throw createApiError("Network unavailable", 0, "NETWORK_UNAVAILABLE", error.message);
  }

  if (!response.ok) {
    let data;

    try {
      data = await response.json();
    } catch (_error) {
      data = null;
    }

    throw normalizeHttpError(response, data, "Request failed");
  }

  return response.json();
}

export function fetchHome() {
  return apiRequest("/api/home");
}

export function fetchCategories() {
  return apiRequest("/api/catalog/categories");
}

export function fetchProducts(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiRequest(`/api/catalog/products${suffix}`);
}

export function fetchProductDetail(slug) {
  return apiRequest(`/api/catalog/products/${encodeURIComponent(slug)}`);
}

export function fetchAdminProducts(token) {
  return apiRequest("/api/catalog/admin/products", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function createProduct(payload, token) {
  return apiRequest("/api/catalog/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function updateAdminProduct(productId, payload, token) {
  return apiRequest(`/api/catalog/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function deleteAdminProduct(productId, token) {
  let response;

  try {
    response = await fetch(`/api/catalog/admin/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    throw createApiError("Network unavailable", 0, "NETWORK_UNAVAILABLE", error.message);
  }

  if (!response.ok) {
    let data;

    try {
      data = await response.json();
    } catch (_error) {
      data = null;
    }

    throw normalizeHttpError(response, data, "Delete failed");
  }
}

export async function uploadProductImage(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  let response;

  try {
    response = await fetch("/api/catalog/admin/uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
  } catch (error) {
    throw createApiError("Network unavailable", 0, "NETWORK_UNAVAILABLE", error.message);
  }

  if (!response.ok) {
    let data;

    try {
      data = await response.json();
    } catch (_error) {
      data = null;
    }

    throw normalizeHttpError(response, data, "Upload failed");
  }

  return response.json();
}

export function loginUser(payload) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function registerUser(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchCurrentUser(token) {
  return apiRequest("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function createOrder(payload, token) {
  return apiRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function fetchOrders(token) {
  return apiRequest("/api/orders", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function fetchOrderDetail(orderId, token) {
  return apiRequest(`/api/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
