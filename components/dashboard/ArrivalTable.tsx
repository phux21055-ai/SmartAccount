import React from 'react';
import { Booking } from '../../types';

interface ArrivalTableProps {
  bookings: Booking[];
  onCheckIn: (booking: Booking) => void;
}

const ArrivalTable: React.FC<ArrivalTableProps> = ({ bookings, onCheckIn }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todayArrivals = bookings.filter(b => 
    b.checkIn.startsWith(today) && 
    (b.status === 'confirmed' || b.status === 'pending' || b.status === 'locked')
  );

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800">แขกที่มาวันนี้ (Arrivals)</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Today's Check-ins</p>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-xs font-black">
          {todayArrivals.length} รายการ
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-50">
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">ห้อง</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">ชื่อแขก</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">ช่องทาง</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">สถานะ</th>
              <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">การกระทำ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {todayArrivals.length > 0 ? (
              todayArrivals.map((booking) => (
                <tr key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 font-black text-slate-800 text-sm">{booking.roomNumber}</td>
                  <td className="py-4">
                    <p className="text-sm font-bold text-slate-700">{booking.guestName}</p>
                    <p className="text-[10px] text-slate-400">{booking.otaChannel || 'Direct'}</p>
                  </td>
                  <td className="py-4">
                    <span className="text-[10px] font-black px-2 py-1 bg-amber-100 text-amber-600 rounded-lg uppercase">
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-500">
                         ยอดชำระ: {booking.totalAmount.toLocaleString()} ฿
                       </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => onCheckIn(booking)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                      Check-in
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                   <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">☕</div>
                   <p className="text-xs text-slate-400 font-bold">ไม่มีรายการเช็คอินสำหรับวันนี้</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArrivalTable;
