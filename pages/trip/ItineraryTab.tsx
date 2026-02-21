import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Icons } from '../../components/Icons';
import { EmptyState } from '../../components/EmptyState';
import { TripActivity } from '../../types';

interface ItineraryTabProps {
  groupedItinerary: { date: string; activities: TripActivity[] }[];
  canEdit: boolean;
  onAddActivity: (defaultDate?: string, activity?: TripActivity) => void;
  onDeleteActivity: (activityId: string) => void;
}

export const ItineraryTab: React.FC<ItineraryTabProps> = ({
  groupedItinerary,
  canEdit,
  onAddActivity,
  onDeleteActivity,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {groupedItinerary.length === 0 && (
        <EmptyState
          icon={<Icons.Calendar className="w-8 h-8 text-slate-400" />}
          title="Itinerary is empty"
          description="Start planning your adventure by adding places to visit on specific dates."
          action={<Button onClick={() => onAddActivity()}>Add Your First Place</Button>}
        />
      )}

      {groupedItinerary.map((group) => (
        <div key={group.date} className="relative pl-8 border-l-2 border-slate-200 pb-8 last:pb-0 last:border-0">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 ring-4 ring-[#F5F5F7]"></div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {new Date(group.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <span className="text-xs text-slate-400 font-medium">{group.activities.length} Activities</span>
            </div>
            {canEdit && (
              <Button variant="ghost" className="h-8 text-xs gap-1" onClick={() => onAddActivity(group.date)}>
                <Icons.Plus className="w-3 h-3" /> Add Place
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {group.activities.map((act) => {
              const isDifferentEndDay = act.endDate !== act.startDate;
              return (
                <Card key={act.id} className="h-40 p-4 group relative hover:border-slate-300 transition-colors">
                  <div className="flex gap-4 h-full">
                    <div className="w-20 pt-1 flex flex-col items-end gap-1 shrink-0 border-r border-slate-100 pr-4">
                      <span className="text-sm font-bold text-slate-900">{act.startTime || '--:--'}</span>
                      {act.endTime && (
                        <span className={`text-xs ${isDifferentEndDay ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                          {act.endTime}
                          {isDifferentEndDay && (
                            <span className="block text-[9px] opacity-80 leading-tight mt-0.5">
                              {new Date(act.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 truncate pr-8">{act.activity}</h4>
                        {canEdit && (
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => onAddActivity(undefined, act)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Icons.Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => onDeleteActivity(act.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Icons.Trash className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {act.location && (
                          <p className="text-sm text-slate-600 mb-1 flex items-center gap-1"><Icons.MapPin className="w-3 h-3" /> {act.location}</p>
                        )}
                        {act.googleMapsUrl && (
                          <a href={act.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1 mb-2">
                            <Icons.ExternalLink className="w-3 h-3" /> View on Maps
                          </a>
                        )}
                        {act.note && (
                          <div className="text-xs bg-amber-50 text-amber-900 px-2 py-1.5 rounded border border-amber-100">
                            {act.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
