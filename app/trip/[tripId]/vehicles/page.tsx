"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Car, Bus, Plus, Users, Fuel, Trash2, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Vehicle } from '@/lib/types';

export default function VehiclesPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const vehicles = useTripStore((state) => state.vehicles).filter(v => v.tripId === tripId);
  const participants = useTripStore((state) => state.participants).filter(p => p.tripId === tripId);
  
  const addVehicle = useTripStore((state) => state.addVehicle);
  const deleteVehicle = useTripStore((state) => state.deleteVehicle);
  const assignParticipantToVehicle = useTripStore((state) => state.assignParticipantToVehicle);
  const removeParticipantFromVehicle = useTripStore((state) => state.removeParticipantFromVehicle);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    name: '',
    type: 'Car',
    capacity: 4,
    costPerDay: 0,
    currency: 'USD',
    notes: ''
  });

  if (!trip) return null;

  const handleAddVehicle = () => {
    if (!newVehicle.name) return;
    
    addVehicle({
      tripId,
      name: newVehicle.name,
      type: newVehicle.type as any || 'Car',
      capacity: Number(newVehicle.capacity) || 4,
      costPerDay: Number(newVehicle.costPerDay) || 0,
      currency: newVehicle.currency || 'USD',
      notes: newVehicle.notes,
      assignedParticipantIds: [],
      // Mock image based on type
      imageUrl: `https://source.unsplash.com/400x300/?${newVehicle.type?.toLowerCase()},vehicle`
    });
    
    setIsAddOpen(false);
    setNewVehicle({ name: '', type: 'Car', capacity: 4, costPerDay: 0, currency: 'USD', notes: '' });
    toast.success("Vehicle added successfully");
  };

  const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);
  const totalCostPerDay = vehicles.reduce((sum, v) => sum + v.costPerDay, 0);
  const assignedTravelers = new Set(vehicles.flatMap(v => v.assignedParticipantIds)).size;

  return (
    <div className="max-w-6xl space-y-8 pb-12">
      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="border-soft overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="h-48 bg-soft relative">
               {/* Placeholder for image - using a gradient/pattern if no real image */}
               <div className="absolute inset-0 bg-gradient-to-br from-soft to-white flex items-center justify-center">
                  <Car className="w-16 h-16 text-muted/20" />
               </div>
               <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-ink backdrop-blur shadow-sm font-bold">
                     {vehicle.type}
                  </Badge>
               </div>
               <div className="absolute bottom-4 left-4">
                  <div className="bg-ink/80 text-cream backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                     ${vehicle.costPerDay}/day
                  </div>
               </div>
            </div>
            
            <CardHeader className="pb-2">
               <div className="flex justify-between items-start">
                  <div>
                     <CardTitle className="text-xl font-bold">{vehicle.name}</CardTitle>
                     <CardDescription className="line-clamp-1">{vehicle.notes || 'No notes'}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted hover:text-red-500" onClick={() => deleteVehicle(vehicle.id)}>
                     <Trash2 className="w-4 h-4" />
                  </Button>
               </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
               {/* Capacity Bar */}
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-muted uppercase tracking-wider">
                     <span>Occupancy</span>
                     <span>{vehicle.assignedParticipantIds.length} / {vehicle.capacity}</span>
                  </div>
                  <div className="h-2 bg-soft rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full transition-all ${
                           vehicle.assignedParticipantIds.length > vehicle.capacity ? 'bg-red-500' : 'bg-yellow'
                        }`}
                        style={{ width: `${Math.min((vehicle.assignedParticipantIds.length / vehicle.capacity) * 100, 100)}%` }}
                     />
                  </div>
               </div>

               {/* Passengers */}
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-muted uppercase tracking-wider">Passengers</span>
                     
                     <Select onValueChange={(value) => assignParticipantToVehicle(vehicle.id, value)}>
                        <SelectTrigger className="h-7 text-xs w-[110px] bg-soft border-none rounded-lg">
                           <SelectValue placeholder="Add Person" />
                        </SelectTrigger>
                        <SelectContent>
                           {participants
                              .filter(p => !vehicle.assignedParticipantIds.includes(p.id))
                              .map(p => (
                                 <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))
                           }
                        </SelectContent>
                     </Select>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                     {vehicle.assignedParticipantIds.map(id => {
                        const person = participants.find(p => p.id === id);
                        if (!person) return null;
                        return (
                           <Badge key={id} variant="outline" className="pl-1 pr-2 py-1 gap-1.5 bg-white hover:bg-red-50 hover:border-red-200 group/badge cursor-pointer transition-colors" onClick={() => removeParticipantFromVehicle(vehicle.id, id)}>
                              <div className="w-5 h-5 rounded-full bg-soft flex items-center justify-center text-[10px] font-bold">
                                 {person.name.charAt(0)}
                              </div>
                              {person.name}
                              <X className="w-3 h-3 opacity-0 group-hover/badge:opacity-100 text-red-500 transition-opacity" />
                           </Badge>
                        );
                     })}
                     {vehicle.assignedParticipantIds.length === 0 && (
                        <span className="text-xs text-muted italic">No passengers assigned yet</span>
                     )}
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Vehicle Card */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="border-2 border-dashed border-soft rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-300 min-h-[300px] group">
               <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors shadow-sm">
                  <Plus className="w-8 h-8 text-yellow-600 group-hover:text-white" />
               </div>
               <div className="text-center">
                  <span className="block font-bold text-lg text-ink group-hover:text-yellow-700">Add Vehicle</span>
                  <span className="text-sm text-muted">Register a car, van, or bus</span>
               </div>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Vehicle Name</Label>
                <Input 
                  placeholder="e.g. Red Toyota, Rental Van #1" 
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Type</Label>
                   <Select onValueChange={(val) => setNewVehicle({...newVehicle, type: val as any})} defaultValue="Car">
                      <SelectTrigger>
                         <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="Car">Car</SelectItem>
                         <SelectItem value="Van">Van</SelectItem>
                         <SelectItem value="Bus">Bus</SelectItem>
                         <SelectItem value="Bike">Bike</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <Label>Capacity</Label>
                   <Input 
                      type="number" 
                      value={newVehicle.capacity}
                      onChange={(e) => setNewVehicle({...newVehicle, capacity: Number(e.target.value)})}
                   />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cost Per Day</Label>
                <Input 
                  type="number" 
                  value={newVehicle.costPerDay}
                  onChange={(e) => setNewVehicle({...newVehicle, costPerDay: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input 
                  placeholder="License plate, rental company, etc."
                  value={newVehicle.notes}
                  onChange={(e) => setNewVehicle({...newVehicle, notes: e.target.value})}
                />
              </div>
              <Button onClick={handleAddVehicle} className="w-full bg-yellow-500 text-ink hover:bg-yellow-400 font-bold">Add Vehicle</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
