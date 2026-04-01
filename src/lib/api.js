const jsonHeaders = {
  "Content-Type": "application/json"
};

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? jsonHeaders : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch (_error) {
      message = response.statusText || message;
    }

    throw new Error(message);
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
