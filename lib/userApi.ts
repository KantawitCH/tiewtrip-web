import { apiPost, apiPostFormData } from './apiClient';
import { useAuthStore } from './authStore';
import type { Trip } from './types';

export interface UserProfile {
  id: string;
  username?: string;
  displayName?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  profileImageURL?: string;
  bio?: string;
  coverPhotoUrl?: string;
  description?: string;
}

export async function fetchCurrentUser(userId: string): Promise<UserProfile> {
  return apiPost<UserProfile>('/user/me', { userId });
}

export async function updateUserProfile(data: {
  displayName?: string;
  bio?: string;
  description?: string;
}): Promise<void> {
  return apiPost('/user/update', data);
}

interface DashboardTripCard {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImageURL?: string;
  description?: string;
  participantCount?: number;
  activityCount?: number;
}

interface DashboardProfileResult {
  profile: UserProfile & { trips: DashboardTripCard[] };
  tripSummaries: { id: string; destination: string; startDate: string; endDate: string }[];
}

function mapDashboardTrips(result: DashboardProfileResult): Trip[] {
  return (result.profile.trips ?? []).map(t => ({
    id: t.id,
    name: t.destination,
    description: t.description,
    destination: t.destination,
    startDate: t.startDate.split('T')[0],
    endDate: t.endDate.split('T')[0],
    timezone: 'UTC',
    ownerId: result.profile.id,
    participantIds: [result.profile.id],
    coverImageUrl: t.coverImageURL,
  }));
}

export async function fetchDashboardTrips(): Promise<{ trips: Trip[] }> {
  const userId = useAuthStore.getState().userId;
  if (!userId) throw new Error('Not authenticated');
  const result = await apiPost<DashboardProfileResult>('/user/dashboard', { userId });
  return { trips: mapDashboardTrips(result) };
}

export async function fetchUserProfile(): Promise<{ profile: UserProfile; trips: Trip[] }> {
  const userId = useAuthStore.getState().userId;
  if (!userId) throw new Error('Not authenticated');
  const result = await apiPost<DashboardProfileResult>('/user/profile', { userId });
  return { profile: result.profile, trips: mapDashboardTrips(result) };
}

export async function uploadUserProfileImage(
  file: File,
  type: 'profile' | 'cover'
): Promise<{ objectKey: string }> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error('Not authenticated');
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('system-media', type);
  formData.append('image', file);
  return apiPostFormData<{ objectKey: string }>('/user/profile/image/update', formData);
}
