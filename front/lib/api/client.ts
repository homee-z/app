const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Appel au back avec les cookies d'auth (httpOnly). Renvoie le champ `data` de la réponse.
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // Erreur de validation du back : { message: 'Validation failed', errors: [...] }
    const details = body?.errors ?? body?.message;
    throw new ApiError(
      res.status,
      Array.isArray(details) ? details.join(', ') : details || 'Une erreur est survenue',
    );
  }
  return body?.data as T;
}
