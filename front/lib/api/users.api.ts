import { request } from './client';

export { ApiError } from './client';

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

export const getProfile = () => request<UserProfile>('/users/me');

export const updateProfile = (input: UpdateProfileInput) =>
  request<UserProfile>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteAccount = () =>
  request<unknown>('/users/me', { method: 'DELETE' });
