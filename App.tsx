import React, { useState, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Mock Data
import { User, Trip } from './types';

// Pages
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TripDetailsPage } from './pages/TripDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  updateUser: (user: User) => void;
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  updateTrip: (updatedTrip: Trip) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Swiss',
  email: 'alex@tiewtrip.com',
  avatarUrl: 'https://picsum.photos/100/100',
  description: 'Passionate traveler and photography enthusiast. Love exploring new cultures and hidden gems.'
};

const INITIAL_TRIPS: Trip[] = [
  {
    id: 't1',
    title: 'Kyoto Spring Exploration',
    description: 'A 6-day journey through the cultural heart of Japan during the cherry blossom season.',
    destination: 'Kyoto, Japan',
    currency: 'JPY',
    dates: 'Apr 10 - Apr 11, 2024',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    participants: [
      { userId: 'u1', name: 'Alex Swiss', avatarUrl: 'https://picsum.photos/100/100', role: 'Owner' },
      { userId: 'u2', name: 'Sarah Lee', avatarUrl: 'https://picsum.photos/100/101', role: 'Viewer' }
    ],
    votes: [],
    enabledModules: ['finance', 'vehicle'],
    vehicles: [
      { id: 'v1', name: 'Rental Van', capacity: 6, startLocation: 'Kyoto Station', passengerIds: ['u1', 'u2'] }
    ],
    bills: [
      { 
        id: 'b1', title: 'Ryokan Deposit', amount: 50000, date: '2024-04-10', paidByUserId: 'u1', isPaid: false, 
        splitMethod: 'equal', involvedUserIds: ['u1', 'u2']
      }
    ],
    notifications: [
      { id: 'n1', title: 'Flight Delayed', message: 'Your flight JL123 is delayed by 45 mins.', type: 'warning', timestamp: '2h ago' },
      { id: 'n2', title: 'Check-in Open', message: 'Web check-in is now open.', type: 'info', timestamp: '5h ago' }
    ],
    itinerary: [
      {
        id: 'd1',
        date: '2024-04-10',
        activities: [
          { 
            id: 'a1', 
            startDate: '2024-04-10', startTime: '09:00',
            endDate: '2024-04-10', endTime: '10:00',
            activity: 'Arrive at KIX Airport', location: 'Osaka', note: 'Take Haruka Express' 
          },
          { 
            id: 'a2', 
            startDate: '2024-04-10', startTime: '14:00',
            endDate: '2024-04-10', endTime: '15:00',
            activity: 'Check-in at Ryokan', location: 'Gion' 
          }
        ]
      },
      {
        id: 'd2',
        date: '2024-04-11',
        activities: [
          { 
            id: 'a3', 
            startDate: '2024-04-11', startTime: '08:00',
            endDate: '2024-04-11', endTime: '10:00',
            activity: 'Fushimi Inari Shrine', location: 'Southern Kyoto' 
          },
          { 
            id: 'a4', 
            startDate: '2024-04-11', startTime: '13:00',
            endDate: '2024-04-11', endTime: '14:30',
            activity: 'Lunch at Nishiki Market', location: 'Central Kyoto' 
          }
        ]
      }
    ]
  },
  {
    id: 't2',
    title: 'Swiss Alps Hiking',
    description: 'Hiking the best trails in the Bernese Oberland.',
    destination: 'Interlaken, Switzerland',
    currency: 'CHF',
    dates: 'Jun 12 - Jun 18, 2024',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    participants: [
       { userId: 'u1', name: 'Alex Swiss', avatarUrl: 'https://picsum.photos/100/100', role: 'Owner' }
    ],
    votes: [],
    enabledModules: [],
    vehicles: [],
    bills: [],
    notifications: [],
    itinerary: []
  }
];

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/trip/:id" element={<RequireAuth><TripDetailsPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);

  const login = () => setUser(MOCK_USER);
  const logout = () => setUser(null);
  const updateUser = (updatedUser: User) => setUser(updatedUser);
  const addTrip = (trip: Trip) => setTrips(prev => [trip, ...prev]);
  const updateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, trips, addTrip, updateTrip }}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;