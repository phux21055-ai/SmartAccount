
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface FinanceChartProps {
  transactions: Transaction[];
}

const FinanceChart: React.FC<FinanceChartProps> = ({ transactions }) => {
  const chartData = React.useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return days.map(date => {
      const dayTxs = transactions.filter(t => t.date === date);
      return {
        name: new Date(date).toLocaleDateString('th-TH', { weekday: 'short' }),
        income: dayTxs.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0),
        expense: dayTxs.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0),
      };
    });
  }, [transactions]);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-slate-800">สรุปกระแสเงินสด 7 วันล่าสุด</h3>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2 text-indigo-500">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> รายรับ
          </div>
          <div className="flex items-center gap-2 text-rose-500">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> รายจ่าย
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 900, marginBottom: '0.5rem' }}
          />
          <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
          <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
