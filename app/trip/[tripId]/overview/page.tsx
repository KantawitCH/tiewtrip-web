"use client";

import { useParams, useRouter } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, isFuture, isPast } from 'date-fns';
import { ArrowRight, Wallet, Users, Map, Calendar, Settings, Share2, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TripOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  
  // Use selectors that return stable references or primitive values to avoid infinite loops
  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const participants = useTripStore((state) => state.participants).filter((p) => p.tripId === tripId);
  const activities = useTripStore((state) => state.activities).filter((a) => a.tripId === tripId).sort((a, b) => a.order - b.order);
  const expenses = useTripStore((state) => state.expenses).filter((e) => e.tripId === tripId);

  if (!trip) return null;

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const today = new Date();
  
  const daysUntil = differenceInDays(startDate, today);
  const duration = differenceInDays(endDate, startDate) + 1;
  const currentDay = differenceInDays(today, startDate) + 1;
  const daysAgo = differenceInDays(today, endDate);
  const isActive = daysUntil <= 0 && !isPast(endDate);
  const isPastTrip = isPast(endDate);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Find next activity
  const nextActivity = activities.find(a => {
    // This is a simple check. In a real app, you'd parse the date + time string.
    // Here we just take the first one since they are sorted by order/time.
    return true; 
  });

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Trip Brief Report - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TIME CARD */}
        <Card className="border-soft shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="w-32 h-32 -mr-8 -mt-8" />
           </div>
           <CardContent className="p-6 flex flex-col h-full justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${daysUntil > 0 ? 'bg-mint animate-pulse' : isActive ? 'bg-coral animate-pulse' : 'bg-ink/20'}`} />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
                       {daysUntil > 0 ? 'Countdown' : isActive ? 'Day' : 'Ended'}
                    </span>
                 </div>
                 <div className="space-y-1">
                    <span className="text-4xl md:text-5xl font-display font-black tracking-tight text-ink block">
                       {daysUntil > 0 ? daysUntil : isActive ? (
                         <>{currentDay}<span className="text-2xl font-bold text-muted"> of {duration}</span></>
                       ) : `${daysAgo} days ago`}
                    </span>
                    <span className="text-sm font-medium text-muted block">
                       {daysUntil > 0 ? 'Days to go' : isActive ? 'In Progress' : 'Trip completed'}
                    </span>
                 </div>
              </div>
              <div className="pt-6 mt-4 border-t border-soft flex items-center gap-3 text-sm text-muted">
                 <Calendar className="w-4 h-4" />
                 <span className="font-medium">
                    {format(startDate, 'MMM d')} — {format(endDate, 'MMM d')}
                 </span>
                 <Badge variant="outline" className="ml-auto font-mono text-xs border-soft text-muted">
                    {duration} Days
                 </Badge>
              </div>
           </CardContent>
        </Card>

        {/* BUDGET CARD */}
        <Card className="border-soft shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer" onClick={() => router.push(`/trip/${tripId}/expense`)}>
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-32 h-32 -mr-8 -mt-8 text-mint" />
           </div>
           <CardContent className="p-6 flex flex-col h-full justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-mint" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
                       Budget
                    </span>
                 </div>
                 <div className="space-y-1">
                    <span className="text-4xl md:text-5xl font-display font-black tracking-tight text-ink block">
                       ${(totalExpenses / 1000).toFixed(1)}k
                    </span>
                    <span className="text-sm font-medium text-muted block">Total Spent</span>
                 </div>
              </div>
              <div className="pt-6 mt-4 border-t border-soft flex items-center justify-between">
                 <div className="flex -space-x-2">
                    {expenses.slice(0, 3).map((e, i) => (
                       <div key={i} className="w-6 h-6 rounded-full bg-soft border-2 border-white flex items-center justify-center text-[8px] font-bold text-muted">
                          $
                       </div>
                    ))}
                 </div>
                 <span className="text-xs font-bold text-mint flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Manage <ArrowRight className="w-3 h-3" />
                 </span>
              </div>
           </CardContent>
        </Card>

        {/* TEAM CARD */}
        <Card className="border-soft shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer" onClick={() => router.push(`/trip/${tripId}/participant`)}>
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-32 h-32 -mr-8 -mt-8 text-sky-500" />
           </div>
           <CardContent className="p-6 flex flex-col h-full justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
                       Team
                    </span>
                 </div>
                 <div className="space-y-1">
                    <span className="text-4xl md:text-5xl font-display font-black tracking-tight text-ink block">
                       {participants.length}
                    </span>
                    <span className="text-sm font-medium text-muted block">Travelers</span>
                 </div>
              </div>
              <div className="pt-6 mt-4 border-t border-soft flex items-center justify-between">
                 <div className="flex -space-x-2">
                    {participants.slice(0, 4).map((p, i) => (
                       <div key={i} className="w-8 h-8 rounded-full bg-soft border-2 border-white flex items-center justify-center text-[10px] font-bold text-ink">
                          {p.name.charAt(0)}
                       </div>
                    ))}
                    {participants.length > 4 && (
                       <div className="w-8 h-8 rounded-full bg-ink text-white border-2 border-white flex items-center justify-center text-[10px] font-bold">
                          +{participants.length - 4}
                       </div>
                    )}
                 </div>
                 <span className="text-xs font-bold text-sky-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View <ArrowRight className="w-3 h-3" />
                 </span>
              </div>
           </CardContent>
        </Card>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Left Column: Itinerary Focus */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Itinerary Snapshot */}
            <section>
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-muted">Up Next</h3>
                  </div>
                  <Link href={`/trip/${tripId}/schedule`}>
                     <Button variant="link" className="text-coral h-auto p-0 font-bold">View Full Schedule <ArrowRight className="w-4 h-4 ml-1" /></Button>
                  </Link>
               </div>
               
               {activities.length > 0 ? (
                  <div className="space-y-4">
                     {activities.slice(0, 4).map((activity, i) => (
                        <div 
                           key={activity.id}
                           className="animate-in fade-in slide-in-from-left-4 duration-500"
                           style={{ animationDelay: `${i * 100}ms` }}
                        >
                           <Card className="border-soft hover:border-coral/30 transition-all hover:shadow-md group cursor-pointer" onClick={() => router.push(`/trip/${tripId}/schedule`)}>
                              <div className="p-5 flex items-center gap-5">
                                 <div className="flex flex-col items-center justify-center w-16 h-16 bg-soft rounded-2xl text-center group-hover:bg-coral group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-bold uppercase opacity-60">Day</span>
                                    <span className="text-2xl font-black leading-none">{activity.dayIndex + 1}</span>
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="font-bold text-ink text-lg group-hover:text-coral transition-colors">{activity.title}</h4>
                                    <div className="flex items-center gap-4 text-sm text-muted mt-2">
                                       <span className="flex items-center gap-1.5 bg-soft/50 px-2 py-1 rounded-md">
                                          <Clock className="w-3.5 h-3.5" />
                                          {activity.startTime || 'TBD'}
                                       </span>
                                       {activity.location && (
                                          <span className="flex items-center gap-1.5">
                                             <MapPin className="w-3.5 h-3.5" />
                                             {activity.location}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                                 <div className="w-8 h-8 rounded-full bg-soft flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-4 h-4 text-ink" />
                                 </div>
                              </div>
                           </Card>
                        </div>
                     ))}
                  </div>
               ) : (
                  <Card className="border-dashed border-2 border-soft bg-soft/20">
                     <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                           <Map className="w-10 h-10 text-muted/50" />
                        </div>
                        <h4 className="font-bold text-ink text-lg mb-2">No activities planned</h4>
                        <p className="text-muted text-sm mb-6 max-w-xs mx-auto">Your itinerary is looking a bit empty. Start adding activities to build your perfect trip.</p>
                        <Link href={`/trip/${tripId}/schedule`}>
                           <Button className="bg-ink text-cream hover:bg-ink/90">Start Planning</Button>
                        </Link>
                     </CardContent>
                  </Card>
               )}
            </section>
         </div>

         {/* Right Column: Context & Tools */}
         <div className="space-y-8">
            
            {/* Recent Expenses (Mini List) */}
            <section>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-muted">Recent Spending</h3>
                  <Link href={`/trip/${tripId}/expense`} className="text-xs font-bold text-coral hover:underline">View All</Link>
               </div>
               <Card className="border-soft bg-white overflow-hidden">
                  <div className="divide-y divide-soft">
                     {expenses.length > 0 ? (
                        expenses.slice(0, 3).map((expense) => (
                           <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-soft/20 transition-colors">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-soft flex items-center justify-center text-xs font-bold text-muted">
                                    $
                                 </div>
                                 <div>
                                    <p className="font-bold text-ink text-sm">{expense.title}</p>
                                    <p className="text-[10px] text-muted uppercase">{format(new Date(expense.date), 'MMM d')}</p>
                                 </div>
                              </div>
                              <span className="font-mono font-bold text-ink text-sm">-${expense.amount}</span>
                           </div>
                        ))
                     ) : (
                        <div className="p-8 text-center">
                           <p className="text-sm text-muted italic">No expenses recorded yet.</p>
                        </div>
                     )}
                  </div>
                  {expenses.length > 0 && (
                     <div className="p-3 bg-soft/30 border-t border-soft text-center">
                        <Link href={`/trip/${tripId}/expense`}>
                           <Button variant="ghost" size="sm" className="text-xs text-muted h-auto py-1">Add Expense</Button>
                        </Link>
                     </div>
                  )}
               </Card>
            </section>

            {/* Map Placeholder */}
            <div className="rounded-2xl overflow-hidden h-48 bg-soft relative group cursor-pointer">
               <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,2,0/400x300?access_token=placeholder')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500" />
               <div className="absolute inset-0 flex items-center justify-center bg-ink/5 group-hover:bg-ink/0 transition-colors">
                  <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-coral" />
                     <span className="text-xs font-bold text-ink">{trip.destination}</span>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
