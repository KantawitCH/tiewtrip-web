"use client";

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, ImagePlus } from 'lucide-react';

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const updateTrip = useTripStore((state) => state.updateTrip);
  const deleteTrip = useTripStore((state) => state.deleteTrip);
  const uploadTripImage = useTripStore((state) => state.uploadTripImage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: trip?.name || '',
    destination: trip?.destination || '',
    startDate: trip?.startDate || '',
    endDate: trip?.endDate || '',
  });

  if (!trip) return null;

  const handleUpdate = () => {
    updateTrip(tripId, formData);
    toast.success("Trip updated successfully");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadTripImage(tripId, file);
      toast.success("Cover photo updated");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      deleteTrip(tripId);
      toast.success("Trip deleted");
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-6xl space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-soft shadow-sm overflow-hidden">
            <CardHeader className="bg-soft/30 border-b border-soft pb-6">
              <CardTitle className="font-display text-xl font-bold text-ink">Cover Photo</CardTitle>
              <CardDescription>Upload a cover image for your trip.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              {trip.coverImageUrl && (
                <img
                  src={trip.coverImageUrl}
                  alt="Trip cover"
                  className="w-full h-40 object-cover rounded-xl mb-4 border border-soft"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <ImagePlus className="w-4 h-4" />
                {uploading ? 'Uploading...' : trip.coverImageUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-soft shadow-sm overflow-hidden">
            <CardHeader className="bg-soft/30 border-b border-soft pb-6">
              <CardTitle className="font-display text-xl font-bold text-ink">General Information</CardTitle>
              <CardDescription>Update the core details of your trip.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-3">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted font-bold">Trip Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="h-12 text-lg font-bold border-soft focus:ring-ink rounded-xl"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted font-bold">Destination</Label>
                <Input 
                  value={formData.destination} 
                  onChange={(e) => setFormData({...formData, destination: e.target.value})} 
                  className="h-12 border-soft focus:ring-ink rounded-xl"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted font-bold">Start Date</Label>
                  <Input 
                    type="date"
                    value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                    className="h-12 border-soft focus:ring-ink rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted font-bold">End Date</Label>
                  <Input 
                    type="date"
                    value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                    className="h-12 border-soft focus:ring-ink rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t border-soft bg-soft/10 py-4">
               <p className="text-xs text-muted italic">Last updated just now</p>
               <Button onClick={handleUpdate} className="bg-ink text-cream hover:bg-ink/90 rounded-xl px-6">Save Changes</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Danger Zone Column */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-red-200 bg-red-50/50 overflow-hidden">
            <div className="p-6 border-b border-red-100 bg-red-100/50">
               <div className="flex items-center gap-3 text-red-700 mb-2">
                  <div className="p-2 bg-red-200/50 rounded-lg">
                     <Trash2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold font-display text-lg">Danger Zone</h3>
               </div>
               <p className="text-sm text-red-600/80 leading-relaxed">
                  Irreversible actions. Please be certain before proceeding.
               </p>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="space-y-3">
                  <h4 className="font-bold text-ink text-sm">Delete this trip</h4>
                  <p className="text-xs text-muted">
                     Once you delete a trip, there is no going back. Please be certain.
                  </p>
                  <Button 
                     variant="outline" 
                     className="w-full border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300" 
                     onClick={handleDelete}
                  >
                     Delete Trip
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
