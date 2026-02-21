import React, { useRef } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { useAuth } from '../App';
import { Icons } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../hooks/useModal';
import { useForm } from '../hooks/useForm';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';

export const ProfilePage: React.FC = () => {
  const { user, trips, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const editModal = useModal();
  const avatarModal = useModal();
  const viewAvatarModal = useModal();
  const coverModal = useModal();
  const viewCoverModal = useModal();

  const { values: formData, setValue: setFormValue, resetWith: resetFormWith } = useForm({
    name: '',
    description: ''
  });

  if (!user) return null;

  const handleEditClick = () => {
    resetFormWith({ name: user.name, description: user.description || '' });
    editModal.open();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ ...user, name: formData.name, description: formData.description });
    editModal.close();
  };

  const handleAvatarUploadClick = () => {
    avatarFileInputRef.current?.click();
    avatarModal.close();
  };

  const handleCoverUploadClick = () => {
    coverFileInputRef.current?.click();
    coverModal.close();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          updateUser({ ...user, avatarUrl: reader.result as string });
        } else {
          updateUser({ ...user, coverUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header (Cover Photo) */}
        <div className="relative mb-8 group">
          <div
            className="h-48 rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 w-full overflow-hidden cursor-pointer relative shadow-sm"
            onClick={coverModal.open}
          >
            {user.coverUrl ? (
              <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
                <Icons.Plus className="w-12 h-12 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <div className="flex flex-col items-center gap-2 text-white">
                <Icons.Edit className="w-8 h-8" />
                <span className="text-sm font-medium">Edit Cover Photo</span>
              </div>
            </div>
          </div>
          <input
            type="file"
            ref={coverFileInputRef}
            onChange={(e) => handleFileChange(e, 'cover')}
            className="hidden"
            accept="image/*"
          />

          {/* Avatar Photo */}
          <div className="absolute -bottom-12 left-8 flex items-end">
            <div
              className="p-1 bg-white rounded-full cursor-pointer hover:opacity-90 transition-opacity relative group/avatar shadow-md"
              onClick={avatarModal.open}
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-32 h-32 rounded-full border-2 border-white bg-slate-50 object-cover"
              />
              <div className="absolute inset-1 rounded-full bg-black/20 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <Icons.Edit className="w-8 h-8 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={avatarFileInputRef}
              onChange={(e) => handleFileChange(e, 'avatar')}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Edit Profile Button */}
          <div className="absolute bottom-4 right-8">
            <Button
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md shadow-lg"
              onClick={handleEditClick}
            >
              <Icons.Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            </div>

            {user.description && (
              <div className="prose prose-sm text-slate-600">
                <p className="whitespace-pre-wrap">{user.description}</p>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard value={trips.length} label="Trips" />
                <StatCard value={12} label="Countries" />
              </div>
            </div>

            <Button variant="outline" fullWidth className="text-red-600 hover:bg-red-50 border-red-100 transition-colors" onClick={logout}>
              <Icons.LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Recent Adventures
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{trips.length}</span>
            </h2>
            <div className="space-y-4">
              {trips.map(trip => (
                <Card key={trip.id} className="flex flex-col sm:flex-row p-4 gap-4 items-center group">
                  <div className="w-full sm:w-32 h-32 sm:h-24 shrink-0 overflow-hidden rounded-xl">
                    <img src={trip.imageUrl} alt={trip.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{trip.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{trip.description}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Icons.Calendar className="w-3.5 h-3.5" /> {trip.dates}</span>
                      <span className="flex items-center gap-1"><Icons.MapPin className="w-3.5 h-3.5" /> {trip.destination}</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="shrink-0 h-10 px-6"
                    onClick={() => navigate(`/trip/${trip.id}`)}
                  >
                    View
                  </Button>
                </Card>
              ))}
              {trips.length === 0 && (
                <EmptyState
                  icon={<Icons.MapPin className="w-12 h-12 text-slate-200" />}
                  description="No trips planned yet."
                  action={
                    <Button variant="ghost" className="text-slate-900" onClick={() => navigate('/dashboard')}>
                      Start planning your first trip
                    </Button>
                  }
                  className="rounded-3xl border-2"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Photo Actions Modal */}
      <Modal isOpen={avatarModal.isOpen} onClose={avatarModal.close} title="Profile Photo">
        <div className="space-y-3">
          <Button variant="outline" fullWidth onClick={() => { viewAvatarModal.open(); avatarModal.close(); }} className="gap-2">
            <Icons.Search className="w-4 h-4" /> View Photo
          </Button>
          <Button variant="primary" fullWidth onClick={handleAvatarUploadClick} className="gap-2">
            <Icons.Plus className="w-4 h-4" /> Upload New Photo
          </Button>
        </div>
      </Modal>

      {/* View Avatar Large Modal */}
      <Modal isOpen={viewAvatarModal.isOpen} onClose={viewAvatarModal.close} title="Profile Picture">
        <div className="flex justify-center p-2">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full aspect-square max-w-xs rounded-2xl object-cover border border-slate-100 shadow-xl"
          />
        </div>
      </Modal>

      {/* Cover Photo Actions Modal */}
      <Modal isOpen={coverModal.isOpen} onClose={coverModal.close} title="Cover Photo">
        <div className="space-y-3">
          {user.coverUrl && (
            <Button variant="outline" fullWidth onClick={() => { viewCoverModal.open(); coverModal.close(); }} className="gap-2">
              <Icons.Search className="w-4 h-4" /> View Photo
            </Button>
          )}
          <Button variant="primary" fullWidth onClick={handleCoverUploadClick} className="gap-2">
            <Icons.Plus className="w-4 h-4" /> Upload New Photo
          </Button>
        </div>
      </Modal>

      {/* View Cover Large Modal */}
      <Modal isOpen={viewCoverModal.isOpen} onClose={viewCoverModal.close} title="Cover Picture">
        <div className="p-2">
          <img
            src={user.coverUrl}
            alt="Cover Large"
            className="w-full rounded-2xl object-cover border border-slate-100 shadow-xl"
          />
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Profile">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div
            className="relative h-28 w-full rounded-xl bg-slate-100 overflow-hidden cursor-pointer group"
            onClick={handleCoverUploadClick}
          >
            {user.coverUrl ? (
              <img src={user.coverUrl} className="w-full h-full object-cover" alt="Cover Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Icons.Plus className="w-6 h-6" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-xs font-bold">Change Cover</span>
            </div>
          </div>

          <Input
            label="Username"
            value={formData.name}
            onChange={e => setFormValue('name', e.target.value)}
            required
            placeholder="Choose a display name"
          />

          <TextArea
            label="Description"
            value={formData.description}
            onChange={e => setFormValue('description', e.target.value)}
            rows={4}
            placeholder="Tell us about your travel style and experiences..."
          />
          <div className="pt-2">
            <Button type="submit" fullWidth className="h-12 text-base">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
