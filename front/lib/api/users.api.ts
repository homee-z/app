import { request } from "@/lib/api/api.client";
import { UserProfile, UpdateProfileInput } from "@/types/user.types";

export const getProfile = () => request<UserProfile>('/users/me');

export const updateProfile = (input: UpdateProfileInput) =>
  request<UserProfile>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteAccount = () =>
  request<unknown>('/users/me', { method: 'DELETE' });
