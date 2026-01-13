import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Booking } from '../types';
import toast from 'react-hot-toast';
import { getRoomTypeByNumber, calculateNights, calculateTotalAmount, calculateDeposit } from '../config/rooms';

interface OTAImportProps {
  onImportBookings: (bookings: Omit<Booking, 'id' | 'status'>[]) => void;
}

interface OTABookingRow {
  // Standard OTA export columns
  'Guest Name'?: string;
  'Room'?: string;
  'Room Number'?: string;
  'Channel'?: string;
  'Check In Date'?: string;
  'Check Out Date'?: string;
  'Check In'?: string;
  'Check Out'?: string;
  'Room Type'?: string;
  'Total'?: number;
  'Total Amount'?: number;
  'Payment Total'?: number;
  'Confirmation Number'?: string;
  'Confirmation status'?: string;
  'Phone'?: string;
  'Email'?: string;

  // Alternative Thai column names
  'ชื่อแขก'?: string;
  'ห้อง'?: string;
  'ช่องทาง'?: string;
  'เข้าพัก'?: string;
  'ออก'?: string;
  'ประเภทห้อง'?: string;
  'ยอดรวม'?: number;
  'ยอดชำระ'?: number;
  'เลขยืนยัน'?: string;
  'สถานะ'?: string;
  'เบอร์โทร'?: string;
}

