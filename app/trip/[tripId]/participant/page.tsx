"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTripStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ParticipantsPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const trip = useTripStore((state) => state.trips.find((t) => t.id === tripId));
  const participants = useTripStore((state) => state.participants).filter((p) => p.tripId === tripId);
  const addParticipant = useTripStore((state) => state.addParticipant);
  const removeParticipant = useTripStore((state) => state.removeParticipant);
  const currentUserId = useTripStore((state) => state.currentUserId);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  if (!trip) return null;

  const currentUserRole = participants.find(p => p.id === currentUserId)?.role;
  const canInvite = currentUserRole === 'Owner' || currentUserRole === 'Admin';

  const handleAddParticipant = () => {
    if (!newParticipantName) return;
    addParticipant({
      tripId,
      name: newParticipantName,
      role: 'Member'
    });
    setNewParticipantName('');
    setIsInviteOpen(false);
    toast.success(`${newParticipantName} added to trip`);
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Remove ${name} from the trip?`)) {
      removeParticipant(id);
      toast.success("Participant removed");
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/trip/${tripId}/join`; // Mock link
    navigator.clipboard.writeText(link);
    setInviteLinkCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setInviteLinkCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl space-y-8 pb-12">
      {/* Participants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {participants.map((participant) => (
          <Card key={participant.id} className="group border-soft hover:border-coral/40 hover:shadow-lg hover:shadow-coral/5 transition-all duration-300 overflow-hidden">
            <div className="p-6 flex items-start justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-coral/15 text-coral flex items-center justify-center font-display font-black text-2xl">
                     {participant.name.charAt(0)}
                  </div>
                  <div>
                     <h3 className="font-bold text-xl text-ink mb-1">{participant.name}</h3>
                     <div className="flex flex-col gap-1">
                        <Badge variant={participant.role === 'Owner' ? 'coral' : 'default'} className="w-fit text-[10px] uppercase tracking-wider font-bold">
                           {participant.role}
                        </Badge>
                        <p className="text-xs text-muted truncate max-w-[140px]">{participant.email || 'No email added'}</p>
                     </div>
                  </div>
               </div>
               
               {participant.role !== 'Owner' && (
                  <Button 
                     variant="ghost" 
                     size="icon"
                     className="text-muted hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                     onClick={() => handleRemove(participant.id, participant.name)}
                  >
                     <Trash2 className="w-4 h-4" />
                  </Button>
               )}
            </div>
          </Card>
        ))}
        
        {/* Empty State / Add Card */}
        {canInvite && (
          <button onClick={() => setIsInviteOpen(true)} className="group border-2 border-dashed border-soft rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-coral/50 hover:bg-coral/5 transition-all duration-300 min-h-[140px]">
             <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center group-hover:bg-coral transition-colors shadow-sm">
                <UserPlus className="w-5 h-5 text-coral group-hover:text-white" />
             </div>
             <span className="font-bold text-coral">Add another traveler</span>
          </button>
        )}
      </div>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Invite to trip</DialogTitle>
            <DialogDescription>Share this link to invite others to join.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <input
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/trip/${tripId}/join`}
              className="flex-1 text-sm border border-soft rounded-lg px-3 py-2 bg-paper text-muted truncate"
            />
            <Button
              variant="outline"
              onClick={copyInviteLink}
              className="flex items-center gap-2 shrink-0"
            >
              {inviteLinkCopied ? <Check className="w-4 h-4 text-mint" /> : <Copy className="w-4 h-4" />}
              {inviteLinkCopied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
