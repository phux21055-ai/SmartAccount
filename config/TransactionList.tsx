
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onReconcile: (id: string) => void;
  onViewImage?: (url: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onReconcile, onViewImage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');

  const filteredTransactions = transactions.filter(tx => {
    const guestName = tx.guestData ? `${tx.guestData.firstNameTH} ${tx.guestData.lastNameTH}`.toLowerCase() : '';
    const guestNameEN = tx.guestData ? `${tx.guestData.firstNameEN} ${tx.guestData.lastNameEN}`.toLowerCase() : '';
    
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestName.includes(searchTerm.toLowerCase()) ||
      guestNameEN.includes(searchTerm.toLowerCase()) ||
      tx.guestData?.idNumber?.includes(searchTerm);

    const matchesType = filterType === 'ALL' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
        <div className="bg-slate-50 p-8 rounded-full mb-6 text-4xl">🧾</div>
        <p className="text-sm font-bold text-slate-800">ยังไม่มีประวัติรายการ</p>
        <p className="text-[11px] mt-2 opacity-60 max-w-[200px] text-center leading-relaxed">
          เริ่มบันทึกรายการด้วยการสแกนสลิป หรือเช็คอินแขกด้วยการสแกนบัตรประชาชน
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Search Box */}
      <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="ค้นหาตามชื่อรายการ, หมวดหมู่, ชื่อแขก หรือเลขบัตรประชาชน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300"
          />
          <svg className="w-5 h-5 text-slate-300 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <div className="flex gap-2">
          {['ALL', TransactionType.INCOME, TransactionType.EXPENSE].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                filterType === type 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {type === 'ALL' ? 'ทั้งหมด' : type === TransactionType.INCOME ? 'รายรับ' : 'รายจ่าย'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <div 
              key={tx.id} 
              className={`bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-lg transition-all active:scale-[0.99] ${tx.isReconciled ? 'bg-slate-50/50' : ''}`}
            >
              {/* Type Badge */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm ${
                tx.type === TransactionType.INCOME 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-rose-50 text-rose-600'
              }`}>
                {tx.type === TransactionType.INCOME ? '↓' : '↑'}
              </div>

              {/* Transaction Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="font-bold text-slate-800 truncate text-sm leading-tight pr-2">
                    {tx.description}
                    {tx.guestData && (
                      <span className="block text-[10px] text-indigo-500 font-black mt-0.5">
                        👤 {tx.guestData.firstNameTH} {tx.guestData.lastNameTH}
                      </span>
                    )}
                  </h4>
                  <p className={`font-black text-sm shrink-0 ${
                    tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'}฿{tx.amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-white border border-slate-100 text-slate-500 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-tight">
                    {tx.category}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold">
                    {new Date(tx.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </span>
                  {tx.imageUrl && (
                    <button 
                      onClick={() => onViewImage?.(tx.imageUrl!)}
                      className="text-[10px] text-indigo-500 font-black hover:underline ml-auto flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      ดูหลักฐานสแกน
                    </button>
                  )}
                </div>
              </div>

              {/* Action Sidebar */}
              <div className="flex flex-col gap-2 items-center border-l border-slate-50 pl-5">
                 <button 
                  onClick={() => onReconcile(tx.id)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    tx.isReconciled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-300 hover:text-emerald-400'
                  }`}
                  title={tx.isReconciled ? "ตรวจสอบแล้ว" : "รอกระทบยอด"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={() => onDelete(tx.id)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-300 hover:bg-rose-100 hover:text-rose-500 transition-all"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-slate-300 bg-white rounded-[3rem] border border-dashed border-slate-100 text-[11px] font-bold italic">
            ไม่พบข้อมูลที่คุณค้นหา
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