const OTAImport: React.FC<OTAImportProps> = ({ onImportBookings }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseDate = (dateValue: any): string => {
    if (!dateValue) return new Date().toISOString().split('T')[0];

    // If it's already a string in YYYY-MM-DD format
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    // If it's an Excel serial date number
    if (typeof dateValue === 'number') {
      const date = XLSX.SSF.parse_date_code(dateValue);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }

    // Try to parse as a date string
    try {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch (e) {
      // Fall through to default
    }

    return new Date().toISOString().split('T')[0];
  };

  const parseBookingRow = (row: OTABookingRow): Omit<Booking, 'id' | 'status'> | null => {
    // Support multiple column name variations
    const guestName = row['Guest Name'] || row['ชื่อแขก'] || '';
    const roomNumber = String(
      row['Room'] ||
      row['Room Number'] ||
      row['ห้อง'] ||
      ''
    ).toUpperCase().trim();

    const checkIn = parseDate(
      row['Check In Date'] ||
      row['Check In'] ||
      row['เข้าพัก']
    );

    const checkOut = parseDate(
      row['Check Out Date'] ||
      row['Check Out'] ||
      row['ออก']
    );

    const phone = row['Phone'] || row['เบอร์โทร'] || '';
    const confirmationNumber = row['Confirmation Number'] || row['เลขยืนยัน'] || '';
    const channel = row['Channel'] || row['ช่องทาง'] || 'OTA';

    if (!guestName || !roomNumber || !checkIn || !checkOut) {
      return null;
    }

    // Calculate amounts based on room type
    const nights = calculateNights(checkIn, checkOut);
    const calculatedTotal = calculateTotalAmount(roomNumber, checkIn, checkOut);
    const roomType = getRoomTypeByNumber(roomNumber);

    // Use provided amount or calculated amount (support multiple column names)
    const totalAmount = row['Total'] ||
                        row['Total Amount'] ||
                        row['Payment Total'] ||
                        row['ยอดรวม'] ||
                        row['ยอดชำระ'] ||
                        calculatedTotal;
    const depositAmount = calculateDeposit(totalAmount);

    return {
      guestName,
      roomNumber,
      checkIn,
      checkOut,
      totalAmount,
      nights,
      pricePerNight: roomType?.pricePerNight || 0,
      depositAmount,
      paymentStatus: 'unpaid',
      otaChannel: channel,
      confirmationNumber: confirmationNumber,
      guestDetails: {
        idNumber: '',
        title: '',
        firstNameTH: guestName,
        lastNameTH: '',
        firstNameEN: '',
        lastNameEN: '',
        address: '',
        dob: '',
        issueDate: '',
        expiryDate: '',
        phone: phone,
        customerType: 'BOOKING' as any
      }
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet) as OTABookingRow[];

      if (jsonData.length === 0) {
        toast.error('ไฟล์ว่างเปล่า');
        setIsProcessing(false);
        return;
      }

      // Parse and validate bookings
      const bookings: Omit<Booking, 'id' | 'status'>[] = [];
      const errors: string[] = [];

      jsonData.forEach((row, index) => {
        const booking = parseBookingRow(row);
        if (booking) {
          bookings.push(booking);
        } else {
          errors.push(`แถวที่ ${index + 2}: ข้อมูลไม่ครบถ้วน`);
        }
      });

      if (bookings.length === 0) {
        toast.error('ไม่พบข้อมูลการจองที่ถูกต้อง');
        setIsProcessing(false);
        return;
      }

      setPreviewData(bookings);
      setShowPreview(true);

      if (errors.length > 0 && errors.length < 5) {
        toast.error(`พบข้อผิดพลาด: ${errors.join(', ')}`);
      } else if (errors.length >= 5) {
        toast.error(`พบข้อผิดพลาด ${errors.length} รายการ`);
      }

      toast.success(`อ่านข้อมูล ${bookings.length} การจองสำเร็จ`);
    } catch (error: any) {
      console.error(error);
      toast.error('อ่านไฟล์ไม่สำเร็จ: ' + error.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    onImportBookings(previewData);
    toast.success(`นำเข้า ${previewData.length} การจองสำเร็จ`);
    setShowPreview(false);
    setPreviewData([]);
  };

  const handleCancelImport = () => {
    setShowPreview(false);
    setPreviewData([]);
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Guest Name': 'John Doe',
        'Room Number': '101',
        'Check In': '2026-01-15',
        'Check Out': '2026-01-17',
        'Total Amount': 3000,
        'Phone': '081-234-5678'
      },
      {
        'Guest Name': 'สมชาย ใจดี',
        'Room Number': '201',
        'Check In': '2026-01-20',
        'Check Out': '2026-01-22',
        'Total Amount': 5000,
        'Phone': '082-345-6789'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
    XLSX.writeFile(wb, 'OTA_Booking_Template.xlsx');
    toast.success('ดาวน์โหลดไฟล์ตัวอย่างสำเร็จ');
  };

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4">📊</div>
            <h3 className="text-xl font-black mb-2">OTA Booking Import</h3>
            <p className="text-xs font-bold opacity-80 uppercase tracking-wide">Import from Excel or CSV</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          >
            📥 ดาวน์โหลดตัวอย่าง
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
            <p className="text-xs font-bold mb-3 opacity-90">รองรับคอลัมน์:</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-medium">
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                <span>Guest Name / ชื่อแขก</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                <span>Room Number / ห้อง</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                <span>Check In / เข้าพัก</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">✓</span>
                <span>Check Out / ออก</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-300">○</span>
                <span>Total Amount / ยอดรวม</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-300">○</span>
                <span>Phone / เบอร์โทร</span>
              </div>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '⏳ กำลังประมวลผล...' : '📂 อัพโหลด Excel/CSV'}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-800">ตรวจสอบข้อมูลก่อนนำเข้า</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                {previewData.length} การจอง
              </p>
            </div>

            <div className="flex-1 overflow-auto p-8">
              <div className="space-y-4">
                {previewData.map((booking, index) => (
                  <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm">
                          {index + 1}
                        </div>
                        {booking.otaChannel && (
                          <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                            {booking.otaChannel}
                          </div>
                        )}
                        {booking.confirmationNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ref: {booking.confirmationNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ชื่อแขก</p>
                        <p className="font-bold text-slate-800">{booking.guestName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ห้อง</p>
                        <p className="font-bold text-slate-800">{booking.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">เข้าพัก - ออก</p>
                        <p className="font-bold text-slate-800 text-xs">
                          {new Date(booking.checkIn).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {new Date(booking.checkOut).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ยอดรวม</p>
                        <p className="font-black text-indigo-600 text-lg">฿{booking.totalAmount.toLocaleString()}</p>
                        {booking.nights && booking.pricePerNight && (
                          <p className="text-[9px] text-slate-400">{booking.nights} คืน × ฿{booking.pricePerNight.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex gap-4">
              <button
                onClick={handleCancelImport}
                className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmImport}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
              >
                ยืนยันนำเข้า {previewData.length} รายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OTAImport;
