"use client";

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { fetchUserProfile } from '@/lib/userApi';
import type { Trip } from '@/lib/types';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Pencil, Check, X, MapPin, Calendar, UserCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ProfilePage() {
  return (
    <AppLayout>
      <ProfileContent />
    </AppLayout>
  );
}

function ProfileContent() {
  const { user, isLoading, updateUser, uploadProfileImage } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserProfile().then(({ trips }) => setTrips(trips)).catch(() => {});
  }, []);

  const displayName = user ? (user.displayName || user.name) : '';

  const startEditing = () => {
    setEditName(displayName);
    setEditBio(user?.bio ?? '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError('');
  };

  const saveEditing = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await updateUser({ displayName: editName, bio: editBio });
      setIsEditing(false);
    } catch {
      setSaveError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
    setIsUploading(true);
    try {
      await uploadProfileImage(file, type);
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-dashed border-ink/10 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-soft shrink-0" />
            <div className="space-y-2">
              <div className="h-3 bg-soft rounded w-24" />
              <div className="h-10 bg-soft rounded w-56" />
              <div className="h-4 bg-soft rounded w-40" />
            </div>
          </div>
          <div className="h-8 bg-soft rounded w-20 shrink-0" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-soft rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-soft rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24 space-y-4">
        <p className="text-muted text-lg">Could not load your profile.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const initials = (user.name || '')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const avatarSrc = user.avatarUrl || user.profileImageURL;

  const userTrips = trips.filter(
    (t) => t.ownerId === user.id || t.participantIds.includes(user.id)
  );
  const ownedTrips = userTrips.filter((t) => t.ownerId === user.id);
  const memberTrips = userTrips.filter((t) => t.ownerId !== user.id);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Editorial header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-dashed border-ink/10 pb-8">
        <div className="flex items-center gap-6">
          {/* Avatar with optional edit overlay */}
          <div className="relative shrink-0">
            <Avatar className="w-20 h-20 shadow-md text-2xl">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="bg-coral text-cream font-display font-bold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors border-2 border-white disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'profile');
                e.target.value = '';
              }}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-coral font-bold uppercase tracking-widest text-xs">
              <UserCircle className="w-4 h-4" /> Your Profile
            </div>
            {isEditing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-4xl md:text-5xl font-display font-black text-ink bg-transparent border-b-2 border-coral focus:outline-none w-full leading-tight"
              />
            ) : (
              <h1 className="text-4xl md:text-5xl font-display font-black text-ink leading-tight">
                {displayName}
              </h1>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted">
              {user.username && <span>@{user.username}</span>}
              <span>{user.email}</span>
            </div>
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={2}
                placeholder="Add a bio..."
                className="text-sm text-muted bg-transparent border-b border-soft focus:outline-none w-full resize-none mt-1"
              />
            ) : (
              <>
                {user.bio && <p className="text-sm text-muted">{user.bio}</p>}
                {user.description && <p className="text-sm text-muted">{user.description}</p>}
              </>
            )}
            {saveError && <p className="text-xs text-red-500 mt-1">{saveError}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button size="sm" variant="outline" onClick={cancelEditing} className="gap-1">
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={saveEditing} disabled={isSaving} className="gap-1">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={startEditing} className="gap-1">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Trips', value: userTrips.length },
          { label: 'Owned', value: ownedTrips.length },
          { label: 'Member', value: memberTrips.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-soft rounded-xl py-4 text-center shadow-sm"
          >
            <div className="text-4xl font-display font-black text-ink tracking-tight">{value}</div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Trips section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-muted">Your Trips</h3>
        </div>

        {userTrips.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-soft rounded-2xl">
            <p className="text-muted mb-4">You haven&apos;t joined any trips yet.</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-soft border border-soft rounded-2xl overflow-hidden bg-white">
            {userTrips.map((trip) => {
              const role = trip.ownerId === user.id ? 'Owner' : 'Member';
              return (
                <Link key={trip.id} href={`/trip/${trip.id}/overview`} className="flex items-center gap-4 px-5 py-4 hover:bg-soft/40 transition-colors group">
                  {/* Cover thumbnail */}
                  {trip.coverImageUrl ? (
                    <img
                      src={trip.coverImageUrl}
                      alt={trip.name}
                      className="w-20 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-coral/20 to-ink/10 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-coral">
                        {trip.destination.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink group-hover:text-coral transition-colors truncate">
                      {trip.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {trip.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(trip.startDate), 'MMM d')}
                        {' – '}
                        {format(new Date(trip.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Role badge */}
                  <Badge variant={role === 'Owner' ? 'coral' : 'default'} className="shrink-0">
                    {role}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
