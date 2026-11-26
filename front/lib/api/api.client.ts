import { ApiError, UnauthorizedError } from "@/lib/errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function refreshSession(): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
  });

  if (res.status === 401) {
    if (
      !path.includes("auth/login") &&
      !path.includes("auth/refresh") &&
      !isRetry
    ) {
      const refreshed = await refreshSession();
      if (refreshed) {
        return request<T>(path, options, true);
      }
    }
    throw new UnauthorizedError();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  // Ne plante jamais, même si le corps est vide ou n'est pas du JSON
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const errors = Array.isArray(body?.errors) ? (body.errors as string[]) : undefined;
    const message =
      errors?.join(", ") ||
      (typeof body?.message === "string" && body.message) ||
      "Une erreur est survenue";
    throw new ApiError(res.status, message, errors);
  }

  return body?.data as T;
}
