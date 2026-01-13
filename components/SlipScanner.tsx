import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Transaction, TransactionType, Category } from '../types';

interface SlipScannerProps {
  onTransactionScanned: (transaction: Omit<Transaction, 'id'>) => void;
}

interface SlipData {
  customer_name: string;
  amount: number;
  date: string;
  time: string;
  bank: string;
  from_account: string;
  to_account: string;
  reference: string;
}

const SlipScanner: React.FC<SlipScannerProps> = ({ onTransactionScanned }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<SlipData | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const scanSlip = async () => {
    if (!imagePreview) {
      toast.error('กรุณาเลือกรูปสลิปก่อน');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch('/api/scan-slip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imagePreview
        })
      });

      const result = await response.json();

      if (result.success) {
        setScannedData(result.data);
        setDescription(`รับชำระค่าห้องพัก จาก ${result.data.customer_name} (${result.data.bank})`);
        toast.success('✅ สแกนสลิปสำเร็จ! ตรวจสอบข้อมูลและบันทึก');
      } else {
        toast.error(result.error || 'ไม่สามารถอ่านสลิปได้');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = () => {
    if (!scannedData) {
      toast.error('กรุณาสแกนสลิปก่อน');
      return;
    }

    if (!scannedData.amount || scannedData.amount <= 0) {
      toast.error('กรุณาระบุจำนวนเงิน');
      return;
    }

    const transaction: Omit<Transaction, 'id'> = {
      date: scannedData.date,
      amount: scannedData.amount,
      type: TransactionType.INCOME,
      category: Category.ROOM_REVENUE,
      description: description || `รับชำระเงิน จาก ${scannedData.customer_name}`,
      imageUrl: imagePreview || undefined,
      isReconciled: true
    };

    onTransactionScanned(transaction);
    toast.success('บันทึกรายการสำเร็จ!');

    // Reset form
    setImagePreview(null);
    setScannedData(null);
    setDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    setImagePreview(null);
    setScannedData(null);
    setDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-800">AI Slip Scanner</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            สแกนสลิปโอนเงินอัตโนมัติด้วย AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image Upload */}
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-[2rem] p-6 min-h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Slip preview"
                  className="max-w-full max-h-[380px] rounded-2xl shadow-lg"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <div className="text-6xl mb-4">📸</div>
                  <p className="font-bold">เลือกรูปสลิปโอนเงิน</p>
                  <p className="text-xs mt-2">รองรับ JPG, PNG</p>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
              >
                📁 เลือกรูปภาพ
              </button>
              {imagePreview && (
                <button
                  onClick={handleReset}
                  className="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  🗑️
                </button>
              )}
            </div>

            {imagePreview && !scannedData && (
              <button
                onClick={scanSlip}
                disabled={isScanning}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? '⏳ กำลังอ่านสลิป...' : '✨ สแกนด้วย AI'}
              </button>
            )}
          </div>

          {/* Right: Scanned Data */}
          <div className="space-y-4">
            {scannedData ? (
              <>
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl">
                      ✓
                    </div>
                    <div>
                      <p className="font-black text-emerald-800">สแกนสำเร็จ</p>
                      <p className="text-xs text-emerald-600">ข้อมูลจากสลิป</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase">ผู้โอน</label>
                      <input
                        type="text"
                        value={scannedData.customer_name}
                        onChange={(e) => setScannedData({ ...scannedData, customer_name: e.target.value })}
                        className="w-full p-3 bg-white rounded-xl font-bold border border-slate-200 mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase">วันที่</label>
                        <input
                          type="date"
                          value={scannedData.date}
                          onChange={(e) => setScannedData({ ...scannedData, date: e.target.value })}
                          className="w-full p-3 bg-white rounded-xl font-bold border border-slate-200 mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase">เวลา</label>
                        <input
                          type="text"
                          value={scannedData.time}
                          onChange={(e) => setScannedData({ ...scannedData, time: e.target.value })}
                          className="w-full p-3 bg-white rounded-xl font-bold border border-slate-200 mt-1"
                          placeholder="HH:MM"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase">จำนวนเงิน</label>
                      <input
                        type="number"
                        step="0.01"
                        value={scannedData.amount}
                        onChange={(e) => setScannedData({ ...scannedData, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 bg-white rounded-xl font-black text-2xl text-emerald-600 border border-slate-200 mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase">ธนาคาร</label>
                      <input
                        type="text"
                        value={scannedData.bank}
                        onChange={(e) => setScannedData({ ...scannedData, bank: e.target.value })}
                        className="w-full p-3 bg-white rounded-xl font-bold border border-slate-200 mt-1"
                      />
                    </div>

                    {scannedData.reference && (
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase">เลขอ้างอิง</label>
                        <input
                          type="text"
                          value={scannedData.reference}
                          readOnly
                          className="w-full p-3 bg-slate-50 rounded-xl font-mono text-xs border border-slate-200 mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ระบุรายละเอียด เช่น ห้อง, หมายเหตุ..."
                    className="w-full p-4 bg-slate-50 rounded-2xl font-medium border border-slate-200"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
                >
                  ✅ บันทึกรายการ
                </button>
              </>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center text-slate-300">
                  <div className="text-5xl mb-3">🤖</div>
                  <p className="font-bold text-slate-400">รอการสแกนสลิป</p>
                  <p className="text-xs mt-2">เลือกรูปและกดปุ่มสแกน</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white">
        <h3 className="text-xl font-black mb-4">💡 วิธีใช้งาน</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <div className="text-3xl mb-3">1️⃣</div>
            <h4 className="font-black mb-2">อัพโหลดสลิป</h4>
            <p className="text-sm opacity-90">เลือกรูปสลิปโอนเงินจากธนาคาร</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <div className="text-3xl mb-3">2️⃣</div>
            <h4 className="font-black mb-2">ให้ AI อ่าน</h4>
            <p className="text-sm opacity-90">กดปุ่มสแกน AI จะอ่านข้อมูลอัตโนมัติ</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <div className="text-3xl mb-3">3️⃣</div>
            <h4 className="font-black mb-2">ตรวจสอบและบันทึก</h4>
            <p className="text-sm opacity-90">ตรวจสอบความถูกต้องแล้วกดบันทึก</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlipScanner;
