const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'guest';
  householdId: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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

export const getProfile = () => request<UserProfile>('/users/me');

export const updateProfile = (input: UpdateProfileInput) =>
  request<UserProfile>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteAccount = () =>
  request<unknown>('/users/me', { method: 'DELETE' });
