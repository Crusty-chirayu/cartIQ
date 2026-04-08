const BASE_URL = "http://localhost:5000/api";

/* ---------------- GET TOKEN ---------------- */

const getToken = () => {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).token : null;
};

/* ---------------- GENERIC REQUEST ---------------- */

const request = async (endpoint: string, options: any = {}) => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API Error");
  }

  return data;
};

/* ---------------- CART API ---------------- */

export const cartApi = {
  get: () => request("/cart"),   // ✅ NOW CORRECT
  add: (item: any) =>
    request("/cart", {
      method: "POST",
      body: JSON.stringify(item),
    }),
  remove: (id: string) =>
    request(`/cart/${id}`, {
      method: "DELETE",
    }),
};