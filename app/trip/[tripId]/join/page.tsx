"use client";

import { useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { acceptInvitation } from '@/lib/tripApi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

function JoinTripContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = params.tripId as string;
  const token = searchParams.get('token');
  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const participants = useTripStore((state) => state.participants).filter((p) => p.tripId === tripId);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isMember = participants.some(p => p.id === user?.id);

  useEffect(() => {
    if (!isAuthenticated) {
      const redirect = `/trip/${tripId}/join${token ? `?token=${token}` : ''}`;
      sessionStorage.setItem('pendingJoinUrl', redirect);
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    if (isMember) {
      router.push(`/trip/${tripId}/overview`);
    }
  }, [isAuthenticated, isMember, router, tripId, token]);

  const handleJoin = async () => {
    if (!user) return;
    try {
      if (token) {
        await acceptInvitation(token, user.id);
      }
      toast.success("Joined trip successfully!");
      router.push(`/trip/${tripId}/overview`);
    } catch {
      toast.error("Failed to join trip. The invite link may be invalid or expired.");
    }
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

export default function JoinTripPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream p-4" />}>
      <JoinTripContent />
    </Suspense>
  );
}
