import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../App';
import { Icons } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { NotificationItem } from '../components/NotificationItem';

export const NotificationsPage: React.FC = () => {
  const { trips } = useAuth();
  const navigate = useNavigate();

  const allNotifications = trips.flatMap(trip =>
    trip.notifications.map(n => ({
      ...n,
      tripTitle: trip.title,
      tripId: trip.id
    }))
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <SectionHeader
          title="Notifications"
          className="mb-6"
          action={<button className="text-sm text-blue-600 font-medium hover:text-blue-700">Mark all as read</button>}
        />

        <div className="space-y-4">
          {allNotifications.length === 0 ? (
            <EmptyState
              icon={<Icons.Bell className="w-6 h-6 text-slate-400" />}
              title="No notifications"
              description="You're all caught up!"
              className="rounded-2xl"
            />
          ) : (
            allNotifications.map((notif, idx) => (
              <NotificationItem
                key={`${notif.id}-${idx}`}
                title={notif.title}
                message={notif.message}
                timestamp={notif.timestamp}
                type={notif.type}
                tripLabel={notif.tripTitle}
                onClick={() => navigate(`/trip/${notif.tripId}`)}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};
