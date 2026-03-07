"use client";

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTripStore } from '@/lib/store';
import AppLayout from '@/components/layout/app-layout';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MapPin, Calendar, Settings, Users, Wallet, Map, LayoutTemplate, Car, ArrowLeft, MoreHorizontal, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function TripLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const tripId = params.tripId as string;
  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const fetchTripData = useTripStore((state) => state.fetchTripData);
  const fetchTrips = useTripStore((state) => state.fetchTrips);
  const trips = useTripStore((state) => state.trips);
  const isLoading = useTripStore((state) => state.isLoading);
  const participants = useTripStore((state) => state.participants).filter((p) => p.tripId === tripId);
  const currentUserId = useTripStore((state) => state.currentUserId);
  const [mounted, setMounted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (tripId) {
      fetchTripData(tripId);
    }
    if (trips.length === 0) {
      fetchTrips();
    }
  }, [tripId, fetchTripData, fetchTrips, trips.length]);

  if (!mounted) {
    return <div className="min-h-screen bg-paper/50" />;
  }

  if (isLoading && !trip) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
          <p className="mt-4 text-muted">Loading trip...</p>
        </div>
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-display font-bold mb-4">Trip not found</h2>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  const currentUserRole = participants.find(p => p.id === currentUserId)?.role;
  const canInvite = currentUserRole === 'Owner' || currentUserRole === 'Admin';

  const tabs = [
    { 
      href: `/trip/${tripId}/overview`, 
      label: 'Overview', 
      icon: LayoutTemplate, 
      activeClass: 'bg-ink text-white shadow-md shadow-ink/20',
      inactiveClass: 'text-muted hover:bg-ink/5'
    },
    { 
      href: `/trip/${tripId}/itinerary`, 
      label: 'Itinerary', 
      icon: Map, 
      activeClass: 'bg-coral text-white shadow-md shadow-coral/20',
      inactiveClass: 'text-muted hover:bg-coral/5'
    },
    { 
      href: `/trip/${tripId}/money`, 
      label: 'Money', 
      icon: Wallet, 
      activeClass: 'bg-mint text-ink shadow-md shadow-mint/20',
      inactiveClass: 'text-muted hover:bg-mint/10'
    },
    { 
      href: `/trip/${tripId}/participants`, 
      label: 'People', 
      icon: Users, 
      activeClass: 'bg-sky-500 text-white shadow-md shadow-sky-500/20',
      inactiveClass: 'text-muted hover:bg-sky-500/5'
    },
    { 
      href: `/trip/${tripId}/vehicles`, 
      label: 'Vehicles', 
      icon: Car, 
      activeClass: 'bg-yellow-500 text-ink shadow-md shadow-yellow-500/20',
      inactiveClass: 'text-muted hover:bg-yellow-500/10'
    },
    { 
      href: `/trip/${tripId}/settings`, 
      label: 'Settings', 
      icon: Settings, 
      activeClass: 'bg-slate-800 text-white shadow-md shadow-slate-800/20',
      inactiveClass: 'text-muted hover:bg-slate-800/5'
    },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-paper/50">
        
        {/* Main Header */}
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col gap-6 border-b-2 border-dashed border-ink/10 pb-8">
              <div className="space-y-2">
                 {/* Top Bar: Back Link + Share */}
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-coral font-bold uppercase tracking-widest text-xs">
                       <Link href="/dashboard" className="hover:text-coral/80 transition-colors flex items-center gap-1">
                          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
                       </Link>
                    </div>
                    {canInvite && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsShareOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" /> Share
                      </Button>
                    )}
                 </div>

                 {/* Trip Title & Details */}
                 <h1 className="text-4xl md:text-5xl font-display font-black text-ink leading-[0.9] tracking-tight">
                    {trip.name}
                 </h1>
                 <div className="flex items-center gap-4 text-muted font-medium">
                    <span className="flex items-center gap-1.5">
                       <MapPin className="w-4 h-4 text-coral" /> {trip.destination}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-ink/20" />
                    <span className="flex items-center gap-1.5">
                       <Calendar className="w-4 h-4 text-ink/40" /> 
                       {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                    </span>
                 </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex overflow-x-auto no-scrollbar mask-linear-fade-right pt-2">
                 <div className="flex gap-2 w-max">
                    {tabs.map((tab) => {
                       const isActive = pathname.includes(tab.href);
                       return (
                          <Link 
                             key={tab.href} 
                             href={tab.href}
                             className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap select-none",
                                isActive ? tab.activeClass : tab.inactiveClass
                             )}
                          >
                             <tab.icon className={cn("w-4 h-4", isActive ? "opacity-100" : "opacity-70")} />
                             {tab.label}
                          </Link>
                       );
                    })}
                 </div>
              </nav>
           </div>
        </div>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto py-8 min-h-[500px]">
           {children}
        </main>
      </div>
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Invite to trip</DialogTitle>
            <DialogDescription>Share this link to invite others to join.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <input
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/trip/${tripId}/join`}
              className="flex-1 text-sm border border-soft rounded-lg px-3 py-2 bg-paper text-muted truncate"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/trip/${tripId}/join`);
                setLinkCopied(true);
                toast.success("Invite link copied!");
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="flex items-center gap-2 shrink-0"
            >
              {linkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {linkCopied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
