"use client";

import { useTripStore } from '@/lib/store';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ProfilePage() {
  return (
    <AppLayout>
      <ProfileContent />
    </AppLayout>
  );
}

function ProfileContent() {
  const trips = useTripStore((state) => state.trips);
  
  // Mock User Data
  const user = {
    name: "Traveler One",
    email: "traveler@example.com",
    initials: "T1"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-display font-black text-ink">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <Card className="md:col-span-1 border-none shadow-lg bg-white h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-coral text-cream flex items-center justify-center text-3xl font-display font-bold border-4 border-white shadow-coral">
              {user.initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">{user.name}</h2>
              <p className="text-muted">{user.email}</p>
            </div>
            <div className="w-full pt-4 border-t border-soft">
              <Link href="/">
                <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trips List */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-2xl font-display font-bold text-ink">Your Trips</h3>
          {trips.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed border-soft rounded-2xl">
              <p className="text-muted mb-4">You haven&apos;t joined any trips yet.</p>
              <Link href="/dashboard">
                <Button>Explore Dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <Link key={trip.id} href={`/trip/${trip.id}/overview`}>
                  <Card className="hover:shadow-md transition-all hover:border-coral/50 cursor-pointer group">
                    <CardContent className="p-6 flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="font-bold text-xl text-ink group-hover:text-coral transition-colors">{trip.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {trip.destination}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(trip.startDate), 'MMM yyyy')}</span>
                        </div>
                      </div>
                      <Badge variant="outline">Owner</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
