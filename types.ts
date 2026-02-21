export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  coverUrl?: string;
  description?: string;
}

export type Role = 'Owner' | 'Admin' | 'Viewer';
export type Currency = 'USD' | 'EUR' | 'CHF' | 'JPY' | 'GBP' | 'THB';
export type ModuleType = 'vehicle' | 'finance';

export interface Participant {
  userId: string;
  name: string;
  avatarUrl: string;
  role: Role;
}

export interface TripNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: string;
}

export interface TripActivity {
  id: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  activity: string; // Location Name
  location?: string; // Free text details
  googleMapsUrl?: string; // External URL
  note?: string;
}

export interface TripDay {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  activities: TripActivity[];
}

export interface VoteOption {
  id: string;
  text: string;
  votes: string[]; // array of userIds
}

export interface VotingSession {
  id: string;
  title: string;
  description?: string;
  type: 'general' | 'datetime';
  deadline: string;
  options: VoteOption[];
  status: 'active' | 'completed';
  winningOptionId?: string;
  relatedActivityId?: string; // If valid, winning option replaces this activity
}

// --- Module: Vehicle ---
export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  startLocation: string; // Google Maps URL or text
  passengerIds: string[]; // User IDs
}

// --- Module: Finance ---
export type SplitMethod = 'equal' | 'manual' | 'item' | 'portion';

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  assignedUserIds: string[]; // Who pays for this item
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  paidByUserId: string;
  splitMethod: SplitMethod;
  involvedUserIds: string[];
  
  // For 'manual' split
  manualSplits?: { userId: string; amount: number }[];
  
  // For 'item' split
  items?: BillItem[];
  
  // For 'portion' split (e.g. 1 share vs 2 shares)
  portions?: { userId: string; portion: number }[];

  isPaid: boolean;
  date: string;
}

export interface Trip {
  id: string;
  title: string;
  description?: string;
  destination: string;
  dates: string; // Display string, e.g. "Apr 10 - Apr 15"
  currency: Currency;
  imageUrl: string;
  notifications: TripNotification[];
  itinerary: TripDay[];
  participants: Participant[];
  votes: VotingSession[];
  
  // Modules
  enabledModules: ModuleType[];
  vehicles: Vehicle[];
  bills: Bill[];
}

export enum AuthState {
  LOGIN,
  REGISTER,
  AUTHENTICATED
}

// Gemini Response Types
export interface GeneratedItinerary {
  tripTitle: string;
  tripDescription: string;
  days: {
    dayLabel: string;
    activities: {
      time: string;
      description: string;
      location: string;
    }[];
  }[];
}