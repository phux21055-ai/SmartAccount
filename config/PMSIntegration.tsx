
import React, { useState, useEffect } from 'react';
import { Booking, Transaction, TransactionType, Category } from '../types';

// Fixed: Added onUpdateBooking to PMSIntegrationProps to match usage in App.tsx
interface PMSIntegrationProps {
  bookings: Booking[];
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onUpdateBooking: (id: string, updates: Partial<Booking>) => void;
}

const CountdownTimer: React.FC<{ expiry: string }> = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiry).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    const interval = setInterval(update, 1000);
    update();
    return () => clearInterval(interval);
  }, [expiry]);

  return <span className="font-black text-amber-600">{timeLeft}</span>;
};

const PMSIntegration: React.FC<PMSIntegrationProps> = ({ bookings, transactions, onAddTransaction }) => {
  const isPaid = (bookingId: string) => {
    return transactions.some(tx => tx.description.includes(bookingId) && tx.type === TransactionType.INCOME);
  };

  const handleQuickAdd = (booking: Booking) => {
    const phoneSuffix = booking.guestDetails?.phone ? ` (Tel: ${booking.guestDetails.phone})` : '';
    onAddTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: booking.totalAmount,
      type: TransactionType.INCOME,
      category: Category.ROOM_REVENUE,
      description: `Payment for Booking ${booking.id} - ${booking.guestName}${phoneSuffix}`,
      isReconciled: true,
      guestData: booking.guestDetails,
      customerType: booking.status === 'locked' ? undefined : undefined // Optional: handle customer type mapping if needed
    });
  };

  const getStatusBadge = (booking: Booking) => {
    switch (booking.status) {
      case 'locked':
        return (
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight flex items-center gap-1">
              <span className="animate-pulse">⌛</span> Locked
            </span>
            <span className="text-[10px] text-amber-500 font-bold">
              Expires in <CountdownTimer expiry={booking.lockedUntil!} />
            </span>
          </div>
        );
      case 'checked_in':
        return <span className="bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">Checked In</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">Confirmed</span>;
      case 'pending':
        return <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Property Management Sync</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Guest & Booking Status</p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl text-[11px] font-black flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            System Live
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {bookings.map(booking => {
            const paid = isPaid(booking.id);
            return (
              <div key={booking.id} className={`p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                booking.status === 'checked_in' ? 'bg-emerald-50/30 border-emerald-100 shadow-lg shadow-emerald-50/50' : 
                booking.status === 'locked' ? 'bg-amber-50/50 border-amber-200 shadow-sm' :
                'bg-white border-slate-100 hover:border-indigo-100'
              }`}>
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm ${
                    booking.status === 'checked_in' ? 'bg-white text-emerald-600 border border-emerald-100' : 
                    booking.status === 'locked' ? 'bg-white text-amber-500 border border-amber-100' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {booking.status === 'checked_in' ? '🔑' : booking.status === 'locked' ? '🔒' : '🏨'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-black text-slate-800 text-base">Room {booking.roomNumber} - {booking.guestName}</h4>
                      {getStatusBadge(booking)}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       <span>Ref: {booking.id}</span>
                       <span className="text-slate-200">|</span>
                       <span className="flex items-center gap-1.5"><span className="text-indigo-400">IN:</span> {new Date(booking.checkIn).toLocaleDateString('th-TH')}</span>
                       <span className="flex items-center gap-1.5"><span className="text-rose-400">OUT:</span> {new Date(booking.checkOut).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-800 leading-tight">฿{booking.totalAmount.toLocaleString()}</p>
                    <p className={`text-[9px] font-black uppercase tracking-[0.1em] mt-1 ${paid ? 'text-emerald-500' : booking.status === 'locked' ? 'text-amber-500' : 'text-amber-500'}`}>
                      {paid ? '● ชำระเงินเรียบร้อย' : booking.status === 'locked' ? '○ รอชำระมัดจำ' : '○ ค้างชำระ'}
                    </p>
                  </div>

                  {!paid && (
                    <button 
                      onClick={() => handleQuickAdd(booking)}
                      className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 active:scale-95"
                    >
                      ลงบันทึกรับเงิน
                    </button>
                  )}
                  
                  {paid && (
                    <div className="bg-emerald-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PMSIntegration;
