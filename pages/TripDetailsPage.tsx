import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { Select } from '../components/Select';
import { Icons } from '../components/Icons';
import { Modal } from '../components/Modal';
import { useAuth } from '../App';
import { TripActivity, VoteOption, ModuleType, Vehicle, Bill, SplitMethod, TripDay } from '../types';
import { useModal } from '../hooks/useModal';
import { useForm } from '../hooks/useForm';
import { NotificationItem } from '../components/NotificationItem';
import { Card } from '../components/Card';
import { ItineraryTab } from './trip/ItineraryTab';
import { ParticipantsTab } from './trip/ParticipantsTab';
import { VotingTab } from './trip/VotingTab';
import { VehicleTab } from './trip/VehicleTab';
import { FinanceTab } from './trip/FinanceTab';

type Tab = 'itinerary' | 'participants' | 'voting' | 'vehicle' | 'finance';

export const TripDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, user, updateTrip } = useAuth();

  const trip = trips.find(t => t.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');

  // Modals
  const activityModal = useModal();
  const voteModal = useModal();
  const inviteModal = useModal();
  const moduleModal = useModal();
  const vehicleModal = useModal();
  const billModal = useModal();

  // Form State for Activity (useForm — 8 flat string fields)
  const [editingActivity, setEditingActivity] = useState<TripActivity | null>(null);
  const { values: activityForm, setValue: setActivityValue, resetWith: resetActivityWith } = useForm({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    activity: '',
    location: '',
    googleMapsUrl: '',
    note: ''
  });

  // Form State for Vote (keep as-is — array options)
  const [voteForm, setVoteForm] = useState({
    title: '',
    deadline: '',
    options: ['', '']
  });

  // Form State for Vehicle (keep as-is — number + string[] checkboxes)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<Omit<Vehicle, 'id'>>({
    name: '',
    capacity: 4,
    startLocation: '',
    passengerIds: []
  });

  // Form State for Bill (keep as-is — nested sub-forms)
  const [billForm, setBillForm] = useState<Omit<Bill, 'id'>>({
    title: '',
    amount: 0,
    paidByUserId: user?.id || '',
    splitMethod: 'equal',
    involvedUserIds: [],
    date: new Date().toISOString().split('T')[0],
    isPaid: false,
    items: [],
    manualSplits: []
  });
  const [newItem, setNewItem] = useState({ name: '', amount: 0 });

  // Calculate dynamic data
  const { groupedItinerary, calculatedDuration } = useMemo(() => {
    if (!trip) return { groupedItinerary: [], calculatedDuration: '' };

    const allActivities: TripActivity[] = [];
    trip.itinerary.forEach(day => {
      day.activities.forEach(act => {
        const start = act.startDate || day.date;
        const end = act.endDate || start;
        allActivities.push({ ...act, startDate: start, endDate: end });
      });
    });

    allActivities.sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    const groups: { date: string; activities: TripActivity[] }[] = [];
    allActivities.forEach(act => {
      let group = groups.find(g => g.date === act.startDate);
      if (!group) {
        group = { date: act.startDate, activities: [] };
        groups.push(group);
      }
      group.activities.push(act);
    });

    let durationStr = 'No Dates';
    if (allActivities.length > 0) {
      const dates = allActivities.flatMap(a => [new Date(a.startDate).getTime(), new Date(a.endDate).getTime()]);
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      const start = minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      durationStr = minDate.getTime() === maxDate.getTime()
        ? start + ', ' + maxDate.getFullYear()
        : `${start} - ${end}`;
    }

    return { groupedItinerary: groups, calculatedDuration: durationStr };
  }, [trip]);

  if (!trip) return null;

  const canEdit = trip.participants.find(p => p.userId === user?.id)?.role !== 'Viewer';

  // --- Handlers ---

  const handleOpenActivityModal = (defaultDate?: string, activity?: TripActivity) => {
    if (activity) {
      setEditingActivity(activity);
      resetActivityWith({
        startDate: activity.startDate,
        startTime: activity.startTime || '',
        endDate: activity.endDate,
        endTime: activity.endTime || '',
        activity: activity.activity,
        location: activity.location || '',
        googleMapsUrl: activity.googleMapsUrl || '',
        note: activity.note || ''
      });
    } else {
      setEditingActivity(null);
      const lastDate = groupedItinerary.length > 0
        ? groupedItinerary[groupedItinerary.length - 1].date
        : new Date().toISOString().split('T')[0];
      const start = defaultDate || lastDate;
      resetActivityWith({ startDate: start, startTime: '', endDate: start, endTime: '', activity: '', location: '', googleMapsUrl: '', note: '' });
    }
    activityModal.open();
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    const allActivities: TripActivity[] = [];
    trip.itinerary.forEach(d => {
      d.activities.forEach(a => {
        if (editingActivity && a.id === editingActivity.id) return;
        allActivities.push({ ...a });
      });
    });

    const newActivity: TripActivity = {
      id: editingActivity ? editingActivity.id : `act-${Date.now()}`,
      ...activityForm
    };
    allActivities.push(newActivity);

    const newItinerary: TripDay[] = [];
    const uniqueDates = Array.from(new Set(allActivities.map(a => a.startDate))).sort();
    uniqueDates.forEach(date => {
      const acts = allActivities.filter(a => a.startDate === date);
      acts.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      newItinerary.push({ id: `day-${date}`, date, activities: acts });
    });

    const dates = allActivities.flatMap(a => [new Date(a.startDate).getTime(), new Date(a.endDate).getTime()]);
    let newDateRange = trip.dates;
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      const start = minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      newDateRange = minDate.getTime() === maxDate.getTime()
        ? start + ', ' + maxDate.getFullYear()
        : `${start} - ${end}`;
    } else {
      newDateRange = 'No Dates Planned';
    }

    updateTrip({ ...trip, dates: newDateRange, itinerary: newItinerary });
    activityModal.close();
  };

  const handleDeleteActivity = (actId: string) => {
    const allActivities: TripActivity[] = [];
    trip.itinerary.forEach(d => {
      d.activities.forEach(a => {
        if (a.id !== actId) allActivities.push({ ...a });
      });
    });

    const newItinerary: TripDay[] = [];
    const uniqueDates = Array.from(new Set(allActivities.map(a => a.startDate))).sort();
    uniqueDates.forEach(date => {
      const acts = allActivities.filter(a => a.startDate === date);
      acts.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      newItinerary.push({ id: `day-${date}`, date, activities: acts });
    });

    const dates = allActivities.flatMap(a => [new Date(a.startDate).getTime(), new Date(a.endDate).getTime()]);
    let newDateRange = 'No dates planned';
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      const start = minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      newDateRange = minDate.getTime() === maxDate.getTime()
        ? start + ', ' + maxDate.getFullYear()
        : `${start} - ${end}`;
    }

    updateTrip({ ...trip, itinerary: newItinerary, dates: newDateRange });
  };

  const handleCreateVote = (e: React.FormEvent) => {
    e.preventDefault();
    const newVote = {
      id: `vote-${Date.now()}`,
      title: voteForm.title,
      type: 'general' as const,
      deadline: voteForm.deadline,
      status: 'active' as const,
      options: voteForm.options.filter(o => o.trim()).map((o, i) => ({
        id: `opt-${i}`,
        text: o,
        votes: []
      }))
    };
    updateTrip({ ...trip, votes: [newVote, ...trip.votes] });
    voteModal.close();
    setVoteForm({ title: '', deadline: '', options: ['', ''] });
  };

  const handleCastVote = (voteId: string, optionId: string) => {
    if (!user) return;
    const updatedVotes = trip.votes.map(vote => {
      if (vote.id !== voteId || vote.status === 'completed') return vote;
      const newOptions = vote.options.map(opt => ({
        ...opt,
        votes: opt.votes.filter(uid => uid !== user.id)
      }));
      const targetOpt = newOptions.find(o => o.id === optionId);
      if (targetOpt) targetOpt.votes.push(user.id);
      return { ...vote, options: newOptions };
    });
    updateTrip({ ...trip, votes: updatedVotes });
  };

  const handleFinalizeVote = (voteId: string) => {
    const vote = trip.votes.find(v => v.id === voteId);
    if (!vote) return;
    const winner = vote.options.reduce((prev, current) => (prev.votes.length > current.votes.length) ? prev : current);
    const updatedVotes = trip.votes.map(v => v.id === voteId ? { ...v, status: 'completed' as const, winningOptionId: winner.id } : v);
    updateTrip({
      ...trip,
      votes: updatedVotes,
      notifications: [{
        id: `notif-${Date.now()}`,
        title: 'Decision Reached',
        message: `Voting for "${vote.title}" has ended. Winner: ${winner.text}`,
        type: 'success',
        timestamp: 'Just now'
      }, ...trip.notifications]
    });
  };

  const handleEnableModule = (module: ModuleType) => {
    if (!trip.enabledModules.includes(module)) {
      updateTrip({ ...trip, enabledModules: [...trip.enabledModules, module] });
      setActiveTab(module);
    }
    moduleModal.close();
  };

  const handleOpenVehicleModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleForm({ name: vehicle.name, capacity: vehicle.capacity, startLocation: vehicle.startLocation, passengerIds: vehicle.passengerIds });
    } else {
      setEditingVehicle(null);
      setVehicleForm({ name: '', capacity: 4, startLocation: '', passengerIds: [] });
    }
    vehicleModal.open();
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateTrip({ ...trip, vehicles: trip.vehicles.map(v => v.id === editingVehicle.id ? { ...v, ...vehicleForm } : v) });
    } else {
      updateTrip({ ...trip, vehicles: [...trip.vehicles, { id: `v-${Date.now()}`, ...vehicleForm }] });
    }
    vehicleModal.close();
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const newBill: Bill = {
      id: `b-${Date.now()}`,
      ...billForm,
      amount: billForm.splitMethod === 'item' ? (billForm.items?.reduce((sum, item) => sum + item.amount, 0) || 0) : billForm.amount
    };
    updateTrip({ ...trip, bills: [newBill, ...trip.bills] });
    billModal.close();
  };

  const handleAddBillItem = () => {
    if (newItem.name && newItem.amount > 0) {
      setBillForm({
        ...billForm,
        items: [...(billForm.items || []), {
          id: `bi-${Date.now()}`,
          name: newItem.name,
          amount: newItem.amount,
          assignedUserIds: trip.participants.map(p => p.userId)
        }]
      });
      setNewItem({ name: '', amount: 0 });
    }
  };

  return (
    <Layout>
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden mb-6 h-48 sm:h-56 shadow-sm group">
        <img src={trip.imageUrl} alt={trip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
          <Button
            className="bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 gap-2 transition-all shadow-lg rounded-full px-5 py-2.5"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-lg leading-none">←</span> Back
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 p-6 w-full text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 truncate">{trip.title}</h1>
              <p className="text-white/80 max-w-xl text-sm mb-3 line-clamp-1">{trip.description}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <Icons.MapPin className="w-3.5 h-3.5" /> {trip.destination}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <Icons.Calendar className="w-3.5 h-3.5" /> {calculatedDuration}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-100">
                  Currency: {trip.currency}
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                className="bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 gap-2 transition-all shadow-lg rounded-full px-5 py-2.5"
                onClick={inviteModal.open}
              >
                <Icons.Share className="w-4 h-4" /> Invite
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'itinerary', label: 'Plan & Schedule' },
          { id: 'participants', label: `Participants (${trip.participants.length})` },
          { id: 'voting', label: 'Voting & Decisions' },
          ...(trip.enabledModules.includes('vehicle') ? [{ id: 'vehicle', label: 'Vehicles' }] : []),
          ...(trip.enabledModules.includes('finance') ? [{ id: 'finance', label: 'Finance & Bills' }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
        {canEdit && (
          <button
            onClick={moduleModal.open}
            className="ml-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Add Module"
          >
            <Icons.Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'itinerary' && (
            <ItineraryTab
              groupedItinerary={groupedItinerary}
              canEdit={canEdit}
              onAddActivity={handleOpenActivityModal}
              onDeleteActivity={handleDeleteActivity}
            />
          )}

          {activeTab === 'participants' && (
            <ParticipantsTab
              participants={trip.participants}
              onInvite={inviteModal.open}
            />
          )}

          {activeTab === 'voting' && (
            <VotingTab
              votes={trip.votes}
              currentUserId={user?.id || ''}
              canEdit={canEdit}
              onCreateVote={voteModal.open}
              onCastVote={handleCastVote}
              onFinalizeVote={handleFinalizeVote}
            />
          )}

          {activeTab === 'vehicle' && (
            <VehicleTab
              vehicles={trip.vehicles}
              participants={trip.participants}
              onAddVehicle={() => handleOpenVehicleModal()}
              onEditVehicle={handleOpenVehicleModal}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceTab
              bills={trip.bills}
              currency={trip.currency}
              participants={trip.participants}
              onAddBill={billModal.open}
            />
          )}
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Icons.Bell className="w-5 h-5" />
              Updates
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {trip.notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  title={notif.title}
                  message={notif.message}
                  timestamp={notif.timestamp}
                  type={notif.type}
                />
              ))}
              {trip.notifications.length === 0 && <p className="text-sm text-slate-500">No updates yet.</p>}
            </div>
          </section>

          <Card className="p-5 bg-white border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Trip Summary</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium text-slate-900">{trip.dates}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">Participants</span>
                <span className="font-medium text-slate-900">{trip.participants.length} People</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">Currency</span>
                <span className="font-medium text-slate-900">{trip.currency}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={activityModal.isOpen} onClose={activityModal.close} title={editingActivity ? 'Edit Activity' : 'Add New Place'}>
        <form onSubmit={handleSaveActivity} className="space-y-4">
          <div>
            <Input label="Place / Activity Name" placeholder="e.g. Louvre Museum" required value={activityForm.activity} onChange={e => setActivityValue('activity', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" required value={activityForm.startDate} onChange={e => setActivityValue('startDate', e.target.value)} />
            <Input label="Start Time" type="time" required value={activityForm.startTime} onChange={e => setActivityValue('startTime', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="End Date" type="date" required value={activityForm.endDate} onChange={e => setActivityValue('endDate', e.target.value)} />
            <Input label="End Time" type="time" required value={activityForm.endTime} onChange={e => setActivityValue('endTime', e.target.value)} />
          </div>
          <div>
            <Input label="Location Details" placeholder="Address or area" value={activityForm.location} onChange={e => setActivityValue('location', e.target.value)} />
          </div>
          <div>
            <Input label="Google Maps Link" type="url" placeholder="https://maps.google.com/..." value={activityForm.googleMapsUrl} onChange={e => setActivityValue('googleMapsUrl', e.target.value)} />
          </div>
          <div>
            <TextArea label="Notes" placeholder="Tips, booking numbers, etc." value={activityForm.note} onChange={e => setActivityValue('note', e.target.value)} className="h-24" />
          </div>
          <Button type="submit" fullWidth>{editingActivity ? 'Update Activity' : 'Add to Plan'}</Button>
        </form>
      </Modal>

      <Modal isOpen={voteModal.isOpen} onClose={voteModal.close} title="Create New Vote">
        <form onSubmit={handleCreateVote} className="space-y-4">
          <div>
            <Input label="What are we deciding?" placeholder="e.g. Dinner on Friday" required value={voteForm.title} onChange={e => setVoteForm({ ...voteForm, title: e.target.value })} />
          </div>
          <div>
            <Input label="Voting Deadline" type="datetime-local" required value={voteForm.deadline} onChange={e => setVoteForm({ ...voteForm, deadline: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Options</label>
            <div className="space-y-2">
              {voteForm.options.map((opt, i) => (
                <Input key={i} placeholder={`Option ${i + 1}`} required={i < 2} value={opt} onChange={e => {
                  const newOpts = [...voteForm.options];
                  newOpts[i] = e.target.value;
                  setVoteForm({ ...voteForm, options: newOpts });
                }} />
              ))}
              <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setVoteForm({ ...voteForm, options: [...voteForm.options, ''] })}>+ Add Option</button>
            </div>
          </div>
          <Button type="submit" fullWidth>Start Voting</Button>
        </form>
      </Modal>

      <Modal isOpen={inviteModal.isOpen} onClose={inviteModal.close} title="Invite Friends">
        <div className="text-center space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 break-all text-sm text-slate-600">
            https://tiewtrip.app/join/{trip.id}?token=abc123xyz
          </div>
          <Button fullWidth onClick={() => {
            navigator.clipboard.writeText(`https://tiewtrip.app/join/${trip.id}?token=abc123xyz`);
            inviteModal.close();
          }}>
            Copy Link
          </Button>
          <p className="text-xs text-slate-400">Anyone with this link can view the trip.</p>
        </div>
      </Modal>

      <Modal isOpen={moduleModal.isOpen} onClose={moduleModal.close} title="Add Power Module">
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleEnableModule('vehicle')} disabled={trip.enabledModules.includes('vehicle')} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Icons.Car className="w-8 h-8 text-slate-900 mb-2" />
            <span className="font-bold text-slate-900">Trip Vehicles</span>
          </button>
          <button onClick={() => handleEnableModule('finance')} disabled={trip.enabledModules.includes('finance')} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Icons.CreditCard className="w-8 h-8 text-slate-900 mb-2" />
            <span className="font-bold text-slate-900">Finance</span>
          </button>
        </div>
      </Modal>

      <Modal isOpen={vehicleModal.isOpen} onClose={vehicleModal.close} title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSaveVehicle} className="space-y-4">
          <Input label="Vehicle Name" placeholder="e.g. Red SUV" required value={vehicleForm.name} onChange={e => setVehicleForm({ ...vehicleForm, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Capacity" type="number" min="1" value={vehicleForm.capacity} onChange={e => setVehicleForm({ ...vehicleForm, capacity: parseInt(e.target.value) })} />
            <Input label="Start Location" placeholder="e.g. Airport" value={vehicleForm.startLocation} onChange={e => setVehicleForm({ ...vehicleForm, startLocation: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Passengers</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2">
              {trip.participants.map(p => (
                <label key={p.userId} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300" checked={vehicleForm.passengerIds.includes(p.userId)} onChange={(e) => {
                    if (e.target.checked) setVehicleForm({ ...vehicleForm, passengerIds: [...vehicleForm.passengerIds, p.userId] });
                    else setVehicleForm({ ...vehicleForm, passengerIds: vehicleForm.passengerIds.filter(id => id !== p.userId) });
                  }} />
                  <span className="text-sm font-medium">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" fullWidth>{editingVehicle ? 'Save Changes' : 'Add Vehicle'}</Button>
        </form>
      </Modal>

      <Modal isOpen={billModal.isOpen} onClose={billModal.close} title="Add Expense">
        <form onSubmit={handleCreateBill} className="space-y-4">
          <Input label="Description" placeholder="e.g. Dinner at Pierre's" required value={billForm.title} onChange={e => setBillForm({ ...billForm, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Paid By" value={billForm.paidByUserId} onChange={e => setBillForm({ ...billForm, paidByUserId: e.target.value })}>
              {trip.participants.map(p => (
                <option key={p.userId} value={p.userId}>{p.name}</option>
              ))}
            </Select>
            <Select label="Split Method" value={billForm.splitMethod} onChange={e => setBillForm({ ...billForm, splitMethod: e.target.value as SplitMethod })}>
              <option value="equal">Equal Split</option>
              <option value="manual">Manual Amount</option>
              <option value="item">Itemized</option>
            </Select>
          </div>
          {billForm.splitMethod === 'equal' && (
            <Input label={`Total Amount (${trip.currency})`} type="number" min="0" step="0.01" value={billForm.amount} onChange={e => setBillForm({ ...billForm, amount: parseFloat(e.target.value) })} />
          )}
          {billForm.splitMethod === 'item' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Items</label>
              <div className="flex gap-2">
                <Input placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                <Input type="number" className="w-24" placeholder="0.00" value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: parseFloat(e.target.value) })} />
                <button type="button" onClick={handleAddBillItem} className="bg-slate-900 text-white rounded-xl px-4 py-3">+</button>
              </div>
            </div>
          )}
          <Button type="submit" fullWidth>Record Bill</Button>
        </form>
      </Modal>
    </Layout>
  );
};
