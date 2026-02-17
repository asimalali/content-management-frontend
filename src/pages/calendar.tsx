import { useState, useMemo } from 'react';
import { CalendarDays, Plus, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useProjects } from '@/features/projects';
import {
  useProjectCalendars,
  useCalendarDetail,
  useDeleteCalendar,
  CalendarGenerateDialog,
  CalendarWeekGroup,
  EntryContentDialog,
} from '@/features/content-calendar';
import type { CalendarEntry, ContentCalendarSummary } from '@/features/content-calendar';
import { formatDateObject } from '@/utils';
import { toast } from 'sonner';

const durationLabels: Record<string, string> = {
  Weekly: 'أسبوعي',
  Monthly: 'شهري',
};

function groupEntriesByWeek(entries: CalendarEntry[]) {
  const weeks: { label: string; dateRange: string; entries: CalendarEntry[] }[] = [];

  if (!entries.length) return weeks;

  const sorted = [...entries].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  let currentWeekStart: Date | null = null;
  let currentWeek: CalendarEntry[] = [];
  let weekIndex = 0;

  for (const entry of sorted) {
    const date = new Date(entry.scheduledDate);
    const dayOfWeek = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    if (!currentWeekStart || weekStart.getTime() !== currentWeekStart.getTime()) {
      if (currentWeek.length > 0 && currentWeekStart) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weeks.push({
          label: `الأسبوع ${weekIndex}`,
          dateRange: `${formatDateObject(currentWeekStart, { month: 'short', day: 'numeric' })} - ${formatDateObject(weekEnd, { month: 'short', day: 'numeric' })}`,
          entries: currentWeek,
        });
      }
      currentWeekStart = weekStart;
      currentWeek = [];
      weekIndex++;
    }

    currentWeek.push(entry);
  }

  if (currentWeek.length > 0 && currentWeekStart) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weeks.push({
      label: `الأسبوع ${weekIndex}`,
      dateRange: `${formatDateObject(currentWeekStart, { month: 'short', day: 'numeric' })} - ${formatDateObject(weekEnd, { month: 'short', day: 'numeric' })}`,
      entries: currentWeek,
    });
  }

  return weeks;
}

function CalendarSummaryCard({
  calendar,
  isExpanded,
  onToggle,
  onDelete,
  isDeleting,
}: {
  calendar: ContentCalendarSummary;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const date = new Date(calendar.createdAt);
  const dateStr = formatDateObject(date, { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{calendar.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{dateStr}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {durationLabels[calendar.duration] || calendar.duration}
              </span>
              <span className="text-xs text-gray-400">
                {calendar.contentGeneratedCount}/{calendar.entryCount} جاهز
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
    </div>
  );
}

function CalendarDetailView({ calendarId }: { calendarId: string }) {
  const { data: calendarData, isLoading } = useCalendarDetail(calendarId);
  const [viewEntry, setViewEntry] = useState<CalendarEntry | null>(null);

  const calendar = calendarData?.data;

  const weeks = useMemo(() => {
    if (!calendar?.entries) return [];
    return groupEntriesByWeek(calendar.entries);
  }, [calendar?.entries]);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
      </div>
    );
  }

  if (!calendar) return null;

  return (
    <div className="p-4 border-t bg-gray-50">
      {weeks.map((week, i) => (
        <CalendarWeekGroup
          key={i}
          weekLabel={week.label}
          dateRange={week.dateRange}
          entries={week.entries}
          onViewContent={(entry) => setViewEntry(entry)}
        />
      ))}

      <EntryContentDialog
        isOpen={!!viewEntry}
        onClose={() => setViewEntry(null)}
        entry={viewEntry}
      />
    </div>
  );
}

export default function CalendarPage() {
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [expandedCalendarId, setExpandedCalendarId] = useState<string | null>(null);

  const projects = projectsData ?? [];

  const { data: calendarsData, isLoading: isLoadingCalendars } = useProjectCalendars(
    selectedProjectId || undefined
  );

  const deleteMutation = useDeleteCalendar();
  const calendars = calendarsData?.data ?? [];

  const handleDelete = async (calendarId: string) => {
    try {
      await deleteMutation.mutateAsync(calendarId);
      if (expandedCalendarId === calendarId) setExpandedCalendarId(null);
      toast.success('تم حذف التقويم');
    } catch {
      toast.error('فشل في حذف التقويم');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تقويم المحتوى</h1>
          <p className="text-sm text-gray-500 mt-1">خطط محتواك بالذكاء الاصطناعي</p>
        </div>
      </div>

      {/* Project Selector */}
      <div className="mb-6 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">المشروع</label>
          {isLoadingProjects ? (
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setExpandedCalendarId(null);
              }}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">اختر مشروعاً...</option>
              {projects.map((project: { id: string; name: string }) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => setShowGenerateDialog(true)}
          disabled={!selectedProjectId}
          className="h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إنشاء تقويم
        </button>
      </div>

      {/* Calendars List */}
      {!selectedProjectId ? (
        <div className="text-center py-16">
          <CalendarDays className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">اختر مشروعاً لعرض التقويمات</p>
        </div>
      ) : isLoadingCalendars ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
        </div>
      ) : calendars.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">لا توجد تقويمات لهذا المشروع</p>
          <button
            onClick={() => setShowGenerateDialog(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إنشاء تقويم جديد
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {calendars.map((calendar: ContentCalendarSummary) => (
            <div key={calendar.id}>
              <CalendarSummaryCard
                calendar={calendar}
                isExpanded={expandedCalendarId === calendar.id}
                onToggle={() =>
                  setExpandedCalendarId(expandedCalendarId === calendar.id ? null : calendar.id)
                }
                onDelete={() => handleDelete(calendar.id)}
                isDeleting={deleteMutation.isPending}
              />
              {expandedCalendarId === calendar.id && (
                <CalendarDetailView calendarId={calendar.id} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generate Dialog */}
      {selectedProjectId && (
        <CalendarGenerateDialog
          isOpen={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
          projectId={selectedProjectId}
        />
      )}
    </div>
  );
}
