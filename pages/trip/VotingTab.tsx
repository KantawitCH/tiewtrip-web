import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Icons } from '../../components/Icons';
import { Badge } from '../../components/Badge';
import { VotingSession } from '../../types';

interface VotingTabProps {
  votes: VotingSession[];
  currentUserId: string;
  canEdit: boolean;
  onCreateVote: () => void;
  onCastVote: (voteId: string, optionId: string) => void;
  onFinalizeVote: (voteId: string) => void;
}

export const VotingTab: React.FC<VotingTabProps> = ({
  votes,
  currentUserId,
  canEdit,
  onCreateVote,
  onCastVote,
  onFinalizeVote,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
        <div>
          <h3 className="font-bold text-indigo-900">Need to make a decision?</h3>
          <p className="text-sm text-indigo-700">Create a poll to decide on activities, dates, or restaurants.</p>
        </div>
        <Button onClick={onCreateVote} className="bg-indigo-600 hover:bg-indigo-700 text-white border-transparent">Create Vote</Button>
      </div>

      {votes.length === 0 && <p className="text-center text-slate-500 py-8">No active votes.</p>}

      {votes.map((vote) => (
        <Card key={vote.id} className={`p-6 ${vote.status === 'completed' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-slate-900">{vote.title}</h3>
                {vote.status === 'completed' && <Badge variant="green">FINALIZED</Badge>}
                {vote.status === 'active' && <Badge variant="blue">ACTIVE</Badge>}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Icons.Clock className="w-3 h-3" /> Deadline: {vote.deadline}
              </p>
            </div>
            {canEdit && vote.status === 'active' && (
              <Button variant="outline" className="h-8 text-xs" onClick={() => onFinalizeVote(vote.id)}>Finalize</Button>
            )}
          </div>
          <div className="space-y-3">
            {vote.options.map(option => {
              const totalVotes = vote.options.reduce((acc, o) => acc + o.votes.length, 0);
              const percentage = totalVotes === 0 ? 0 : Math.round((option.votes.length / totalVotes) * 100);
              const isWinner = vote.status === 'completed' && vote.winningOptionId === option.id;
              const hasVoted = option.votes.includes(currentUserId);
              return (
                <div
                  key={option.id}
                  onClick={() => vote.status === 'active' && onCastVote(vote.id, option.id)}
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${isWinner ? 'border-green-500 bg-green-50' : hasVoted ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="absolute top-0 left-0 bottom-0 bg-slate-200/50 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                  <div className="relative flex justify-between items-center">
                    <span className={`font-medium ${isWinner ? 'text-green-900' : 'text-slate-900'}`}>{option.text}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1.5">
                        {option.votes.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-slate-300 border border-white"></div>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-slate-600">{option.votes.length}</span>
                      {isWinner && <Icons.Check className="w-5 h-5 text-green-600" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};
