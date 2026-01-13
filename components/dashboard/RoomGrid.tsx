
import React from 'react';
import { DEFAULT_ROOM_TYPES } from '../../config/rooms';
import { Booking } from '../../types';

interface RoomGridProps {
  bookings: Booking[];
  onRoomClick: (roomNumber: string) => void;
}

const RoomGrid: React.FC<RoomGridProps> = ({ bookings, onRoomClick }) => {
  const getRoomStatus = (roomNum: string) => {
    const booking = bookings.find(b => b.roomNumber === roomNum && b.status === 'checked_in');
    if (booking) return { status: 'Occupied', guest: booking.guestName };
    const pending = bookings.find(b => b.roomNumber === roomNum && (b.status === 'confirmed' || b.status === 'locked'));
    if (pending) return { status: 'Reserved', guest: pending.guestName };
    return { status: 'Available', guest: null };
  };

  const allRooms = DEFAULT_ROOM_TYPES.flatMap(type => 
    type.rooms.map(num => ({
      number: num,
      type: type.name,
      bed: type.bedInfo
    }))
  ).sort((a, b) => parseInt(a.number) - parseInt(b.number));

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800">สถานะห้องพัก (15 ห้อง)</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Room Status</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold uppercase text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-[10px] font-bold uppercase text-slate-400">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-[10px] font-bold uppercase text-slate-400">Reserved</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {allRooms.map((room) => {
          const { status, guest } = getRoomStatus(room.number);
          const statusColors = {
            Available: 'bg-emerald-50 border-emerald-100 text-emerald-700',
            Occupied: 'bg-rose-50 border-rose-100 text-rose-700',
            Reserved: 'bg-amber-50 border-amber-100 text-amber-700'
          };

          return (
            <button
              key={room.number}
              onClick={() => onRoomClick(room.number)}
              className={`p-4 rounded-3xl border text-left transition-all hover:scale-105 active:scale-95 ${statusColors[status as keyof typeof statusColors]}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl font-black">{room.number}</span>
                <span className="text-[14px]">{status === 'Occupied' ? '👤' : status === 'Reserved' ? '⏳' : '✅'}</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-tighter truncate opacity-70 mb-1">{room.type}</p>
              <p className="text-[10px] font-bold truncate">{guest || 'ว่าง'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoomGrid;
