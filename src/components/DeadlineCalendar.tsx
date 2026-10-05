'use client';

import { useState } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';
import { id } from 'date-fns/locale';
import { useWeddingStore } from '../store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DeadlineEvent {
  vendorName: string;
  type: 'DP' | 'Pelunasan';
  date: Date;
}

export default function DeadlineCalendar() {
  const { vendors } = useWeddingStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Filter vendor yang memiliki dueDateDP atau dueDateFinal
  const deadlines: DeadlineEvent[] = [];
  
  vendors.forEach((vendor) => {
    if (vendor.dueDateDP) {
      deadlines.push({
        vendorName: vendor.name,
        type: 'DP',
        date: parseISO(vendor.dueDateDP),
      });
    }
    if (vendor.dueDateFinal) {
      deadlines.push({
        vendorName: vendor.name,
        type: 'Pelunasan',
        date: parseISO(vendor.dueDateFinal),
      });
    }
  });

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Check if date has events
  const getEventsForDate = (date: Date): DeadlineEvent[] => {
    return deadlines.filter((event) => isSameDay(event.date, date));
  };

  // Navigate months
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-gray-800">
          Jatuh Tempo Pembayaran
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((dayName) => (
          <div
            key={dayName}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const events = getEventsForDate(day);
          const hasDP = events.some((e) => e.type === 'DP');
          const hasPelunasan = events.some((e) => e.type === 'Pelunasan');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isHovered = hoveredDate && isSameDay(day, hoveredDate);

          return (
            <div
              key={idx}
              className={`
                relative aspect-square p-1 rounded-lg border transition-all cursor-pointer
                ${!isCurrentMonth ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'}
                ${isToday ? 'ring-2 ring-[#87A878]' : ''}
                ${isHovered && events.length > 0 ? 'shadow-md scale-105' : ''}
              `}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <span className={`text-xs ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                {format(day, 'd')}
              </span>

              {/* Event dots */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {hasDP && (
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                )}
                {hasPelunasan && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B76E79]" />
                )}
              </div>

              {/* Tooltip */}
              {isHovered && events.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-white p-2 rounded-lg shadow-lg border border-gray-200 min-w-[150px]">
                  {events.map((event, i) => (
                    <div key={i} className="text-xs">
                      <p className="font-semibold text-gray-800">{event.vendorName}</p>
                      <p className={`text-gray-600 ${event.type === 'DP' ? 'text-orange-600' : 'text-[#B76E79]'}`}>
                        {event.type}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-xs text-gray-600">Jatuh Tempo DP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#B76E79]" />
          <span className="text-xs text-gray-600">Jatuh Tempo Pelunasan</span>
        </div>
      </div>
    </div>
  );
}
