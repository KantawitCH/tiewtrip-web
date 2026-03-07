"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function JoinTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const joinTrip = useTripStore((state) => state.joinTrip);
  const participants = useTripStore((state) => state.participants).filter((p) => p.tripId === tripId);

  const isAuthenticated = typeof window !== 'undefined'
    ? !!sessionStorage.getItem('authToken')
    : false;

  const isMember = participants.some(p => p.name === 'Me');

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingJoinUrl', `/trip/${tripId}/join`);
      router.push(`/auth/sign-in?redirect=/trip/${tripId}/join`);
      return;
    }
    if (isMember) {
      router.push(`/trip/${tripId}/overview`);
    }
  }, [isAuthenticated, isMember, router, tripId]);

  const handleJoin = () => {
    joinTrip(tripId);
    toast.success("Joined trip successfully!");
    router.push(`/trip/${tripId}/overview`);
  };

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-4">
        <Card>
          <CardHeader>
            <CardTitle>Trip Not Found</CardTitle>
            <CardDescription>This invite link might be invalid or expired.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || isMember) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center text-3xl mb-4">
            ✈️
          </div>
          <CardTitle className="text-2xl">You&apos;ve been invited to</CardTitle>
          <h1 className="text-4xl font-display font-black text-coral mt-2">{trip.name}</h1>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center gap-4 text-muted text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-coral" /> {trip.destination}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ink/40" />
              {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </span>
          </div>
          <p className="text-muted flex items-center justify-center gap-1.5">
            <Users className="w-4 h-4" />
            {participants.length} {participants.length === 1 ? 'traveler' : 'travelers'} planning this trip
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>Decline</Button>
          <Button size="lg" onClick={handleJoin}>Join Trip</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
