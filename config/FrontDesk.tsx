
import React, { useState, useRef, useEffect } from 'react';
import { processIDCardOCR } from '../services/geminiService';
import { GuestData, TransactionType, Category, CustomerType, Booking } from '../types';
import PrintableDocument from './PrintableDocument';
import CameraCapture from './CameraCapture';
import toast from 'react-hot-toast';
import { getRoomTypeByNumber, calculateNights, calculateTotalAmount, EXTRA_GUEST_PRICE } from '../config/rooms';

interface FrontDeskProps {
  onCheckIn: (data: { 
    guest: GuestData, 
    amount: number, 
    room: string, 
    description: string, 
    customerType: CustomerType,
    checkIn: string,
    checkOut: string
  }) => void;
  onQuickBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  resortInfo: any;
}

const FrontDesk: React.FC<FrontDeskProps> = ({ onCheckIn, onQuickBooking, resortInfo }) => {
  const [mode, setMode] = useState<'CHECKIN' | 'QUICKBOOK'>('CHECKIN');
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showDoc, setShowDoc] = useState<'NONE' | 'RR3' | 'RECEIPT' | 'TAX_INVOICE'>('NONE');
  
  const [roomNumber, setRoomNumber] = useState('');
  const [extraGuests, setExtraGuests] = useState(0);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [totalAmount, setTotalAmount] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (roomNumber && checkInDate && checkOutDate) {
      const amount = calculateTotalAmount(roomNumber, checkInDate, checkOutDate, extraGuests);
      const roomType = getRoomTypeByNumber(roomNumber);
      const nights = calculateNights(checkInDate, checkOutDate);
      
      setTotalAmount(amount);
      setDescription(`ค่าที่พัก ${roomType?.name || 'ห้อง ' + roomNumber} (${nights} คืน)${extraGuests > 0 ? ' + เสริม ' + extraGuests + ' ท่าน' : ''}`);
    }
  }, [roomNumber, checkInDate, checkOutDate, extraGuests]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOCRResult = async (base64Data: string) => {
    setIsScanning(true);
    try {
      const result = await processIDCardOCR(base64Data);
      setGuest(result);
      toast.success("สแกนบัตรประชาชนสำเร็จ");
    } catch (err: any) {
      toast.error(err.message || "สแกนไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCompleteCheckIn = () => {
    if (!guest || !roomNumber || totalAmount <= 0) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    onCheckIn({
      guest, room: roomNumber, amount: totalAmount,
      description,
      customerType: CustomerType.CHECK_IN, 
      checkIn: checkInDate, 
      checkOut: checkOutDate
    });
    setGuest(null);
    setRoomNumber('');
    toast.success("เช็คอินเรียบร้อย");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">ระบบฟรอนต์เดสก์</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Check-in Management</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => setMode('CHECKIN')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${mode === 'CHECKIN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>🛎️ เช็คอินแขก</button>
            <button onClick={() => setMode('QUICKBOOK')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${mode === 'QUICKBOOK' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>📞 จองด่วน</button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsCameraOpen(true)} className="bg-indigo-600 text-white px-6 py-4 rounded-2xl text-xs font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3">📸 สแกนบัตรประชาชน</button>
            <button onClick={() => fileInputRef.current?.click()} className="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all">📁 อัปโหลดรูป</button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => handleOCRResult((ev.target?.result as string).split(',')[1]);
                reader.readAsDataURL(file);
              }
            }} />
          </div>

          {isScanning ? (
            <div className="py-20 text-center bg-indigo-50/50 rounded-[3rem] animate-pulse"><p className="text-indigo-600 font-black">AI กำลังอ่านข้อมูล...</p></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลผู้เข้าพัก</h4>
                {guest ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">ชื่อ-นามสกุล</label>
                      <input value={`${guest.title}${guest.firstNameTH} ${guest.lastNameTH}`} className="w-full p-4 bg-white rounded-2xl font-bold border-none shadow-sm" readOnly />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">เลขบัตรประชาชน</label>
                      <input value={guest.idNumber} className="w-full p-4 bg-white rounded-2xl font-bold border-none shadow-sm" readOnly />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">วันเกิด</label>
                      <input value={guest.dob} className="w-full p-4 bg-white rounded-2xl font-bold border-none shadow-sm" readOnly />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">ที่อยู่</label>
                      <textarea value={guest.address} className="w-full p-4 bg-white rounded-2xl font-bold border-none shadow-sm h-24" readOnly />
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-300 italic">กรุณาสแกนบัตรประชาชนเพื่อดึงข้อมูล</div>
                )}
              </div>

              <div className="lg:col-span-2 bg-indigo-600 rounded-[3rem] p-8 text-white flex flex-col gap-6">
                <h4 className="font-black text-xl">รายละเอียดการเข้าพัก</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-indigo-200">เลขห้อง</label>
                      <input placeholder="เช่น 1, 2, 14" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} className="w-full bg-white/10 p-4 rounded-2xl text-xs font-bold border border-white/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-indigo-200">เสริม (300/คน)</label>
                      <input type="number" value={extraGuests} onChange={e => setExtraGuests(parseInt(e.target.value) || 0)} className="w-full bg-white/10 p-4 rounded-2xl text-xs font-bold border border-white/20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-indigo-200">Check-in</label>
                      <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="w-full bg-white/10 p-4 rounded-2xl text-xs font-bold border border-white/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-indigo-200">Check-out</label>
                      <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="w-full bg-white/10 p-4 rounded-2xl text-xs font-bold border border-white/20" />
                    </div>
                  </div>
                  
                  {totalAmount > 0 && (
                    <div className="bg-white/10 p-5 rounded-2xl border border-white/20 space-y-1">
                      <p className="text-[10px] opacity-60 font-black uppercase tracking-widest">ยอดชำระสุทธิ</p>
                      <p className="text-2xl font-black">฿{totalAmount.toLocaleString()}</p>
                      <p className="text-[9px] opacity-80">{description}</p>
                    </div>
                  )}

                  <button onClick={handleCompleteCheckIn} className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">ยืนยันเช็คอิน</button>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button onClick={() => setShowDoc('RR3')} className="bg-white/10 text-white p-2 rounded-xl text-[8px] font-black uppercase">ร.ร. 3</button>
                    <button onClick={() => setShowDoc('RECEIPT')} className="bg-white/10 text-white p-2 rounded-xl text-[8px] font-black uppercase">มัดจำ</button>
                    <button onClick={() => setShowDoc('TAX_INVOICE')} className="bg-white/10 text-white p-2 rounded-xl text-[8px] font-black uppercase">ใบเสร็จ</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCameraOpen && <CameraCapture onCapture={handleOCRResult} onClose={() => setIsCameraOpen(false)} />}
      
      {showDoc !== 'NONE' && guest && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4" onClick={() => setShowDoc('NONE')}>
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                 <h3 className="font-black text-slate-800 uppercase tracking-tight">Document Preview</h3>
                 <button onClick={() => setShowDoc('NONE')} className="text-slate-400 font-bold hover:text-slate-600 px-4 transition-colors">✕ ปิด</button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-100/50 p-10 flex justify-center">
                 <PrintableDocument guest={guest} type={showDoc} amount={totalAmount} roomNumber={roomNumber} description={description} resortInfo={resortInfo} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FrontDesk;
