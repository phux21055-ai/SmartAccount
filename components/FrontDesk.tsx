
import React, { useState, useRef } from 'react';
import { processIDCardOCR } from '../services/geminiService';
import { GuestData, TransactionType, Category } from '../types';
import PrintableDocument from './PrintableDocument';
import CameraCapture from './CameraCapture';

interface FrontDeskProps {
  onCheckIn: (data: { guest: GuestData, amount: number, room: string, description: string }) => void;
}

const FrontDesk: React.FC<FrontDeskProps> = ({ onCheckIn }) => {
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showDoc, setShowDoc] = useState<'NONE' | 'RR3' | 'RECEIPT' | 'TAX_INVOICE'>('NONE');
  
  // Form fields for check-in
  const [roomNumber, setRoomNumber] = useState('');
  const [amount, setAmount] = useState('1500');
  const [description, setDescription] = useState('ค่าบริการห้องพัก Standard');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOCRResult = async (base64Data: string) => {
    setIsScanning(true);
    try {
      const result = await processIDCardOCR(base64Data);
      setGuest(result);
    } catch (err: any) {
      alert(err.message || "สแกนไม่สำเร็จ กรุณาลองใหม่หรือพิมพ์ข้อมูลเอง");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    
    await handleOCRResult(base64Data);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCompleteCheckIn = () => {
    if (!guest || !roomNumber || !amount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนก่อนเช็คอิน");
      return;
    }

    onCheckIn({
      guest,
      room: roomNumber,
      amount: parseFloat(amount),
      description: `${description} - ห้อง ${roomNumber}`
    });

    alert("เช็คอินสำเร็จ! ระบบบันทึกรายได้เข้าสู่หน้าบัญชีแล้ว");
    setGuest(null);
    setRoomNumber('');
    setAmount('1500');
    setDescription('ค่าบริการห้องพัก Standard');
  };

  const updateGuestField = (field: keyof GuestData, value: string) => {
    if (guest) {
      setGuest({ ...guest, [field]: value });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Check-in Management</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">AI ID Scan & Digital Records</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setIsCameraOpen(true)}
              disabled={isScanning}
              className="bg-indigo-600 text-white px-6 py-4 rounded-2xl text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              สแกนด้วยกล้อง
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              อัปโหลดรูป
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
        </div>

        {isScanning && (
          <div className="py-20 flex flex-col items-center justify-center gap-6 bg-indigo-50/30 rounded-[3rem] border-2 border-dashed border-indigo-100 animate-pulse">
            <div className="relative">
               <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center text-xl">🤖</div>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Gemini AI Processing</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase">กำลังสกัดข้อมูลจากบัตรประชาชน...</p>
            </div>
          </div>
        )}

        {!isScanning && (
          <>
            {guest ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลที่ AI สแกนได้ (ตรวจสอบและแก้ไขได้)</h4>
                      <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">AI Verified</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="text-[10px] text-slate-400 font-black uppercase mb-1.5 block">เลขประจำตัวประชาชน</label>
                        <input 
                          type="text" 
                          value={guest.idNumber}
                          onChange={(e) => updateGuestField('idNumber', e.target.value)}
                          className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-black uppercase mb-1.5 block">ชื่อ (ไทย)</label>
                        <input 
                          type="text" 
                          value={`${guest.title} ${guest.firstNameTH}`}
                          onChange={(e) => updateGuestField('firstNameTH', e.target.value)}
                          className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-black uppercase mb-1.5 block">นามสกุล (ไทย)</label>
                        <input 
                          type="text" 
                          value={guest.lastNameTH}
                          onChange={(e) => updateGuestField('lastNameTH', e.target.value)}
                          className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold transition-all shadow-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] text-slate-400 font-black uppercase mb-1.5 block">ที่อยู่ตามบัตร</label>
                        <textarea 
                          value={guest.address}
                          onChange={(e) => updateGuestField('address', e.target.value)}
                          className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold transition-all shadow-sm min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => setShowDoc('RR3')} className="bg-slate-900 text-white p-5 rounded-[2rem] text-[10px] font-black uppercase hover:bg-slate-800 transition-all flex flex-col items-center gap-3">
                      <span className="text-2xl">📄</span> ใบ ร.ร. 3
                    </button>
                    <button onClick={() => setShowDoc('RECEIPT')} className="bg-emerald-500 text-white p-5 rounded-[2rem] text-[10px] font-black uppercase hover:bg-emerald-600 transition-all flex flex-col items-center gap-3">
                      <span className="text-2xl">💵</span> ใบมัดจำ
                    </button>
                    <button onClick={() => setShowDoc('TAX_INVOICE')} className="bg-indigo-600 text-white p-5 rounded-[2rem] text-[10px] font-black uppercase hover:bg-indigo-700 transition-all flex flex-col items-center gap-3">
                      <span className="text-2xl">🧾</span> ใบกำกับภาษี
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-indigo-600 rounded-[3rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-indigo-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-8 backdrop-blur-md border border-white/20">🏨</div>
                    <h4 className="font-black text-2xl mb-4 leading-tight">บันทึกข้อมูล<br/>เช็คอินใหม่</h4>
                    
                    <div className="space-y-6 mt-10">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-60">ระบุเลขห้องพัก</label>
                        <input 
                          type="text" 
                          placeholder="Room Number..."
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm font-bold focus:bg-white/20 focus:ring-0 transition-all placeholder:text-white/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-60">ราคาห้องพักต่อคืน (฿)</label>
                        <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm font-bold focus:bg-white/20 focus:ring-0 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 space-y-4 relative z-10">
                    <button 
                      onClick={handleCompleteCheckIn}
                      className="w-full bg-white text-indigo-600 py-5 rounded-[2rem] text-sm font-black shadow-xl hover:bg-slate-50 transition-all active:scale-95"
                    >
                      ยืนยันและเช็คอิน
                    </button>
                    <button 
                      onClick={() => setGuest(null)}
                      className="w-full text-[10px] font-black text-indigo-200 uppercase tracking-widest hover:text-white transition-all py-2"
                    >
                      ยกเลิกและล้างฟอร์ม
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 group hover:bg-white hover:border-indigo-200 transition-all cursor-pointer" onClick={() => setIsCameraOpen(true)}>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white shadow-xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <span className="text-4xl">🪪</span>
                </div>
                <p className="text-slate-800 text-xl font-black mb-2">พร้อมรับลูกค้าใหม่</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
                  กดปุ่มด้านบนเพื่อสแกนบัตรประชาชน<br/>หรือลากรูปภาพมาวางที่นี่
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleOCRResult} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      {showDoc !== 'NONE' && guest && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                 <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-black">PDF</div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Digital Document Preview</h3>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                      สั่งพิมพ์
                    </button>
                    <button onClick={() => setShowDoc('NONE')} className="text-slate-400 font-bold hover:text-slate-600 px-4 transition-colors">✕ ปิด</button>
                 </div>
              </div>
              <div className="flex-1 overflow-auto bg-slate-100/50 p-10 flex justify-center">
                 <PrintableDocument 
                    guest={guest} 
                    type={showDoc} 
                    amount={parseFloat(amount) || 0}
                    roomNumber={roomNumber}
                    description={description}
                 />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FrontDesk;
