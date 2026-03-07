"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTripStore, Activity } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format, addDays, parseISO } from 'date-fns';
import { Plus, MapPin, Clock, Trash2, GripVertical, Pencil, MoreHorizontal, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ItineraryPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const activities = useTripStore((state) => state.activities).filter((a) => a.tripId === tripId);
  const addActivity = useTripStore((state) => state.addActivity);
  const updateActivity = useTripStore((state) => state.updateActivity);
  const deleteActivity = useTripStore((state) => state.deleteActivity);
  const updateTrip = useTripStore((state) => state.updateTrip);

  const [selectedDay, setSelectedDay] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  if (!trip) return null;

  const startDate = new Date(trip.startDate);
  const days = Array.from({ length: Math.ceil((new Date(trip.endDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 }, (_, i) => i);

  // Sort activities: Time-based first, then order-based, then nulls
  const currentDayActivities = activities
    .filter(a => a.dayIndex === selectedDay)
    .sort((a, b) => {
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      if (a.startTime) return -1;
      if (b.startTime) return 1;
      return a.order - b.order;
    });

  const handleSaveActivity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      notes: formData.get('notes') as string,
      mapUrl: formData.get('mapUrl') as string,
    };

    if (!data.title) {
      toast.error("Title is required");
      return;
    }

    if (editingActivity) {
      updateActivity(editingActivity.id, data);
      toast.success("Activity updated");
      setEditingActivity(null);
    } else {
      addActivity({
        tripId,
        dayIndex: selectedDay,
        order: currentDayActivities.length, // Append to end
        ...data,
      });
      toast.success("Activity added");
    }
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      deleteActivity(id);
      toast.success("Activity deleted");
      setEditingActivity(null); // Close modal if open
    }
  };

  const openEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setIsAddOpen(true);
  };

  const openAdd = () => {
    setEditingActivity(null);
    setIsAddOpen(true);
  };

  const handleAddDay = async () => {
    const newEndDate = addDays(new Date(trip.endDate), 1).toISOString();
    await updateTrip(tripId, { endDate: newEndDate });
    setSelectedDay(days.length); // current length = new day's 0-based index
    toast.success("Day added");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Day Selector Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0 pr-2">
        <div className="flex lg:flex-col gap-3 flex-wrap lg:flex-nowrap">
          {days.map((dayIndex) => {
            const date = addDays(startDate, dayIndex);
            const isSelected = selectedDay === dayIndex;
            const hasActivities = activities.some(a => a.dayIndex === dayIndex);
            
            return (
              <button
                key={dayIndex}
                onClick={() => setSelectedDay(dayIndex)}
                className={cn(
                  "flex flex-col items-start p-4 rounded-xl transition-all min-w-[120px] lg:w-full text-left border outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                  isSelected 
                    ? "bg-ink text-cream border-ink shadow-lg scale-[1.02]" 
                    : "bg-white text-muted hover:bg-soft border-soft"
                )}
              >
                <span className={cn("text-xs font-bold uppercase tracking-wider mb-1", isSelected ? "text-coral" : "text-muted")}>
                  Day {dayIndex + 1}
                </span>
                <span className={cn("font-display font-bold text-lg", isSelected ? "text-cream" : "text-ink")}>
                  {format(date, 'MMM d')}
                </span>
                <span className="text-xs mt-1 opacity-60">
                   {format(date, 'EEEE')}
                </span>
                {hasActivities && (
                   <div className={cn("mt-2 w-1.5 h-1.5 rounded-full", isSelected ? "bg-mint" : "bg-coral")} />
                )}
              </button>
            );
          })}
          <button
            onClick={handleAddDay}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-soft text-muted hover:border-coral hover:text-coral transition-all min-w-[120px] lg:w-full font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Add day
          </button>
        </div>
      </div>

      {/* Main Itinerary Content */}
      <div className="flex-1 bg-white/50 rounded-[32px] border border-soft p-6 md:p-8 relative">
        <div className="flex justify-between items-center mb-8 z-10">
          <div>
            <h2 className="text-3xl font-display font-bold text-ink">
              Day {selectedDay + 1}
            </h2>
            <p className="text-muted">
              {format(addDays(startDate, selectedDay), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button onClick={openAdd} className="bg-coral text-white hover:bg-coral/90 shadow-lg shadow-coral/20 rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>

        <div className="relative">
          {currentDayActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-soft rounded-2xl">
              <div className="w-16 h-16 bg-soft rounded-full flex items-center justify-center mb-4 text-2xl opacity-50">
                📍
              </div>
              <p className="text-muted font-medium">No activities for this day.</p>
              <Button variant="link" onClick={openAdd}>Add your first stop</Button>
            </div>
          ) : (
            <div className="relative pl-4 pt-2">
               {/* Timeline Line */}
               <div className="absolute left-[27px] top-4 bottom-10 w-0.5 bg-soft border-l-2 border-dashed border-coral/20" />

               <div className="space-y-4">
                {currentDayActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="relative mb-8 last:mb-0 group animate-in fade-in slide-in-from-left-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-6">
                       {/* Timeline Node */}
                       <div className="relative z-10 flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-cream border-2 border-coral flex items-center justify-center shadow-sm">
                             <div className="w-2 h-2 rounded-full bg-coral" />
                          </div>
                       </div>

                       {/* Time Label */}
                       <div className="w-16 flex-shrink-0 pt-1.5 text-right">
                          <span className="font-mono text-sm font-bold text-ink block">
                             {activity.startTime || '—'}
                          </span>
                          {activity.endTime && (
                             <span className="text-xs text-muted block mt-1">
                                {activity.endTime}
                             </span>
                          )}
                       </div>

                       {/* Content Card */}
                       <Card 
                          className="flex-1 border border-soft hover:border-coral/40 transition-all hover:shadow-md cursor-pointer bg-white"
                          onClick={() => openEdit(activity)}
                        >
                          <div className="p-4">
                             <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg text-ink">{activity.title}</h3>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreHorizontal className="w-4 h-4 text-muted" />
                                   </Button>
                                </div>
                             </div>
                             
                             {activity.location && (
                                <div className="flex items-center gap-1.5 text-sm text-muted mb-2">
                                  <MapPin className="w-3.5 h-3.5 text-coral" />
                                  {activity.location}
                                </div>
                              )}

                              {activity.mapUrl && (
                                <a href={activity.mapUrl} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center gap-1.5 text-sm text-coral hover:underline mb-2"
                                   onClick={(e) => e.stopPropagation()}>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  View on Map
                                </a>
                              )}

                              {activity.notes && (
                                <p className="text-sm text-ink/70 bg-soft/30 p-2 rounded-lg mb-2">
                                  {activity.notes}
                                </p>
                              )}

                          </div>
                        </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSaveActivity}>
            <DialogHeader>
              <DialogTitle>{editingActivity ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Activity Title</Label>
                <Input id="title" name="title" defaultValue={editingActivity?.title} placeholder="e.g. Visit Louvre Museum" required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={editingActivity?.location} placeholder="e.g. Rue de Rivoli, Paris" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" type="time" defaultValue={editingActivity?.startTime} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" type="time" defaultValue={editingActivity?.endTime} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mapUrl">Google Maps Link</Label>
                <Input id="mapUrl" name="mapUrl" type="url" defaultValue={editingActivity?.mapUrl} placeholder="https://maps.google.com/..." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={editingActivity?.notes} placeholder="Tickets, reservation details, etc." />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              {editingActivity && (
                <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 sm:mr-auto" onClick={() => handleDelete(editingActivity.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Save Activity</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
