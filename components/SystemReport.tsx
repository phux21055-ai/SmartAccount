
import React from 'react';
import { Transaction, TransactionType } from '../types';

interface SystemReportProps {
  transactions: Transaction[];
  onReconcile: (id: string) => void;
}

const SystemReport: React.FC<SystemReportProps> = ({ transactions, onReconcile }) => {
  // กรองรายการที่ยังไม่ได้ตรวจสอบ (Pending Approval)
  const pendingItems = transactions
    .filter(t => !t.isReconciled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const pendingCount = transactions.filter(t => !t.isReconciled).length;

  // จำลองสถานะระบบต่างๆ
  const systemStatus = [
    { name: 'AI OCR Scanning', status: 'Active', color: 'text-emerald-500' },
    { name: 'Financial Dashboard', status: 'Live', color: 'text-emerald-500' },
    { name: 'Cloud Storage', status: 'Syncing', color: 'text-blue-500' },
    { name: 'PMS Integration', status: 'Connected', color: 'text-emerald-500' },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative group">
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-50/30 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em]">Operational</span>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800">ศูนย์ปฏิบัติการและสถานะระบบ</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Smart Resort Monitoring</p>
          </div>

          {/* System Health Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
            {systemStatus.map((sys, idx) => (
              <div key={idx} className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 px-4 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[100px]">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1 text-center leading-tight">{sys.name}</p>
                <p className={`text-[10px] font-bold ${sys.color}`}>{sys.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Action Required Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black text-slate-700 flex items-center gap-2">
                <span className="text-base">🚀</span> รายการที่ต้องอนุมัติล่าสุด
              </h4>
              {pendingCount > 0 && (
                <span className="bg-rose-50 text-rose-500 text-[9px] font-black px-2 py-1 rounded-lg">
                  {pendingCount} รายการใหม่
                </span>
              )}
            </div>

            <div className="space-y-3">
              {pendingItems.length > 0 ? (
                pendingItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 rounded-[2rem] transition-all border border-transparent hover:border-slate-100 group/item"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      item.type === TransactionType.INCOME ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      <span className="font-black text-sm">{item.type === TransactionType.INCOME ? '↓' : '↑'}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{item.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold">฿{item.amount.toLocaleString()}</p>
                    </div>

                    <button 
                      onClick={() => onReconcile(item.id)}
                      className="bg-indigo-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-90"
                      title="ยืนยันรายการ"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-slate-50/30 rounded-[2.5rem] border border-dashed border-slate-200">
                  <span className="text-2xl mb-3 block">✅</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ทุกรายการได้รับการตรวจสอบแล้ว</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats / Developmental Plan Summary */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest opacity-60 mb-6">Business Insights</h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-tight">Data Integrity</span>
                        <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md">99.8%</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-tight">AI OCR Accuracy</span>
                        <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md">High</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-tight">Backup Frequency</span>
                        <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md">Hourly</span>
                     </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button className="w-full bg-white text-indigo-600 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl">
                    Generate Monthly Report
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReport;
