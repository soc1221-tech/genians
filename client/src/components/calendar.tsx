import { useEffect, useRef } from 'react';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
}

interface CalendarComponentProps {
  events: CalendarEvent[];
  onDateSelect?: (info: any) => void;
}

export function CalendarComponent({ events, onDateSelect }: CalendarComponentProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarInstance = useRef<FullCalendar | null>(null);

  useEffect(() => {
    if (calendarRef.current && !calendarInstance.current) {
      calendarInstance.current = new FullCalendar(calendarRef.current, {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        },
        height: 'auto',
        selectable: !!onDateSelect,
        select: onDateSelect,
        events: events,
        eventDisplay: 'block',
        dayMaxEvents: 3,
        eventTextColor: '#ffffff',
      });
      
      calendarInstance.current.render();
    }

    return () => {
      if (calendarInstance.current) {
        calendarInstance.current.destroy();
        calendarInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (calendarInstance.current) {
      calendarInstance.current.removeAllEvents();
      calendarInstance.current.addEventSource(events);
    }
  }, [events]);

  return <div ref={calendarRef} className="w-full min-h-96" data-testid="calendar-component" />;
}
