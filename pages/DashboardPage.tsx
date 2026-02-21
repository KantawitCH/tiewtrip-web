import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { Select } from '../components/Select';
import { Icons } from '../components/Icons';
import { Modal } from '../components/Modal';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { generateTripItinerary } from '../services/geminiService';
import { Trip, Currency } from '../types';
import { useModal } from '../hooks/useModal';
import { SectionHeader } from '../components/SectionHeader';
import { AvatarGroup } from '../components/AvatarGroup';

export const DashboardPage: React.FC = () => {
  const { trips, addTrip, user } = useAuth();
  const navigate = useNavigate();
  const createTripModal = useModal();

  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const plan = await generateTripItinerary(destination);

    const tripDuration = plan ? plan.days.length : 3;
    const startDate = new Date();

    const newTrip: Trip = {
      id: Date.now().toString(),
      title: plan?.tripTitle || `${destination} Adventure`,
      description: description || plan?.tripDescription || 'No description provided.',
      destination: destination,
      currency: currency,
      dates: `${tripDuration} Days Trip`,
      imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
      participants: user ? [{ userId: user.id, name: user.name, avatarUrl: user.avatarUrl, role: 'Owner' }] : [],
      votes: [],
      enabledModules: [],
      vehicles: [],
      bills: [],
      notifications: [{
        id: Date.now().toString(),
        title: 'Trip Created',
        message: 'Your trip workspace is ready.',
        type: 'success',
        timestamp: 'Just now'
      }],
      itinerary: plan ? plan.days.map((day, idx) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + idx);
        const dateStr = d.toISOString().split('T')[0];
        return {
          id: `d-${Date.now()}-${idx}`,
          date: dateStr,
          activities: day.activities.map((act, aIdx) => ({
            id: `a-${Date.now()}-${idx}-${aIdx}`,
            startDate: dateStr,
            startTime: act.time,
            endDate: dateStr,
            endTime: act.time,
            activity: act.description,
            location: act.location
          }))
        };
      }) : Array.from({ length: tripDuration }).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        return {
          id: `d-${Date.now()}-${i}`,
          date: dateStr,
          activities: []
        };
      })
    };

    if (newTrip.itinerary.length > 0) {
      const start = new Date(newTrip.itinerary[0].date);
      const end = new Date(newTrip.itinerary[newTrip.itinerary.length - 1].date);
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      newTrip.dates = `${startStr} - ${endStr}`;
    }

    addTrip(newTrip);
    createTripModal.close();
    setDestination('');
    setDescription('');
    setIsGenerating(false);
  };

  return (
    <Layout>
      <SectionHeader
        title="Dashboard"
        subtitle="Manage your upcoming adventures."
        className="mb-8"
        action={
          <Button onClick={createTripModal.open} className="gap-2 shadow-lg shadow-slate-900/10">
            <Icons.Plus className="w-5 h-5" />
            New Trip
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <Card
            key={trip.id}
            className="group flex flex-col h-full"
            onClick={() => navigate(`/trip/${trip.id}`)}
          >
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img
                src={trip.imageUrl}
                alt={trip.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-bold text-lg leading-tight">{trip.title}</h3>
                <div className="flex items-center gap-1 text-sm text-white/90 mt-1">
                  <Icons.MapPin className="w-3 h-3" />
                  {trip.destination}
                </div>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                  <Icons.Calendar className="w-3.5 h-3.5" />
                  {trip.dates}
                </div>
                {trip.notifications.length > 0 && (
                  <div className="mb-4 bg-orange-50 border border-orange-100 rounded-lg p-2.5 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></span>
                    <div>
                      <p className="text-xs font-medium text-orange-900">{trip.notifications[0].title}</p>
                      <p className="text-[10px] text-orange-700 mt-0.5 line-clamp-1">{trip.notifications[0].message}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>{trip.participants.length} Travelers</span>
                  <span>{trip.votes.filter(v => v.status === 'active').length} Active Votes</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                <AvatarGroup
                  avatars={trip.participants.map(p => ({ src: p.avatarUrl, alt: p.name }))}
                  max={3}
                  size="md"
                />
                <span className="text-sm font-medium text-slate-900 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View
                  <Icons.ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Card>
        ))}

        {/* New Trip Placeholder Card */}
        <button
          onClick={createTripModal.open}
          className="flex flex-col items-center justify-center h-[340px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-600 gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Icons.Plus className="w-6 h-6" />
          </div>
          <span className="font-medium">Plan a new trip</span>
        </button>
      </div>

      <Modal
        isOpen={createTripModal.isOpen}
        onClose={createTripModal.close}
        title="Start a New Adventure"
      >
        <form onSubmit={handleCreateTrip} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <Input
                label="Destination"
                type="text"
                placeholder="e.g. Paris"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <div className="col-span-1">
              <Select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="CHF">CHF (Fr)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="GBP">GBP (£)</option>
                <option value="THB">THB (฿)</option>
              </Select>
            </div>
          </div>
          <div>
            <TextArea
              label="Description"
              placeholder="Briefly describe the goal of this trip..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-slate-400 mt-2">
              * The duration and itinerary will be automatically generated based on the destination.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={createTripModal.close} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth disabled={isGenerating}>
              {isGenerating ? 'Generating Plan...' : 'Create Trip'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
