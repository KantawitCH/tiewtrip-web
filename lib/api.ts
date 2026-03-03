import { Trip, Participant, Activity, Expense } from './types';
import { MOCK_TRIPS, MOCK_PARTICIPANTS, MOCK_ACTIVITIES, MOCK_EXPENSES } from './mock-data';

// Simulating a database delay
const DELAY = 600;

// Helper to simulate network request
const delay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), DELAY);
  });
};

// In-memory storage seeded with mock data (reset on reload, or use localStorage to persist mock changes)
// For "mock data only for now", we can just use the static data, but if we want the app to feel "alive",
// we should probably allow mutations to persist in memory at least.
// Let's use a simple in-memory store that initializes from the mock data.

let db = {
  trips: [...MOCK_TRIPS],
  participants: [...MOCK_PARTICIPANTS],
  activities: [...MOCK_ACTIVITIES],
  expenses: [...MOCK_EXPENSES],
};

// API Client
export const api = {
  // --- Trips ---
  getTrips: async (): Promise<Trip[]> => {
    return delay([...db.trips]);
  },

  getTrip: async (id: string): Promise<Trip | undefined> => {
    const trip = db.trips.find((t) => t.id === id);
    return delay(trip ? { ...trip } : undefined);
  },

  createTrip: async (trip: Trip): Promise<Trip> => {
    db.trips.push(trip);
    return delay(trip);
  },

  updateTrip: async (id: string, data: Partial<Trip>): Promise<Trip> => {
    const index = db.trips.findIndex((t) => t.id === id);
    if (index !== -1) {
      db.trips[index] = { ...db.trips[index], ...data };
      return delay({ ...db.trips[index] });
    }
    throw new Error('Trip not found');
  },

  deleteTrip: async (id: string): Promise<void> => {
    db.trips = db.trips.filter((t) => t.id !== id);
    // Cascade delete
    db.participants = db.participants.filter((p) => p.tripId !== id);
    db.activities = db.activities.filter((a) => a.tripId !== id);
    db.expenses = db.expenses.filter((e) => e.tripId !== id);
    return delay(undefined);
  },

  // --- Participants ---
  getParticipants: async (tripId: string): Promise<Participant[]> => {
    return delay(db.participants.filter((p) => p.tripId === tripId));
  },

  addParticipant: async (participant: Participant): Promise<Participant> => {
    db.participants.push(participant);
    return delay(participant);
  },

  removeParticipant: async (id: string): Promise<void> => {
    db.participants = db.participants.filter((p) => p.id !== id);
    return delay(undefined);
  },

  // --- Activities ---
  getActivities: async (tripId: string): Promise<Activity[]> => {
    return delay(db.activities.filter((a) => a.tripId === tripId).sort((a, b) => a.order - b.order));
  },

  addActivity: async (activity: Activity): Promise<Activity> => {
    db.activities.push(activity);
    return delay(activity);
  },

  updateActivity: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const index = db.activities.findIndex((a) => a.id === id);
    if (index !== -1) {
      db.activities[index] = { ...db.activities[index], ...data };
      return delay({ ...db.activities[index] });
    }
    throw new Error('Activity not found');
  },

  deleteActivity: async (id: string): Promise<void> => {
    db.activities = db.activities.filter((a) => a.id !== id);
    return delay(undefined);
  },

  // --- Expenses ---
  getExpenses: async (tripId: string): Promise<Expense[]> => {
    return delay(db.expenses.filter((e) => e.tripId === tripId));
  },

  addExpense: async (expense: Expense): Promise<Expense> => {
    db.expenses.push(expense);
    return delay(expense);
  },

  deleteExpense: async (id: string): Promise<void> => {
    db.expenses = db.expenses.filter((e) => e.id !== id);
    return delay(undefined);
  },
};
