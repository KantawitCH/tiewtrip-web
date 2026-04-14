import { apiPost, apiPostFormData } from './apiClient';
import { useAuthStore } from './authStore';
import type { Trip, Participant } from './types';

interface BackendTrip {
  id: string;
  userId: string;
  name: string;
  description?: string;
  destination: string;
  startDateTime?: string;
  endDateTime?: string;
  startDate?: string;
  endDate?: string;
  timezone: string;
  coverImageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  participantIds?: string[];
}

type CreateTripInput = Omit<Trip, 'id' | 'ownerId' | 'participantIds'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function toDateOnly(value: string): string {
  return value.split('T')[0];
}

function getTripTimestamp(value?: string): number {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function mapBackendTrip(bt: BackendTrip): Trip {
  const participantIds = bt.participantIds?.filter((participantId): participantId is string => typeof participantId === 'string') ?? [];

  return {
    id: bt.id,
    name: bt.name,
    description: bt.description || undefined,
    destination: bt.destination,
    startDate: toDateOnly(bt.startDateTime ?? bt.startDate ?? ''),
    endDate: toDateOnly(bt.endDateTime ?? bt.endDate ?? ''),
    timezone: bt.timezone ?? 'UTC',
    ownerId: bt.userId,
    participantIds: participantIds.length > 0 ? participantIds : [bt.userId],
    coverImageUrl: bt.coverImageUrl,
    isActive: bt.isActive,
  };
}

function normalizeCreateTripInput(data: CreateTripInput): CreateTripInput {
  return {
    ...data,
    description: data.description ?? '',
    startDate: toDateOnly(data.startDate),
    endDate: toDateOnly(data.endDate),
    timezone: data.timezone || 'UTC',
  };
}

function normalizeTripPayload(payload: unknown): Trip | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = asString(payload.id);
  const name = asString(payload.name);
  const destination = asString(payload.destination);
  const ownerId = asString(payload.ownerId) ?? asString(payload.userId);
  const startDate = asString(payload.startDate) ?? asString(payload.startDateTime);
  const endDate = asString(payload.endDate) ?? asString(payload.endDateTime);

  if (!id || !name || !destination || !ownerId || !startDate || !endDate) {
    return null;
  }

  const participantIds = Array.isArray(payload.participantIds)
    ? payload.participantIds.filter((participantId): participantId is string => typeof participantId === 'string')
    : [ownerId];

  return {
    id,
    name,
    description: typeof payload.description === 'string' && payload.description.length > 0 ? payload.description : undefined,
    destination,
    startDate: toDateOnly(startDate),
    endDate: toDateOnly(endDate),
    timezone: asString(payload.timezone) ?? 'UTC',
    ownerId,
    participantIds: participantIds.length > 0 ? participantIds : [ownerId],
    coverImageUrl: asString(payload.coverImageUrl),
    isActive: typeof payload.isActive === 'boolean' ? payload.isActive : undefined,
  };
}

function extractTripId(payload: unknown): string | null {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed !== '' && !/\s/.test(trimmed) ? trimmed : null;
  }

  if (!isRecord(payload)) {
    return null;
  }

  return asString(payload.tripId) ?? asString(payload.id) ?? null;
}

function synthesizeTripFromCreateInput(id: string, trip: CreateTripInput, userId: string): Trip {
  return {
    id,
    name: trip.name,
    description: trip.description || undefined,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    timezone: trip.timezone,
    ownerId: userId,
    participantIds: [userId],
  };
}

function matchesCreatedTrip(trip: Trip, submittedTrip: CreateTripInput, userId: string): boolean {
  return (
    trip.ownerId === userId &&
    trip.name === submittedTrip.name &&
    trip.destination === submittedTrip.destination &&
    trip.startDate === submittedTrip.startDate &&
    trip.endDate === submittedTrip.endDate &&
    trip.timezone === submittedTrip.timezone
  );
}

