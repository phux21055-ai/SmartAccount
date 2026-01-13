import React, { useState, useRef, useEffect } from 'react';
import { Booking, GuestData } from '../../types';
import { processIDCardOCR } from '../../services/geminiService';
import toast from 'react-hot-toast';

interface CheckInFormProps {
  booking?: Booking;
  onComplete: (data: Partial<Booking>) => void;
  onCancel: () => void;
  transactions?: any[];
  bookings?: Booking[];
}

const CheckInForm: React.FC<CheckInFormProps> = ({ booking, onComplete, onCancel, transactions = [], bookings = [] }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [guestData, setGuestData] = useState<Partial<GuestData>>(booking?.guestDetails || {});
  const [idNumber, setIdNumber] = useState(booking?.guestDetails?.idNumber || '');
  const [phone, setPhone] = useState(booking?.guestDetails?.phone || '');
  const [firstName, setFirstName] = useState(booking?.guestDetails?.firstNameTH || '');
  const [lastName, setLastName] = useState(booking?.guestDetails?.lastNameTH || '');
  const [roomNumber, setRoomNumber] = useState(booking?.roomNumber || '');
  const [signature, setSignature] = useState<string | null>(null);
  const [deposit, setDeposit] = useState(booking?.depositAmount || 300);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill logic when firstName or lastName changes
  useEffect(() => {
    if ((firstName.length > 2 || lastName.length > 2) && !isScanning) {
      const searchName = `${firstName} ${lastName}`.trim().toLowerCase();
      
      // Try to find in bookings first
      const foundInBookings = bookings.find(b => 
        b.guestName?.toLowerCase().includes(searchName) || 
        b.guestDetails?.firstNameTH?.toLowerCase().includes(firstName.toLowerCase())
      );

      if (foundInBookings?.guestDetails) {
        const details = foundInBookings.guestDetails;
        if (!idNumber) setIdNumber(details.idNumber || '');
        if (!phone) setPhone(details.phone || '');
        if (!firstName) setFirstName(details.firstNameTH || '');
        if (!lastName) setLastName(details.lastNameTH || '');
        setGuestData(prev => ({ ...prev, ...details }));
        return;
      }

      // Try to find in transactions
      const foundInTransactions = transactions.find(t => 
        t.guestData && (
          `${t.guestData.firstNameTH} ${t.guestData.lastNameTH}`.toLowerCase().includes(searchName) ||
          t.guestData.idNumber === idNumber
        )
      );

      if (foundInTransactions?.guestData) {
        const data = foundInTransactions.guestData;
        if (!idNumber) setIdNumber(data.idNumber || '');
        if (!phone) setPhone(data.phone || '');
        if (!firstName) setFirstName(data.firstNameTH || '');
        if (!lastName) setLastName(data.lastNameTH || '');
        setGuestData(prev => ({ ...prev, ...data }));
      }
    }
  }, [firstName, lastName, idNumber]);

  // Auto-fill logic when idNumber changes
  useEffect(() => {
    if (idNumber.length >= 5 && !isScanning) {
      const foundInTransactions = transactions.find(t => t.guestData?.idNumber === idNumber);
      if (foundInTransactions?.guestData) {
        const data = foundInTransactions.guestData;
        if (!phone) setPhone(data.phone || '');
        if (!firstName) setFirstName(data.firstNameTH || '');
        if (!lastName) setLastName(data.lastNameTH || '');
        setGuestData(prev => ({ ...prev, ...data }));
        return;
      }

      const foundInBookings = bookings.find(b => b.guestDetails?.idNumber === idNumber);
      if (foundInBookings?.guestDetails) {
        const details = foundInBookings.guestDetails;
        if (!phone) setPhone(details.phone || '');
        if (!firstName) setFirstName(details.firstNameTH || '');
        if (!lastName) setLastName(details.lastNameTH || '');
        setGuestData(prev => ({ ...prev, ...details }));
      }
    }
  }, [idNumber]);

  const isFormValid = idNumber.trim() !== '' && phone.trim() !== '';

  const handleIDScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await processIDCardOCR(base64);
        setGuestData(result);
        setIdNumber(result.idNumber);
        setFirstName(result.firstNameTH);
        setLastName(result.lastNameTH);
        toast.success('อ่านบัตรประชาชนสำเร็จ');
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error('ไม่สามารถอ่านบัตรได้: ' + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('กรุณากรอกเลขบัตรประชาชนและเบอร์โทรศัพท์');
      return;
    }
    onComplete({
      guestDetails: { 
        ...guestData, 
        idNumber, 
        phone,
        firstNameTH: firstName,
        lastNameTH: lastName
      } as GuestData,
      roomNumber,
      status: 'checked_in',
      roomStatus: 'Occupied',
      depositAmount: deposit,
      depositStatus: 'paid',
      checkInTime: new Date().toISOString()
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ลงทะเบียนเช็คอิน (Check-in)</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Guest Registration Room {roomNumber}</p>
        </div>
        <button onClick={onCancel} className="text-slate-300 hover:text-slate-500 transition-colors text-2xl">✕</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: ID Scanner & Info */}
        <div className="space-y-6">
          <div className="relative">
             <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">ID Card / Passport Scanner</label>
             <button 
               onClick={() => fileInputRef.current?.click()}
               disabled={isScanning}
               className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${isScanning ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-indigo-50/30 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-500'}`}
             >
               {isScanning ? (
                 <>
                   <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                   <span className="text-[10px] font-black uppercase">กำลังประมวลผล...</span>
                 </>
               ) : (
                 <>
                   <span className="text-3xl mb-2">🪪</span>
                   <span className="text-[10px] font-black uppercase">คลิกเพื่อสแกนบัตรประชาชน</span>
                 </>
               )}
             </button>
             <input type="file" ref={fileInputRef} onChange={handleIDScan} className="hidden" accept="image/*" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">ชื่อ (Thai)</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">นามสกุล (Thai)</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">เลขบัตรประชาชน <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
                placeholder="Required"
                className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 ${!idNumber ? 'ring-2 ring-red-100' : ''} ring-indigo-500`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Required"
                className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 ${!phone ? 'ring-2 ring-red-100' : ''} ring-indigo-500`}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Room & Payment */}
        <div className="space-y-6">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">หมายเลขห้องพัก</label>
              <input 
                type="text" 
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-lg font-black text-slate-800 outline-none"
              />
           </div>

           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">เงินประกันกุญแจ (Deposit)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-lg font-black text-slate-800 outline-none pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">฿</span>
              </div>
           </div>

           <div className="pt-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">ลายเซ็นยืนยันการเข้าพัก</label>
              <div className="h-40 border-2 border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 italic text-xs">
                 (ส่วนสำหรับเซ็นชื่อ - Digital Signature Pad)
              </div>
           </div>

           <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-4 rounded-2xl text-xs font-black uppercase text-slate-400 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-[2] px-6 py-4 rounded-2xl text-xs font-black uppercase text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                ยืนยันการเข้าพัก (Complete Check-in)
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInForm;
