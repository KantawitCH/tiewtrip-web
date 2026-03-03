import { Trip, Activity, Expense, Participant } from '@/lib/store';

// This service layer simulates async operations
export const tripService = {
  getTrips: async (): Promise<Trip[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, this would fetch from API
    // Here we just return what's in the store (handled by the component using the hook)
    return []; 
  },
  
  createTrip: async (trip: Omit<Trip, 'id' | 'ownerId' | 'participantIds'>): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return 'mock-id'; // The store handles the actual ID generation
  },
};

export const itineraryService = {
  // ... similar mock methods
};

export const moneyService = {
  // ... similar mock methods
};
