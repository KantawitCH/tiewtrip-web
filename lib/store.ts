import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Trip, Participant, Activity, Expense, Role, Vehicle } from './types';
import { api } from './api';

// Export types for use in components
export type { Trip, Participant, Activity, Expense, Role, Vehicle };

interface TripState {
  trips: Trip[];
  participants: Participant[];
  activities: Activity[];
  expenses: Expense[];
  vehicles: Vehicle[];
  currentUserId: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTrips: () => Promise<void>;
  fetchTripData: (tripId: string) => Promise<void>; // Fetches all data for a specific trip

  addTrip: (trip: Omit<Trip, 'id' | 'ownerId' | 'participantIds'>) => Promise<string>;
  updateTrip: (id: string, data: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  joinTrip: (tripId: string, role?: Role) => Promise<void>;
  
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<void>;
  removeParticipant: (id: string) => Promise<void>;
  
  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
  updateActivity: (id: string, data: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

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
  currentUserId: 'user-1',
  isLoading: false,
  error: null,

  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const trips = await api.getTrips();
      set({ trips, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch trips', isLoading: false });
    }
  },

  fetchTripData: async (tripId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [participants, activities, expenses] = await Promise.all([
        api.getParticipants(tripId),
        api.getActivities(tripId),
        api.getExpenses(tripId)
      ]);
      
      // Merge with existing state to avoid wiping other trips' data if we were caching
      // For simplicity, we'll just append/replace. 
      // A better approach for a real app is normalized state (byId), but for now:
      set(state => ({
        participants: [
          ...state.participants.filter(p => p.tripId !== tripId),
          ...participants
        ],
        activities: [
          ...state.activities.filter(a => a.tripId !== tripId),
          ...activities
        ],
        expenses: [
          ...state.expenses.filter(e => e.tripId !== tripId),
          ...expenses
        ],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to fetch trip details', isLoading: false });
    }
  },

  addTrip: async (tripData) => {
    set({ isLoading: true });
    const id = uuidv4();
    const currentUserId = get().currentUserId;
    
    const newTrip: Trip = {
      ...tripData,
      id,
      ownerId: currentUserId,
      participantIds: [currentUserId],
    };

    const ownerParticipant: Participant = {
      id: uuidv4(),
      tripId: id,
      name: 'Me',
      role: 'Owner',
    };

    try {
      await api.createTrip(newTrip);
      await api.addParticipant(ownerParticipant);
      
      set(state => ({
        trips: [...state.trips, newTrip],
        participants: [...state.participants, ownerParticipant],
        isLoading: false
      }));
      return id;
    } catch (error) {
      set({ error: 'Failed to create trip', isLoading: false });
      throw error;
    }
  },

  updateTrip: async (id, data) => {
    try {
      await api.updateTrip(id, data);
      set(state => ({
        trips: state.trips.map(t => t.id === id ? { ...t, ...data } : t)
      }));
    } catch (error) {
      set({ error: 'Failed to update trip' });
    }
  },

  deleteTrip: async (id) => {
    try {
      await api.deleteTrip(id);
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

    try {
      await api.addParticipant(newParticipant);
      // Also need to update the trip's participant list in the backend if that's how we model it
      // For now, we just update local state
      set(state => ({
        participants: [...state.participants, newParticipant],
        trips: state.trips.map(t => t.id === tripId ? { ...t, participantIds: [...t.participantIds, currentUserId]} : t)
      }));
    } catch (error) {
      set({ error: 'Failed to join trip' });
    }
  },

  addParticipant: async (data) => {
    const newParticipant = { ...data, id: uuidv4() };
    try {
      await api.addParticipant(newParticipant);
      set(state => ({
        participants: [...state.participants, newParticipant]
      }));
    } catch (error) {
      set({ error: 'Failed to add participant' });
    }
  },

  removeParticipant: async (id) => {
    try {
      await api.removeParticipant(id);
      set(state => ({
        participants: state.participants.filter(p => p.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to remove participant' });
    }
  },

  addActivity: async (data) => {
    const newActivity = { ...data, id: uuidv4() };
    try {
      await api.addActivity(newActivity);
      set(state => ({
        activities: [...state.activities, newActivity]
      }));
    } catch (error) {
      set({ error: 'Failed to add activity' });
    }
  },

  updateActivity: async (id, data) => {
    try {
      await api.updateActivity(id, data);
      set(state => ({
        activities: state.activities.map(a => a.id === id ? { ...a, ...data } : a)
      }));
    } catch (error) {
      set({ error: 'Failed to update activity' });
    }
  },

  deleteActivity: async (id) => {
    try {
      await api.deleteActivity(id);
      set(state => ({
        activities: state.activities.filter(a => a.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete activity' });
    }
  },

  addExpense: async (data) => {
    const newExpense = { ...data, id: uuidv4() };
    try {
      await api.addExpense(newExpense);
      set(state => ({
        expenses: [...state.expenses, newExpense]
      }));
    } catch (error) {
      set({ error: 'Failed to add expense' });
    }
  },

  deleteExpense: async (id) => {
    try {
      await api.deleteExpense(id);
      set(state => ({
        expenses: state.expenses.filter(e => e.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete expense' });
    }
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
