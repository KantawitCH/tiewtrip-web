"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, MapPin, Calendar, Sparkles, ArrowRight, Clock, Users, Plane, Ticket } from 'lucide-react';
import { format, isFuture, isPast, differenceInDays } from 'date-fns';
import AppLayout from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}

function DashboardContent() {
  const router = useRouter();
  const trips = useTripStore((state) => state.trips);
  const fetchTrips = useTripStore((state) => state.fetchTrips);
  const addTrip = useTripStore((state) => state.addTrip);
  
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    timezone: 'UTC',
  });

  const handleCreateTrip = () => {
    if (!newTrip.name || !newTrip.destination || !newTrip.startDate || !newTrip.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new Date(newTrip.startDate) > new Date(newTrip.endDate)) {
        toast.error("End date must be after start date");
        return;
    }

    const id = addTrip(newTrip);
    setIsCreateOpen(false);
    toast.success("Trip created successfully!");
    router.push(`/trip/${id}/overview`);
  };

  const upcomingTrips = trips
    .filter(t => isFuture(new Date(t.endDate)))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  const pastTrips = trips
    .filter(t => isPast(new Date(t.endDate)))
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Unique Header */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-dashed border-ink/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-coral font-bold uppercase tracking-widest text-xs">
            <Plane className="w-4 h-4" />
            Travel Desk
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-ink">
            Your <span className="italic text-coral">Journeys</span>
          </h1>
          <p className="text-muted max-w-md">
            {upcomingTrips.length > 0 
              ? `You have ${upcomingTrips.length} upcoming adventure${upcomingTrips.length === 1 ? '' : 's'} waiting for you.` 
              : "Ready to plan your next escape?"}
          </p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => router.push('/ai-builder')} className="flex-1 sm:flex-none h-12 border-coral/20 text-coral hover:bg-coral/5 hover:text-coral rounded-full px-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Builder
          </Button>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none h-12 shadow-lg shadow-coral/20 bg-ink text-cream hover:bg-ink/90 rounded-full px-6">
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new trip</DialogTitle>
                <DialogDescription>Start planning your next adventure.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Trip Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Summer in Italy" 
                    value={newTrip.name}
                    onChange={(e) => setNewTrip({...newTrip, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input 
                    id="destination" 
                    placeholder="e.g. Rome, Florence" 
                    value={newTrip.destination}
                    onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input 
                      id="startDate" 
                      type="date" 
                      value={newTrip.startDate}
                      onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input 
                      id="endDate" 
                      type="date" 
                      value={newTrip.endDate}
                      onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTrip}>Create Trip</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {trips.length === 0 ? (
        <EmptyState setIsCreateOpen={setIsCreateOpen} router={router} />
      ) : (
        <div className="space-y-12">
          {/* Upcoming Trips Section */}
          <section className="space-y-6">
            {upcomingTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingTrips.map((trip) => (
                  <TicketCard key={trip.id} trip={trip} router={router} variant="upcoming" />
                ))}
              </div>
            ) : (
              <div className="text-muted italic text-sm py-12 text-center bg-soft/30 rounded-2xl border border-dashed border-soft">
                No upcoming trips scheduled. Time to plan one!
              </div>
            )}
          </section>

          {/* Past Trips Section */}
          {pastTrips.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-ink/5 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-ink/60" />
                </div>
                <h2 className="text-xl font-bold text-ink/60 font-display">Travel Archive</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pastTrips.map((trip) => (
                  <TicketCard key={trip.id} trip={trip} router={router} variant="past" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function TicketCard({ trip, router, variant }: { trip: any, router: any, variant: 'upcoming' | 'past' }) {
  const isUpcoming = variant === 'upcoming';
  const destCode = trip.destination.substring(0, 3).toUpperCase();
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const today = new Date();
  const daysUntil = differenceInDays(startDate, today);
  const duration = differenceInDays(endDate, startDate) + 1;
  const currentDay = differenceInDays(today, startDate) + 1;
  const daysAgo = differenceInDays(today, endDate);
  const isActive = daysUntil <= 0 && !isPast(endDate);
  const isPastTrip = isPast(endDate);
  
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 group h-full">
      <div 
        className={`relative flex flex-col h-full bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isUpcoming ? 'shadow-lg shadow-ink/5' : 'opacity-70 hover:opacity-100 grayscale hover:grayscale-0'}`}
        onClick={() => router.push(`/trip/${trip.id}/overview`)}
      >
        {/* Top Section */}
        <div className={`p-6 ${isUpcoming ? 'bg-white' : 'bg-soft/30'} relative flex-1 flex flex-col min-h-[200px]`}>
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted uppercase tracking-widest">Destination</p>
              <h3 className="text-2xl font-display font-black text-ink group-hover:text-coral transition-colors leading-tight">
                {trip.destination}
              </h3>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-xs font-bold text-muted uppercase tracking-widest">Code</p>
              <h3 className="text-4xl font-display font-black text-ink/10 group-hover:text-coral/20 transition-colors">
                {destCode}
              </h3>
            </div>
          </div>
          
          <div className="flex justify-between items-end mt-auto">
             <div className="flex items-end gap-3">
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Depart</p>
                  <p className="font-mono font-medium text-ink">
                    {format(new Date(trip.startDate), 'MMM dd')}
                  </p>
                </div>
                <ArrowRight className="w-3 h-3 text-muted mb-[5px]" />
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Return</p>
                  <p className="font-mono font-medium text-ink">
                    {format(new Date(trip.endDate), 'MMM dd')}
                  </p>
                </div>
             </div>
             {isFuture(startDate) && (
               <Badge variant="mint" className="bg-mint text-ink hover:bg-mint/90 border-none">
                 {daysUntil} days to go
               </Badge>
             )}
             {isActive && (
               <Badge variant="coral" className="bg-coral text-white hover:bg-coral/90 border-none">
                 Day {currentDay} of {duration}
               </Badge>
             )}
             {isPastTrip && (
               <Badge variant="outline" className="border-ink/20 text-muted">
                 {daysAgo} days ago
               </Badge>
             )}
          </div>
        </div>

        {/* Divider with Notches */}
        <div className="relative h-6 bg-white flex items-center shrink-0">
           <div className="absolute left-0 w-4 h-8 bg-[#FAF7F0] rounded-r-full -ml-2" />
           <div className="w-full border-t-2 border-dashed border-ink/10 mx-4" />
           <div className="absolute right-0 w-4 h-8 bg-[#FAF7F0] rounded-l-full -mr-2" />
        </div>

        {/* Bottom Section */}
        <div className={`p-6 pt-2 ${isUpcoming ? 'bg-white' : 'bg-soft/30'} flex justify-between items-center shrink-0`}>
           <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-coral border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {trip.name.charAt(0)}
                 </div>
                 <div className="w-8 h-8 rounded-full bg-soft border-2 border-white flex items-center justify-center text-ink/50 text-xs">
                    <Users className="w-3 h-3" />
                 </div>
              </div>
              <span className="text-xs font-medium text-muted pl-1">Group Trip</span>
           </div>
           
           <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center group-hover:bg-coral group-hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4" />
           </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ setIsCreateOpen, router }: { setIsCreateOpen: (v: boolean) => void, router: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-soft rounded-[32px] bg-white/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-20 h-20 bg-gradient-to-br from-coral to-yellow rounded-full flex items-center justify-center mb-6 text-4xl shadow-lg shadow-coral/20 animate-floaty">
        🌍
      </div>
      <h3 className="text-3xl font-display font-bold text-ink mb-3">No trips yet</h3>
      <p className="text-muted text-lg max-w-md mb-8">
        Your passport is waiting. Create a trip manually or let our AI build your dream itinerary.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" onClick={() => setIsCreateOpen(true)} className="h-12 px-8 rounded-full">
            Create Trip
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/ai-builder')} className="h-12 px-8 rounded-full">
            <Sparkles className="w-4 h-4 mr-2 text-coral" />
            Try AI Builder
          </Button>
      </div>
    </div>
  )
}

