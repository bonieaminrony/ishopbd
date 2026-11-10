import { auth } from "../lib/firebase";

/**
 * Builds admin authentication headers (Firebase ID token + optional X-Admin-Token)
 * for protected `/api/admin/*` and `/api/courier/*` endpoints.
 */
export async function getAdminAuthHeaders(includeContentType = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  try {
    if (typeof (auth as any)?.authStateReady === "function") {
      await (auth as any).authStateReady();
    }
    const token = await auth?.currentUser?.getIdToken?.();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {}
  try {
    const adminToken =
      sessionStorage.getItem("ishopbd_admin_token") ||
      localStorage.getItem("ishopbd_admin_token");
    if (adminToken) {
      headers["X-Admin-Token"] = adminToken;
    }
  } catch {}
  return headers;
}
