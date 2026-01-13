
// components/CloudArchive.tsx provides a digital gallery for all captured receipt images.
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface CloudArchiveProps {
  transactions: Transaction[];
  onViewImage: (url: string) => void;
}

const CloudArchive: React.FC<CloudArchiveProps> = ({ transactions, onViewImage }) => {
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE);
  
  const transactionsWithImages = transactions.filter(t => t.imageUrl);
  const filteredTxs = transactionsWithImages.filter(t => t.type === activeTab);

  // Group filtered transactions by month
  const grouped = filteredTxs.reduce((acc, tx) => {
    const date = new Date(tx.date);
    const month = date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const incomeCount = transactionsWithImages.filter(t => t.type === TransactionType.INCOME).length;
  const expenseCount = transactionsWithImages.filter(t => t.type === TransactionType.EXPENSE).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Card */}
      <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative transition-all duration-500 ${
        activeTab === TransactionType.INCOME ? 'bg-indigo-900 shadow-indigo-100' : 'bg-rose-900 shadow-rose-100'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black mb-1 flex items-center gap-3">
              <span>{activeTab === TransactionType.INCOME ? '📥' : '📤'}</span>
              คลังหลักฐานดิจิทัล
            </h3>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
              {activeTab === TransactionType.INCOME ? 'รายรับ (Income Evidence)' : 'รายจ่าย (Expense Evidence)'}
            </p>
          </div>
          
          {/* Custom Segmented Control */}
          <div className="bg-black/20 backdrop-blur-md p-1.5 rounded-[1.5rem] flex gap-1 border border-white/10 self-start md:self-center">
            <button 
              onClick={() => setActiveTab(TransactionType.INCOME)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 ${
                activeTab === TransactionType.INCOME ? 'bg-white text-indigo-900 shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              รายรับ ({incomeCount})
            </button>
            <button 
              onClick={() => setActiveTab(TransactionType.EXPENSE)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 ${
                activeTab === TransactionType.EXPENSE ? 'bg-white text-rose-900 shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              รายจ่าย ({expenseCount})
            </button>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute right-[-30px] top-[-30px] opacity-10 pointer-events-none">
           <svg className="w-56 h-56" fill="currentColor" viewBox="0 0 24 24">
             <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
           </svg>
        </div>
      </div>

      {filteredTxs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
            {activeTab === TransactionType.INCOME ? '💰' : '💸'}
          </div>
          <p className="text-sm font-black text-slate-800">ไม่พบรูปภาพหลักฐาน{activeTab === TransactionType.INCOME ? 'รายรับ' : 'รายจ่าย'}</p>
          <p className="text-[11px] opacity-60 mt-2 max-w-[240px] text-center leading-relaxed font-medium">
            เริ่มสแกนสลิป{activeTab === TransactionType.INCOME ? 'การรับชำระเงิน' : 'การจ่ายเงิน'} เพื่อจัดเก็บหลักฐานไว้ในคลัง
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Explicitly typing txs as Transaction[] to fix property access errors on 'unknown' type */}
          {Object.entries(grouped).map(([month, txs]: [string, Transaction[]]) => (
            <div key={month} className="space-y-6">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-black text-slate-800 pl-4 border-l-4 border-indigo-500 uppercase tracking-tight">{month}</h4>
                <div className="h-[1px] flex-1 bg-slate-100"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase">{txs.length} รายการ</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {txs.map(tx => (
                  <div 
                    key={tx.id}
                    onClick={() => onViewImage(tx.imageUrl!)}
                    className="group relative aspect-[3/4] bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer active:scale-95 border border-slate-100"
                  >
                    <img 
                      src={tx.imageUrl} 
                      alt={tx.description} 
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Info Container */}
                    <div className="absolute inset-x-0 bottom-0 p-5 transform group-hover:translate-y-[-5px] transition-transform">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${tx.type === TransactionType.INCOME ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        <p className="text-[11px] text-white font-black truncate leading-none">{tx.description}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[14px] text-white font-black">฿{tx.amount.toLocaleString()}</p>
                        <p className="text-[8px] text-white/50 font-bold uppercase tracking-tighter">
                          {new Date(tx.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>

                    {/* Quick View Icon */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudArchive;
