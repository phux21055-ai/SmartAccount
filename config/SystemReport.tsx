
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';

interface SystemReportProps {
  transactions: Transaction[];
  onReconcile: (id: string) => void;
}

const SystemReport: React.FC<SystemReportProps> = ({ transactions, onReconcile }) => {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  // Filter items that need reconciliation (Pending Approval)
  const pendingItems = transactions
    .filter(t => !t.isReconciled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayPending = pendingItems.slice(0, 5);
  const pendingCount = pendingItems.length;

  // System status indicators with "live" mock data
  const systemStatus = [
    { name: 'AI Core Engine', status: 'Optimal', health: '98%', color: 'text-emerald-500', icon: '🧠' },
    { name: 'Database Sync', status: 'Live', health: '12ms', color: 'text-blue-500', icon: '☁️' },
    { name: 'OCR Processor', status: 'Ready', health: '94%', color: 'text-indigo-500', icon: '📸' },
    { name: 'PMS Link', status: 'Stable', health: 'Online', color: 'text-emerald-500', icon: '🏨' },
  ];

  const handleApproveAll = () => {
    if (window.confirm(`ยืนยันการอนุมัติทั้งหมด ${displayPending.length} รายการที่แสดงอยู่?`)) {
      displayPending.forEach(item => onReconcile(item.id));
    }
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden relative group">
      {/* Dynamic Background */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-50/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-100/30 transition-colors duration-1000"></div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full text-white">
              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${pulse ? 'animate-pulse' : ''}`}></span>
              <span className="text-[9px] font-black uppercase tracking-widest">System Operational</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">ศูนย์ควบคุมปฏิบัติการ</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">Management & Quality Control Dashboard</p>
          </div>

          {/* Real-time Performance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            {systemStatus.map((sys, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center min-w-[120px] shadow-sm hover:border-indigo-200 transition-all group/status">
                <span className="text-xl mb-1 group-hover/status:scale-110 transition-transform">{sys.icon}</span>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1 text-center">{sys.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${sys.color}`}>{sys.status}</span>
                  <span className="text-[9px] text-slate-300 font-black">|</span>
                  <span className="text-[9px] text-slate-500 font-bold">{sys.health}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Pending Approval Queue */}
          <div className="xl:col-span-7 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">คิวรายการรออนุมัติ</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Pending Document Queue</p>
                </div>
              </div>

              {pendingCount > 0 && (
                <button 
                  onClick={handleApproveAll}
                  className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-indigo-100"
                >
                  อนุมัติทั้งหมด ({displayPending.length})
                </button>
              )}
            </div>

            <div className="space-y-3">
              {displayPending.length > 0 ? (
                displayPending.map((item) => (
                  <div 
                    key={item.id} 
                    className="group/card flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-50 transition-all hover:-translate-y-1 relative"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/card:scale-105 ${
                      item.type === TransactionType.INCOME 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      <span className="font-black text-xl">{item.type === TransactionType.INCOME ? '↓' : '↑'}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                          item.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {item.category}
                        </span>
                        <span className="text-[9px] text-slate-300 font-bold">
                          {new Date(item.date).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-800 truncate leading-tight">{item.description}</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-0.5">฿{item.amount.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-3">
                       <button 
                        onClick={() => onReconcile(item.id)}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-90 flex items-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        อนุมัติ
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="text-4xl mb-4 grayscale opacity-50">✨</div>
                  <h5 className="text-sm font-black text-slate-600 uppercase tracking-widest">เคลียร์รายการทั้งหมดแล้ว</h5>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">NO PENDING ACTIONS REQUIRED</p>
                </div>
              )}
              {pendingCount > displayPending.length && (
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">และอีก {pendingCount - displayPending.length} รายการที่เหลือ...</p>
                </div>
              )}
            </div>
          </div>

          {/* Insights & Action Plan Card */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-100 flex-1 min-h-[350px]">
               <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full -mr-24 -mt-24 blur-3xl"></div>
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">Executive Summary</h4>
                      <div className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-bold">LIVE INSIGHTS</div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="group/metric">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Data Reconciliation</span>
                          <span className="text-xl font-black text-white">
                            {transactions.length > 0 ? Math.round((transactions.filter(t => t.isReconciled).length / transactions.length) * 100) : 100}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                            style={{ width: `${transactions.length > 0 ? (transactions.filter(t => t.isReconciled).length / transactions.length) * 100 : 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                          <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">OCR Success</p>
                          <p className="text-lg font-black tracking-tight">99.4%</p>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                          <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Cloud Sync</p>
                          <p className="text-lg font-black tracking-tight">1.2 TB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 space-y-3">
                    <button className="w-full bg-white text-slate-900 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
                      ออกรายงานสรุปประจำเดือน (PDF)
                    </button>
                    <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest">
                      * รายงานจะรวบรวมข้อมูลทุกการเช็คอินและรายการรายจ่าย
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReport;
