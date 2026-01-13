import React from 'react';

interface DepositStatusProps {
  depositAmount: number;
  status: 'unpaid' | 'paid' | 'refunded';
  onUpdateStatus: (status: 'paid' | 'refunded') => void;
}

const DepositStatus: React.FC<DepositStatusProps> = ({ depositAmount, status, onUpdateStatus }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return { color: 'bg-emerald-100 text-emerald-600', label: 'ชำระแล้ว (Paid)', icon: '💰' };
      case 'refunded':
        return { color: 'bg-slate-100 text-slate-500', label: 'คืนแล้ว (Refunded)', icon: '↩️' };
      default:
        return { color: 'bg-amber-100 text-amber-600', label: 'ค้างชำระ (Unpaid)', icon: '⚠️' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">การจัดการเงินประกัน</h4>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${config.color}`}>
          {config.label}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 mb-1">จำนวนเงินประกันกุญแจ</p>
          <p className="text-2xl font-black text-slate-800">{depositAmount.toLocaleString()} <span className="text-sm font-bold text-slate-400">฿</span></p>
        </div>
        
        <div className="flex gap-2">
          {status === 'unpaid' && (
            <button 
              onClick={() => onUpdateStatus('paid')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all"
            >
              รับเงินแล้ว
            </button>
          )}
          {status === 'paid' && (
            <button 
              onClick={() => onUpdateStatus('refunded')}
              className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all"
            >
              คืนเงินประกัน
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositStatus;
