import React from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Participant } from '../../types';
import { BadgeVariant } from '../../components/Badge';

interface ParticipantsTabProps {
  participants: Participant[];
  onInvite: () => void;
}

const roleBadgeVariant: Record<string, BadgeVariant> = {
  Owner: 'indigo',
  Admin: 'purple',
  Viewer: 'slate',
};

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({ participants, onInvite }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {participants.map((p) => (
        <Card key={p.userId} className="p-4 flex items-center gap-4">
          <img src={p.avatarUrl} alt={p.name} className="w-12 h-12 rounded-full border border-slate-100" />
          <div>
            <h3 className="font-bold text-slate-900">{p.name}</h3>
            <Badge variant={roleBadgeVariant[p.role] ?? 'slate'} className="mt-1">
              {p.role}
            </Badge>
          </div>
        </Card>
      ))}
      <button
        onClick={onInvite}
        className="flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium"
      >
        + Invite Friend
      </button>
    </div>
  );
};
