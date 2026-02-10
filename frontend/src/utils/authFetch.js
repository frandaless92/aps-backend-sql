export async function authFetch(url, options = {}) {
  const token = sessionStorage.getItem("auth_token");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    sessionStorage.removeItem("auth_token");
    window.location.href = "/";
    throw new Error("No autorizado");
  }

  return res;
}
