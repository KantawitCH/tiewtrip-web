import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Trip, Participant, Activity, Expense, Role, Vehicle, Settlement } from './types';
import {
  createTrip as createTripApi,
  updateTripApi,
  deleteTripApi,
  uploadTripImage as uploadTripImageApi,
  fetchParticipants,
  fetchSchedule,
  fetchBilling,
  fetchTransportation,
} from './tripApi';
import { fetchDashboardTrips } from './userApi';

// Export types for use in components
export type { Trip, Participant, Activity, Expense, Role, Vehicle, Settlement };

interface TripState {
  trips: Trip[];
  participants: Participant[];
  activities: Activity[];
  expenses: Expense[];
  vehicles: Vehicle[];
  settlements: Settlement[];
  currentUserId: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTrips: () => Promise<void>;
  fetchTripData: (tripId: string) => Promise<void>; // Fetches all data for a specific trip

  addTrip: (trip: Omit<Trip, 'id' | 'ownerId' | 'participantIds'>) => Promise<string>;
  updateTrip: (id: string, data: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  uploadTripImage: (tripId: string, file: File) => Promise<void>;
  joinTrip: (tripId: string, role?: Role) => Promise<void>;

  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<void>;
  removeParticipant: (id: string) => Promise<void>;

  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
  updateActivity: (id: string, data: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  markExpensePaid: (id: string, isPaid: boolean) => Promise<void>;

  addSettlement: (s: Omit<Settlement, 'id'>) => Promise<void>;
  deleteSettlement: (id: string) => Promise<void>;

  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  assignParticipantToVehicle: (vehicleId: string, participantId: string) => Promise<void>;
  removeParticipantFromVehicle: (vehicleId: string, participantId: string) => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  participants: [],
  activities: [],
  expenses: [],
  vehicles: [],
  settlements: [],
  currentUserId: 'user-1',
  isLoading: false,
  error: null,

  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const { trips } = await fetchDashboardTrips();
      set({ trips, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch trips', isLoading: false });
    }
  },

  fetchTripData: async (tripId: string) => {
    set({ isLoading: true, error: null });
    try {
      const trip = get().trips.find(t => t.id === tripId);
      const fromDate = trip?.startDate ?? new Date().toISOString().split('T')[0];
      const toDate = trip?.endDate ?? fromDate;

      const [participants] = await Promise.all([
        fetchParticipants(tripId),
        fetchSchedule(tripId, fromDate, toDate),  // TODO: map to Activity[] when shape confirmed
        fetchBilling(tripId),                      // TODO: map to Expense[] when shape confirmed
        fetchTransportation(tripId),               // TODO: map to Vehicle[] when shape confirmed
      ]);

      set(state => ({
        participants: [
          ...state.participants.filter(p => p.tripId !== tripId),
          ...participants,
        ],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to fetch trip details', isLoading: false });
    }
  },

  addTrip: async (tripData) => {
    set({ isLoading: true, error: null });
    try {
      const createdTrip = await createTripApi(tripData);
      set((state) => ({
        trips: [createdTrip, ...state.trips.filter((trip) => trip.id !== createdTrip.id)],
        isLoading: false,
        error: null,
      }));
      return createdTrip.id;
    } catch (error) {
      set({ error: 'Failed to create trip', isLoading: false });
      throw error;
    }
  },

  updateTrip: async (id, data) => {
    try {
      await updateTripApi(id, {
        name: data.name,
        destination: data.destination,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        timezone: data.timezone,
      });
      set(state => ({
        trips: state.trips.map(t => t.id === id ? { ...t, ...data } : t)
      }));
    } catch (error) {
      set({ error: 'Failed to update trip' });
    }
  },

  deleteTrip: async (id) => {
    try {
      await deleteTripApi(id);
      set(state => ({
        trips: state.trips.filter(t => t.id !== id),
        participants: state.participants.filter(p => p.tripId !== id),
        activities: state.activities.filter(a => a.tripId !== id),
        expenses: state.expenses.filter(e => e.tripId !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete trip' });
    }
  },

  uploadTripImage: async (tripId, file) => {
    try {
      const result = await uploadTripImageApi(tripId, file);
      set(state => ({
        trips: state.trips.map(t =>
          t.id === tripId ? { ...t, coverImageUrl: result.objectKey } : t
        ),
      }));
    } catch (error) {
      set({ error: 'Failed to upload trip image' });
    }
  },

  joinTrip: async (tripId, role = 'Member') => {
    const currentUserId = get().currentUserId;
    const existing = get().participants.find(p => p.tripId === tripId && p.name === 'Me');
    if (existing) return;

    const newParticipant: Participant = {
      id: uuidv4(),
      tripId,
      name: 'Me',
      role
    };

    set(state => ({
      participants: [...state.participants, newParticipant],
      trips: state.trips.map(t => t.id === tripId ? { ...t, participantIds: [...t.participantIds, currentUserId]} : t)
    }));
  },

  addParticipant: async (data) => {
    const newParticipant = { ...data, id: uuidv4() };
    set(state => ({
      participants: [...state.participants, newParticipant]
    }));
  },

  removeParticipant: async (id) => {
    set(state => ({
      participants: state.participants.filter(p => p.id !== id)
    }));
  },

  addActivity: async (data) => {
    const newActivity = { ...data, id: uuidv4() };
    set(state => ({
      activities: [...state.activities, newActivity]
    }));
  },

  updateActivity: async (id, data) => {
    set(state => ({
      activities: state.activities.map(a => a.id === id ? { ...a, ...data } : a)
    }));
  },

  deleteActivity: async (id) => {
    set(state => ({
      activities: state.activities.filter(a => a.id !== id)
    }));
  },

  addExpense: async (data) => {
    const newExpense = { ...data, id: uuidv4() };
    set(state => ({
      expenses: [...state.expenses, newExpense]
    }));
  },

  deleteExpense: async (id) => {
    set(state => ({
      expenses: state.expenses.filter(e => e.id !== id)
    }));
  },

  markExpensePaid: async (id, isPaid) => {
    set(state => ({
      expenses: state.expenses.map(e => e.id === id ? { ...e, isPaid } : e)
    }));
  },

  addSettlement: async (data) => {
    const newSettlement = { ...data, id: uuidv4() };
    set(state => ({
      settlements: [...state.settlements, newSettlement]
    }));
  },

  deleteSettlement: async (id) => {
    set(state => ({
      settlements: state.settlements.filter(s => s.id !== id)
    }));
  },

  addVehicle: async (data) => {
    const newVehicle = { ...data, id: uuidv4() };
    // Mock API call would go here
    set(state => ({
      vehicles: [...state.vehicles, newVehicle]
    }));
  },

  updateVehicle: async (id, data) => {
    // Mock API call
    set(state => ({
      vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...data } : v)
    }));
  },

  deleteVehicle: async (id) => {
    // Mock API call
    set(state => ({
      vehicles: state.vehicles.filter(v => v.id !== id)
    }));
  },

  assignParticipantToVehicle: async (vehicleId, participantId) => {
    set(state => ({
      vehicles: state.vehicles.map(v => {
        if (v.id === vehicleId) {
          if (v.assignedParticipantIds.includes(participantId)) return v;
          return { ...v, assignedParticipantIds: [...v.assignedParticipantIds, participantId] };
        }
        // Optional: Remove participant from other vehicles if they can only be in one?
        // For now, let's allow multiple assignments or assume manual management
        return v;
      })
    }));
  },

  removeParticipantFromVehicle: async (vehicleId, participantId) => {
    set(state => ({
      vehicles: state.vehicles.map(v => 
        v.id === vehicleId 
          ? { ...v, assignedParticipantIds: v.assignedParticipantIds.filter(id => id !== participantId) }
          : v
      )
    }));
  },
}));
