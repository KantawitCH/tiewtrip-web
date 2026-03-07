export type Role = 'Owner' | 'Admin' | 'Member';

export interface Participant {
  id: string;
  tripId: string;
  name: string;
  role: Role;
  email?: string;
  avatar?: string;
}

export interface Activity {
  id: string;
  tripId: string;
  dayIndex: number;
  title: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  mapUrl?: string;
  order: number;
}

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  paidByParticipantId: string;
  participantIds: string[];
  splitMethod: SplitMethod;
  customSplits?: Record<string, number>;
  activityId?: string;
  date: string;
  isPaid?: boolean;
}

export interface Settlement {
  id: string;
  tripId: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  currency: string;
  date: string;
}

export interface Vehicle {
  id: string;
  tripId: string;
  name: string;
  type: 'Car' | 'Van' | 'Bus' | 'Bike' | 'Other';
  capacity: number;
  costPerDay: number;
  currency: string;
  notes?: string;
  imageUrl?: string;
  assignedParticipantIds: string[];
  startDate?: string; // Optional assignment dates
  endDate?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  timezone: string;
  ownerId: string;
  participantIds: string[];
}
