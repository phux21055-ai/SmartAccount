
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { DEFAULT_ROOM_TYPES } from '../config/rooms';
import toast from 'react-hot-toast';
// Fixed: Added missing import for Booking type
import { Booking } from '../../types';

interface ResortCalendarProps {
  bookings?: Booking[];
}

const ResortCalendar: React.FC<ResortCalendarProps> = ({ bookings = [] }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Define resources (rooms) from config
  const resources = DEFAULT_ROOM_TYPES.flatMap(type => 
    type.rooms.map(roomNum => ({
      id: roomNum,
      title: `Room ${roomNum}`,
      roomType: type.name
    }))
  ).sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));

  useEffect(() => {
    if (bookings.length > 0) {
      const formattedEvents = bookings.map((booking: any) => ({
        id: booking.id,
        resourceId: booking.roomNumber,
        title: booking.guestName,
        start: booking.checkIn,
        end: booking.checkOut,
        backgroundColor: getStatusColor(booking.status),
        extendedProps: {
          status: booking.status,
          channel: booking.otaChannel || 'Walk-in',
          total: booking.totalAmount
        }
      }));
      setEvents(formattedEvents);
    } else {
      fetchBookings();
    }
  }, [bookings]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings');
      const result = await response.json();
      
      if (result.success) {
        const formattedEvents = result.data.map((booking: any) => ({
          id: booking._id,
          resourceId: booking.room,
          title: booking.guestName,
          start: booking.checkIn,
          end: booking.checkOut,
          backgroundColor: getStatusColor(booking.confirmationStatus || 'confirmed'),
          extendedProps: {
            status: booking.confirmationStatus,
            channel: booking.channel,
            total: booking.total
          }
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed' || s === 'ยืนยันแล้ว' || s === 'checked_in') return '#10b981'; // Green
    if (s === 'waiting' || s === 'รอการยืนยัน' || s === 'pending' || s === 'locked') return '#f59e0b'; // Orange
    if (s === 'cancelled' || s === 'ยกเลิก' || s === 'checked_out') return '#ef4444'; // Red
    return '#6366f1'; // Indigo (default)
  };

  return (
    <div className="bg-white p-6 rounded-[3rem] shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ตารางการจองห้องพัก</h2>
          <p className="text-slate-500 text-sm">Viphuanan Resort Booking Timeline</p>
        </div>
        <button 
          onClick={fetchBookings}
          className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"
          title="รีเฟรช"
        >
          🔄
        </button>
      </div>

      {isLoading ? (
        <div className="h-[600px] flex items-center justify-center">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      ) : (
        <div className="calendar-container overflow-hidden rounded-2xl border border-slate-100">
          <FullCalendar
            plugins={[resourceTimelinePlugin, interactionPlugin]}
            initialView="resourceTimelineMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'resourceTimelineMonth,resourceTimelineDay'
            }}
            resources={resources}
            events={events}
            resourceAreaWidth="15%"
            resourceAreaHeaderContent="ห้องพัก"
            height="auto"
            contentHeight={600}
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
            eventClick={(info) => {
              const props = info.event.extendedProps;
              toast(`แขก: ${info.event.title}\nสถานะ: ${props.status}\nช่องทาง: ${props.channel}`, {
                icon: 'ℹ️',
                duration: 4000
              });
            }}
          />
        </div>
      )}

      <div className="mt-6 flex gap-4 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
          <span>Waiting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
          <span>Others</span>
        </div>
      </div>

      <style>{`
        .fc { font-family: inherit; }
        .fc-header-toolbar { padding: 1rem; background: #f8fafc; margin-bottom: 0 !important; }
        .fc-button-primary { background: white !important; border: 1px solid #e2e8f0 !important; color: #1e293b !important; font-weight: 800 !important; text-transform: uppercase !important; font-size: 10px !important; border-radius: 12px !important; }
        .fc-button-primary:hover { background: #f1f5f9 !important; }
        .fc-button-active { background: #1e293b !important; color: white !important; }
        .fc-timeline-event { border-radius: 8px !important; border: none !important; padding: 2px 4px !important; }
      `}</style>
    </div>
  );
};

// Fixed: Changed default export name from BookingCalendar to ResortCalendar to match component name
export default ResortCalendar;
