import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Icons } from '../../components/Icons';
import { SectionHeader } from '../../components/SectionHeader';
import { Vehicle, Participant } from '../../types';

interface VehicleTabProps {
  vehicles: Vehicle[];
  participants: Participant[];
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
}

export const VehicleTab: React.FC<VehicleTabProps> = ({
  vehicles,
  participants,
  onAddVehicle,
  onEditVehicle,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <SectionHeader
        title="Trip Vehicles"
        subtitle="Coordinate transportation logistics."
        action={
          <Button onClick={onAddVehicle} className="gap-2">
            <Icons.Plus className="w-4 h-4" /> Add Vehicle
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="p-5 flex flex-col justify-between h-full border-l-4 border-l-slate-900">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Icons.Car className="w-5 h-5 text-slate-500" />
                    {vehicle.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Icons.MapPin className="w-3 h-3" /> Start: {vehicle.startLocation}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${vehicle.passengerIds.length > vehicle.capacity ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                  {vehicle.passengerIds.length} / {vehicle.capacity}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Passengers</p>
                <div className="flex flex-wrap gap-2">
                  {vehicle.passengerIds.map(pid => {
                    const p = participants.find(part => part.userId === pid);
                    return (
                      <div key={pid} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full pl-1 pr-2 py-1">
                        <img src={p?.avatarUrl || ''} className="w-5 h-5 rounded-full" alt="" />
                        <span className="text-xs text-slate-700">{p?.name}</span>
                      </div>
                    );
                  })}
                  {vehicle.passengerIds.length === 0 && <span className="text-xs text-slate-400 italic">No passengers assigned.</span>}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-50">
              <Button variant="outline" fullWidth className="text-xs h-8" onClick={() => onEditVehicle(vehicle)}>Edit Details</Button>
            </div>
          </Card>
        ))}
        {vehicles.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-500">No vehicles added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
