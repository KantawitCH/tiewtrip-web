import { Trip, Participant, Activity, Expense } from './types';
import { addDays, format } from 'date-fns';

const today = new Date();
const nextMonth = addDays(today, 30);

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    name: 'Tech Conference 2026',
    destination: 'San Francisco, CA',
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(addDays(today, 4), 'yyyy-MM-dd'),
    timezone: 'America/Los_Angeles',
    ownerId: 'user-1',
    participantIds: ['user-1', 'user-2', 'user-3'],
  },
  {
    id: 'trip-2',
    name: 'Summer in Japan',
    destination: 'Tokyo & Kyoto',
    startDate: format(nextMonth, 'yyyy-MM-dd'),
    endDate: format(addDays(nextMonth, 10), 'yyyy-MM-dd'),
    timezone: 'Asia/Tokyo',
    ownerId: 'user-1',
    participantIds: ['user-1', 'user-4'],
  }
];

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: 'user-1', tripId: 'trip-1', name: 'Alex (Me)', role: 'Owner', email: 'alex@example.com' },
  { id: 'user-2', tripId: 'trip-1', name: 'Sarah', role: 'Member', email: 'sarah@example.com' },
  { id: 'user-3', tripId: 'trip-1', name: 'Mike', role: 'Member', email: 'mike@example.com' },
  { id: 'user-1', tripId: 'trip-2', name: 'Alex (Me)', role: 'Owner', email: 'alex@example.com' },
  { id: 'user-4', tripId: 'trip-2', name: 'Jessica', role: 'Member', email: 'jess@example.com' },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    tripId: 'trip-1',
    dayIndex: 0,
    title: 'Arrival & Check-in',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Hotel Zetta',
    notes: 'Reservation #12345',
    order: 0,
  },
  {
    id: 'act-2',
    tripId: 'trip-1',
    dayIndex: 0,
    title: 'Welcome Dinner',
    startTime: '19:00',
    endTime: '21:00',
    location: 'House of Prime Rib',
    notes: 'Booking for 3 people',
    order: 1,
  },
  {
    id: 'act-3',
    tripId: 'trip-1',
    dayIndex: 1,
    title: 'Conference Keynote',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Moscone Center',
    order: 0,
  },
  {
    id: 'act-4',
    tripId: 'trip-2',
    dayIndex: 0,
    title: 'Flight to Tokyo',
    startTime: '10:00',
    location: 'SFO -> NRT',
    order: 0,
  }
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    tripId: 'trip-1',
    title: 'Welcome Dinner',
    amount: 185.50,
    currency: 'USD',
    paidByParticipantId: 'user-1',
    participantIds: ['user-1', 'user-2', 'user-3'],
    splitMethod: 'equal',
    date: format(today, 'yyyy-MM-dd'),
  },
  {
    id: 'exp-2',
    tripId: 'trip-1',
    title: 'Uber to Hotel',
    amount: 45.00,
    currency: 'USD',
    paidByParticipantId: 'user-2',
    participantIds: ['user-1', 'user-2', 'user-3'],
    splitMethod: 'equal',
    date: format(today, 'yyyy-MM-dd'),
  }
];
