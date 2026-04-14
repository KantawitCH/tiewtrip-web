"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Car, Bus, Truck, Bike, Plus, Trash2, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Vehicle } from '@/lib/types';

function getVehicleIcon(type: string) {
  return ({ Car, Van: Truck, Bus, Bike, Other: Car } as Record<string, React.ElementType>)[type] ?? Car;
}

function formatDateRange(start?: string, end?: string) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  if (end) return `Until ${fmt(end)}`;
  return '';
}

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
    notes: '',
    startDate: '',
    endDate: '',
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
      startDate: newVehicle.startDate || undefined,
      endDate: newVehicle.endDate || undefined,
      assignedParticipantIds: [],
    });

    setIsAddOpen(false);
    setNewVehicle({ name: '', type: 'Car', capacity: 4, costPerDay: 0, currency: 'USD', notes: '', startDate: '', endDate: '' });
    toast.success("Vehicle added successfully");
  };

  const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);
  const totalCostPerDay = vehicles.reduce((sum, v) => sum + v.costPerDay, 0);

  return (
    <div className="max-w-6xl space-y-8 pb-12">
      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: vehicles.length, label: 'Vehicles', color: 'text-ink' },
          { value: totalCapacity, label: 'Total Seats', color: 'text-ink' },
          { value: `$${totalCostPerDay}`, label: 'Per Day', color: 'text-coral' },
        ].map(({ value, label, color }) => (
          <Card key={label} className="border-soft">
            <CardContent className="p-6 text-center">
              <p className={`text-4xl font-black font-display ${color}`}>{value}</p>
              <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => {
          const VehicleIcon = getVehicleIcon(vehicle.type);
          return (
            <Card key={vehicle.id} className="border-soft group hover:border-coral/40 hover:shadow-lg hover:shadow-coral/5 transition-all duration-300 overflow-hidden">
              <div className="p-6 flex items-start gap-4">
                {/* Type icon avatar */}
                <div className="w-14 h-14 rounded-2xl bg-coral/10 text-coral flex items-center justify-center shrink-0">
                  <VehicleIcon className="w-7 h-7" />
                </div>

                {/* Name + meta row */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-xl text-ink leading-tight">{vehicle.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="coral" className="text-[10px] uppercase tracking-wider">{vehicle.type}</Badge>
                        <span className="text-xs font-mono text-muted">${vehicle.costPerDay}/day</span>
                      </div>
                    </div>
                    {/* Delete — hidden until group-hover */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      onClick={() => deleteVehicle(vehicle.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Date range chip */}
                  {(vehicle.startDate || vehicle.endDate) && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDateRange(vehicle.startDate, vehicle.endDate)}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {vehicle.notes && (
                    <p className="text-xs text-muted mt-1 truncate">{vehicle.notes}</p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-soft mx-6" />

              <CardContent className="pt-4 space-y-4">
                {/* Occupancy Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-muted uppercase tracking-wider">
                    <span>Occupancy</span>
                    <span>{vehicle.assignedParticipantIds.length} / {vehicle.capacity}</span>
                  </div>
                  <div className="h-2 bg-soft rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        vehicle.assignedParticipantIds.length >= vehicle.capacity ? 'bg-coral' : 'bg-coral/50'
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
          );
        })}

        {/* Add Vehicle Card */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="border-2 border-dashed border-soft rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-coral/50 hover:bg-coral/5 transition-all duration-300 min-h-[300px] group">
              <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center group-hover:bg-coral transition-colors shadow-sm">
                <Plus className="w-8 h-8 text-coral group-hover:text-white" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-lg text-ink">Add Vehicle</span>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newVehicle.startDate}
                    onChange={(e) => setNewVehicle({...newVehicle, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={newVehicle.endDate}
                    onChange={(e) => setNewVehicle({...newVehicle, endDate: e.target.value})}
                  />
                </div>
              </div>
              <Button variant="coral" onClick={handleAddVehicle} className="w-full font-bold">Add Vehicle</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