export interface TripOverview {
  trip: Trip;
  participantCount: number;
  activityCount: number;
  nextActivity: unknown | null;
}


export async function createTrip(data: CreateTripInput): Promise<Trip> {
  const userId = useAuthStore.getState().userId;
  if (!userId) throw new Error('Not authenticated');

  const normalizedTrip = normalizeCreateTripInput(data);
  const result = await apiPost<unknown>('/trip/create', {
    userId,
    name: normalizedTrip.name,
    description: normalizedTrip.description ?? '',
    destination: normalizedTrip.destination,
    startDate: `${normalizedTrip.startDate}T00:00:00Z`,
    endDate: `${normalizedTrip.endDate}T00:00:00Z`,
    timezone: normalizedTrip.timezone,
  });

  const createdTrip =
    normalizeTripPayload(result) ??
    (isRecord(result) ? normalizeTripPayload(result.trip) : null);

  if (createdTrip) {
    return createdTrip;
  }

  const createdTripId = extractTripId(result);

  if (createdTripId) {
    return synthesizeTripFromCreateInput(createdTripId, normalizedTrip, userId);
  }

  const dashboardTrips = await fetchDashboardTrips();
  const matchedTrip = dashboardTrips.find((trip) => matchesCreatedTrip(trip, normalizedTrip, userId));

  if (matchedTrip) {
    return matchedTrip;
  }

  throw new Error('Trip creation succeeded but the created trip could not be resolved from the response or dashboard.');
}

export async function fetchTripDetails(tripId: string): Promise<Trip> {
  const bt = await apiPost<BackendTrip>('/trip/inquiry', { tripId });
  return mapBackendTrip(bt);
}

export async function fetchTripOverview(tripId: string): Promise<TripOverview> {
  const result = await apiPost<{ trip: BackendTrip; participantCount: number; activityCount: number; nextActivity: unknown | null }>('/trip/overview/inquiry', { tripId });
  return {
    trip: mapBackendTrip(result.trip),
    participantCount: result.participantCount,
    activityCount: result.activityCount,
    nextActivity: result.nextActivity,
  };
}

export async function updateTripApi(
  tripId: string,
  data: { name?: string; destination?: string; description?: string; startDate?: string; endDate?: string; timezone?: string }
): Promise<void> {
  await apiPost<null>('/trip/update', {
    tripId,
    ...data,
    ...(data.startDate ? { startDate: `${data.startDate}T00:00:00Z` } : {}),
    ...(data.endDate ? { endDate: `${data.endDate}T00:00:00Z` } : {}),
  });
}

export async function deleteTripApi(tripId: string): Promise<void> {
  await apiPost<null>('/trip/delete', { tripId });
}

export async function uploadTripImage(tripId: string, file: File): Promise<{ objectKey: string }> {
  const formData = new FormData();
  formData.append('trip_id', tripId);
  formData.append('image', file);
  return apiPostFormData<{ objectKey: string }>('/trip/image/update', formData);
}

export async function fetchParticipants(tripId: string): Promise<Participant[]> {
  return apiPost<Participant[]>('/trip/participant/inquiry', { tripId });
}

export async function fetchSchedule(tripId: string, fromDate: string, toDate: string): Promise<unknown> {
  return apiPost<unknown>('/trip/schedule/inquiry', { tripId, fromDate, toDate });
}

export async function fetchBilling(tripId: string): Promise<unknown> {
  return apiPost<unknown>('/trip/billing/inquiry', { tripId });
}

export async function fetchTransportation(tripId: string): Promise<unknown> {
  return apiPost<unknown>('/trip/transportation/inquiry', { tripId });
}

export async function generateInvitation(tripId: string): Promise<{ token: string }> {
  return apiPost<{ token: string }>('/trip/invitation/generate', { tripId });
}

export async function acceptInvitation(token: string, userId: string): Promise<void> {
  await apiPost<null>('/trip/invitation/accept', { token, userId });
}
