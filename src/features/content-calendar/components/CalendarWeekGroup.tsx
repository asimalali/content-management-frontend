import { CalendarEntryCard } from './CalendarEntryCard';
import type { CalendarEntry } from '../types';

interface CalendarWeekGroupProps {
  weekLabel: string;
  dateRange: string;
  entries: CalendarEntry[];
  onViewContent?: (entry: CalendarEntry) => void;
}

export function CalendarWeekGroup({ weekLabel, dateRange, entries, onViewContent }: CalendarWeekGroupProps) {
  const ideaCount = entries.filter((e) => e.status === 'Idea').length;
  const generatedCount = entries.filter((e) => e.status === 'ContentGenerated' || e.status === 'Published').length;

  return (
    <div className="mb-6">
      {/* Week Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{weekLabel}</h3>
          <p className="text-xs text-gray-500">{dateRange}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">{entries.length} محتوى</span>
          {generatedCount > 0 && (
            <span className="px-2 py-1 bg-green-100 rounded text-green-700">{generatedCount} جاهز</span>
          )}
          {ideaCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">{ideaCount} فكرة</span>
          )}
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {entries.map((entry) => (
          <CalendarEntryCard key={entry.id} entry={entry} onViewContent={onViewContent} />
        ))}
      </div>
    </div>
  );
}
