import { request } from './client';

export { ApiError } from './client';

export type HouseholdRole = 'admin' | 'member' | 'guest';
export type HouseholdMemberStatus = 'pending' | 'active';

export interface Household {
  id: string;
  name: string;
  role: HouseholdRole;
  status: HouseholdMemberStatus;
  memberCount: number; // membres actifs uniquement
  code?: string; // présent seulement pour un admin actif
  createdAt: string;
}

export interface HouseholdMember {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: HouseholdRole;
  status: HouseholdMemberStatus;
  joinedAt: string;
}

const base = (id: string) => `/households/${id}`;

export const listMyHouseholds = () => request<Household[]>('/households/me');

export const createHousehold = (name: string) =>
  request<Household>('/households', { method: 'POST', body: JSON.stringify({ name }) });

// Crée une demande en attente : un admin doit la valider.
export const joinHousehold = (code: string) =>
  request<Household>('/households/join', { method: 'POST', body: JSON.stringify({ code }) });

// Admin uniquement. Même règle qu'à la création : 2 à 50 caractères après trim.
export const renameHousehold = (id: string, name: string) =>
  request<Household>(base(id), { method: 'PATCH', body: JSON.stringify({ name }) });

// Admin uniquement. Supprime le foyer et toutes ses adhésions.
export const deleteHousehold = (id: string) => request<null>(base(id), { method: 'DELETE' });

export const listMembers = (id: string) => request<HouseholdMember[]>(`${base(id)}/members`);

export const approveMember = (id: string, userId: string) =>
  request<null>(`${base(id)}/members/${userId}/approve`, { method: 'POST' });

export const rejectMember = (id: string, userId: string) =>
  request<null>(`${base(id)}/members/${userId}/request`, { method: 'DELETE' });

export const updateMemberRole = (id: string, userId: string, role: HouseholdRole) =>
  request<HouseholdMember>(`${base(id)}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });

// Quitter le foyer (userId = soi-même) ou exclure un membre (admin)
export const removeMember = (id: string, userId: string) =>
  request<null>(`${base(id)}/members/${userId}`, { method: 'DELETE' });

export const regenerateCode = (id: string) =>
  request<{ code: string }>(`${base(id)}/code/regenerate`, { method: 'POST' });
