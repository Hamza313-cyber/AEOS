// Shared helper for calling the AEOS backend.
// Adds the saved password (if any) and shows the lock screen again on a 401.

const KEY = "aeos_password";

export function getSavedPassword(): string {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function savePassword(pw: string) {
  try {
    if (pw) localStorage.setItem(KEY, pw);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: password lasts only for this page load */
  }
  memoryPassword = pw;
}

let memoryPassword = getSavedPassword();

export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (memoryPassword) headers.set("x-app-password", memoryPassword);
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    window.dispatchEvent(new Event("aeos:locked"));
  }
  return res;
}
