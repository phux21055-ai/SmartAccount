import React from 'react';
import { Booking } from '../../types';

interface RoomCardProps {
  roomNumber: string;
  roomType: string;
  status: 'Available' | 'Occupied' | 'Expected' | 'Dirty';
  currentBooking?: Booking;
  onClick?: () => void;
  onRefundDeposit?: (bookingId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ roomNumber, roomType, status, currentBooking, onClick, onRefundDeposit }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Available':
        return { color: 'bg-emerald-500', label: 'ว่าง (Available)', icon: '✅' };
      case 'Occupied':
        return { color: 'bg-rose-500', label: 'ไม่ว่าง (Occupied)', icon: '👤' };
      case 'Expected':
        return { color: 'bg-amber-500', label: 'รอลูกค้า (Expected)', icon: '⏳' };
      case 'Dirty':
        return { color: 'bg-slate-500', label: 'ต้องทำความสะอาด (Dirty)', icon: '🧹' };
      default:
        return { color: 'bg-slate-300', label: 'Unknown', icon: '❓' };
    }
  };

  const config = getStatusConfig();

  const handleRefund = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentBooking && onRefundDeposit) {
      if (window.confirm(`ยืนยันการคืนเงินประกันห้อง ${roomNumber} จำนวน ฿${currentBooking.depositAmount || 0}?`)) {
        onRefundDeposit(currentBooking.id);
      }
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-[2rem] p-5 shadow-sm border transition-all cursor-pointer hover:shadow-md ${status === 'Available' ? 'bg-white border-emerald-100' : 'bg-white border-slate-100'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 leading-none">{roomNumber}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{roomType}</p>
        </div>
        <div className={`${config.color} text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider`}>
          {status}
        </div>
      </div>

      <div className="space-y-2">
        {currentBooking ? (
          <>
            <p className="text-xs font-bold text-slate-700 truncate">{currentBooking.guestName}</p>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-400">
                {new Date(currentBooking.checkIn).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - 
                {new Date(currentBooking.checkOut).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </p>
              
              {status === 'Occupied' && currentBooking.depositAmount && (
                <div className="mt-2 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Deposit</span>
                    <span className={`text-[10px] font-black ${currentBooking.depositStatus === 'paid' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      ฿{currentBooking.depositAmount.toLocaleString()}
                    </span>
                  </div>
                  {currentBooking.depositStatus === 'paid' && (
                    <button 
                      onClick={handleRefund}
                      className="bg-white text-indigo-600 border border-indigo-100 px-2 py-1 rounded-lg text-[8px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      คืนเงิน
                    </button>
                  )}
                  {currentBooking.depositStatus === 'refunded' && (
                    <span className="text-[8px] font-black text-slate-300 uppercase italic">คืนแล้ว</span>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-8 flex items-center">
            <p className="text-[10px] text-slate-300 italic font-bold">ไม่มีข้อมูลการเข้าพัก</p>
          </div>
        )}
      </div>

      <div className="absolute -bottom-2 -right-2 text-4xl opacity-10 grayscale">
        {config.icon}
      </div>
    </div>
  );
};

export default RoomCard;
