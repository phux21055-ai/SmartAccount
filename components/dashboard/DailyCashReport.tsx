
import React, { useMemo } from 'react';
import { Transaction, TransactionType, Booking } from '../../types';

interface DailyCashReportProps {
  transactions: Transaction[];
  bookings: Booking[];
}

const DailyCashReport: React.FC<DailyCashReportProps> = ({ transactions, bookings }) => {
  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const todayTransactions = transactions.filter(t => t.date === today);
    
    const cashIn = todayTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingDeposits = bookings
      .filter(b => b.depositStatus === 'paid')
      .reduce((sum, b) => sum + (b.depositAmount || 0), 0);

    const occupancyRate = bookings.length > 0 
      ? Math.round((bookings.filter(b => b.status === 'checked_in').length / 14) * 100) 
      : 0;

    return { cashIn, pendingDeposits, occupancyRate };
  }, [transactions, bookings, today]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">💰</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">วันนี้ได้รับเงินสด</p>
          <h3 className="text-2xl font-black text-slate-800 leading-none">฿{stats.cashIn.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl">🔑</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">เงินประกันค้างคืน</p>
          <h3 className="text-2xl font-black text-slate-800 leading-none">฿{stats.pendingDeposits.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5">
        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl">🏨</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">อัตราการเข้าพัก</p>
          <h3 className="text-2xl font-black text-slate-800 leading-none">{stats.occupancyRate}%</h3>
        </div>
      </div>
    </div>
  );
};

export default DailyCashReport;
