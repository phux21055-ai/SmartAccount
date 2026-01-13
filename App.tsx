
import React, { useState, useEffect } from 'react';
import { 
  Transaction, TransactionType, Category, GuestData, CustomerType, Booking 
} from './types';
import OCRUpload from './components/OCRUpload';
import TransactionList from './components/TransactionList';
import PMSIntegration from './components/PMSIntegration';
import SystemReport from './components/SystemReport';
import CloudArchive from './components/CloudArchive';
import FrontDesk from './components/FrontDesk';
import Settings from './components/Settings';
import DailyCashReport from './components/dashboard/DailyCashReport';
import ArrivalTable from './components/dashboard/ArrivalTable';
import FinanceChart from './components/dashboard/FinanceChart';
import RoomGrid from './components/dashboard/RoomGrid';

const STORAGE_KEY = 'resort_finance_v4';
const SETTINGS_KEY = 'resort_settings_v4';
const BOOKINGS_KEY = 'resort_bookings_v4';
const VIEW_KEY = 'resort_view_v4';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      resortName: "Smart Resort Hub",
      resortAddress: "123 Moo 1, Pong, Bang Lamung, Chon Buri 20150",
      taxId: "0-2055-5700x-xx-x",
      phone: "081-234-5678",
      aiModel: "gemini-3-flash-preview",
      autoReconcile: false
    };
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(BOOKINGS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<'dashboard' | 'transactions' | 'pms' | 'archive' | 'frontdesk' | 'settings'>(() => {
    return (localStorage.getItem(VIEW_KEY) as any) || 'dashboard';
  });

  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    localStorage.setItem(VIEW_KEY, view);
    setLastSync(new Date().toLocaleTimeString());
  }, [transactions, settings, bookings, view]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      isReconciled: settings.autoReconcile || t.isReconciled
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const toggleReconcile = (id: string) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === id ? { ...tx, isReconciled: !tx.isReconciled } : tx
    ));
  };

  const handleFrontDeskCheckIn = (data: any) => {
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.INCOME,
      category: Category.ROOM_REVENUE,
      amount: data.amount,
      description: `เช็คอินห้อง ${data.room} - ${data.guest.firstNameTH}`,
      isReconciled: true,
      guestData: data.guest,
      customerType: data.customerType,
      pmsReferenceId: data.room
    });

    setBookings(prev => {
      const idx = prev.findIndex(b => b.roomNumber === data.room && b.status !== 'checked_out');
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], status: 'checked_in', guestDetails: data.guest };
        return next;
      }
      return [{
        id: `BK${Date.now()}`,
        guestName: `${data.guest.firstNameTH} ${data.guest.lastNameTH}`,
        roomNumber: data.room,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalAmount: data.amount,
        status: 'checked_in',
        guestDetails: data.guest
      }, ...prev];
    });
  };

  const handleRoomAction = (roomNumber: string) => {
    // Logic for clicking a room on the dashboard grid
    setView('frontdesk');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Side Navigation */}
      <nav className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-8 fixed h-full z-40">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl shadow-indigo-100">R</div>
          <div>
            <h1 className="font-black text-slate-800 tracking-tight leading-none text-lg">Resort Hub</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Operational Console</p>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { id: 'frontdesk', icon: '🛎️', label: 'Front Desk' },
            { id: 'transactions', icon: '🧾', label: 'Financials' },
            { id: 'archive', icon: '📸', label: 'Archive' },
            { id: 'pms', icon: '🛌', label: 'PMS Sync' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                view === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-8 border-t border-slate-100">
           <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status: Online</p>
               <p className="text-[10px] font-bold text-slate-800">Synced at {lastSync}</p>
             </div>
           </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 w-full max-w-7xl mx-auto">
        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">ยินดีต้อนรับสู่ {settings.resortName}</h2>
                <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Management Control Dashboard</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setView('frontdesk')} className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">Front Desk Console</button>
              </div>
            </header>

            <DailyCashReport transactions={transactions} bookings={bookings} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-8">
                  <RoomGrid bookings={bookings} onRoomClick={handleRoomAction} />
                  <FinanceChart transactions={transactions} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <OCRUpload onTransactionDetected={addTransaction} label="สแกนรายรับ (Slip)" intent="INCOME" />
                    <OCRUpload onTransactionDetected={addTransaction} label="สแกนรายจ่าย (Expense)" intent="EXPENSE" colorClass="bg-rose-500 shadow-rose-100 hover:bg-rose-600" />
                  </div>
               </div>
               <div className="lg:col-span-1 space-y-8">
                  <SystemReport transactions={transactions} onReconcile={toggleReconcile} />
                  <ArrivalTable bookings={bookings} onCheckIn={() => setView('frontdesk')} />
               </div>
            </div>
          </div>
        )}

        {view === 'frontdesk' && <FrontDesk onCheckIn={handleFrontDeskCheckIn} onQuickBooking={() => {}} resortInfo={settings} />}
        {view === 'transactions' && <TransactionList transactions={transactions} onDelete={deleteTransaction} onReconcile={toggleReconcile} onViewImage={setSelectedImage} />}
        {view === 'archive' && <CloudArchive transactions={transactions} onViewImage={setSelectedImage} />}
        {view === 'pms' && <PMSIntegration bookings={bookings} transactions={transactions} onAddTransaction={addTransaction} onUpdateBooking={() => {}} />}
        {view === 'settings' && <Settings settings={settings} onUpdate={setSettings} onClearData={() => { setTransactions([]); setBookings([]); }} />}
      </main>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button className="absolute -top-12 right-0 text-white font-black text-sm uppercase tracking-widest px-4 py-2 bg-white/10 rounded-xl">ปิด [X]</button>
            <img src={selectedImage} className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border-4 border-white/5" alt="Slip Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
