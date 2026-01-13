
import React from 'react';
import { GuestData } from '../types';

interface PrintableDocumentProps {
  guest: GuestData;
  type: 'RR3' | 'RECEIPT' | 'TAX_INVOICE';
  amount: number;
  roomNumber: string;
  description: string;
  resortInfo: {
    resortName: string;
    resortAddress: string;
    taxId: string;
    phone: string;
  };
}

const PrintableDocument: React.FC<PrintableDocumentProps> = ({ guest, type, amount, roomNumber, description, resortInfo }) => {
  const getTitle = () => {
    switch(type) {
      case 'RR3': return 'ใบแจ้งการรับคนเข้าพัก (ร.ร. 3)';
      case 'RECEIPT': return 'ใบรับเงินชั่วคราว / เงินมัดจำ';
      case 'TAX_INVOICE': return 'ใบเสร็จรับเงิน / ใบกำกับภาษี';
    }
  };

  // Calculate taxes for Tax Invoice
  const vatRate = 0.07;
  const preVat = amount / (1 + vatRate);
  const vat = amount - preVat;

  return (
    <div id="print-area" className="w-[210mm] min-h-[297mm] p-[20mm] bg-white text-black font-serif text-[12pt] leading-relaxed shadow-lg mx-auto">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; margin: 0; padding: 15mm; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold uppercase text-slate-900">{resortInfo.resortName}</h1>
          <p className="text-xs text-slate-600 whitespace-pre-line">{resortInfo.resortAddress}</p>
          <p className="text-xs text-slate-600">เลขประจำตัวผู้เสียภาษี: {resortInfo.taxId}</p>
          <p className="text-xs text-slate-600">โทร: {resortInfo.phone}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold mb-2 text-indigo-900">{getTitle()}</h2>
          <p className="text-sm">เลขที่เอกสาร: {(Date.now().toString().slice(-8))}</p>
          <p className="text-sm">วันที่ออก: {new Date().toLocaleDateString('th-TH')}</p>
        </div>
      </div>

      {/* Guest Section */}
      <div className="grid grid-cols-2 gap-8 mb-12 border p-6 rounded-md bg-slate-50/50">
        <div>
          <h4 className="text-[10pt] font-bold text-gray-500 uppercase mb-2">ลูกค้า / ผู้เข้าพัก</h4>
          <p className="font-bold text-lg">{guest.title} {guest.firstNameTH} {guest.lastNameTH}</p>
          <p className="text-sm text-slate-500">({guest.firstNameEN} {guest.lastNameEN})</p>
          <p className="text-sm mt-2 leading-snug">{guest.address}</p>
          {guest.customerType && (
            <div className="mt-3 inline-block bg-indigo-600 text-white px-3 py-1 rounded text-[9pt] font-bold">
              ประเภท: {guest.customerType}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-[10pt] font-bold text-gray-500 uppercase mb-2">รายละเอียดการเข้าพัก</h4>
          <p><span className="font-bold">เลขห้อง:</span> {roomNumber || '-'}</p>
          <p><span className="font-bold">ID Number:</span> {guest.idNumber}</p>
          <p><span className="font-bold">วันเกิด:</span> {guest.dob ? new Date(guest.dob).toLocaleDateString('th-TH') : '-'}</p>
          {type === 'RR3' && <p className="mt-2 text-sm italic text-indigo-600">วัตถุประสงค์: เข้าพักแรมชั่วคราว</p>}
        </div>
      </div>

      {/* Items Section */}
      <table className="w-full mb-12 border-collapse">
        <thead>
          <tr className="border-y-2 border-black bg-slate-100">
            <th className="py-4 px-2 text-left">รายละเอียดรายการ</th>
            <th className="py-4 px-2 text-center w-24">จำนวน</th>
            <th className="py-4 px-2 text-right w-40">ราคาหน่วย</th>
            <th className="py-4 px-2 text-right w-40">รวมเงิน</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="py-4 px-2">
              <p className="font-bold">{description || 'ค่าบริการห้องพัก'}</p>
              <p className="text-xs text-slate-500">Room: {roomNumber}</p>
            </td>
            <td className="py-4 px-2 text-center">1</td>
            <td className="py-4 px-2 text-right">{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td className="py-4 px-2 text-right">{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
        </tbody>
      </table>

      {/* Financial Summary */}
      <div className="flex justify-end">
        <div className="w-80 space-y-2">
          {type === 'TAX_INVOICE' ? (
            <>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm text-slate-600">รวมเงิน (Subtotal)</span>
                <span>{preVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>ภาษีมูลค่าเพิ่ม 7% (VAT)</span>
                <span>{vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-sm text-slate-600">รวมเงินทั้งสิ้น</span>
              <span>{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl border-t-2 border-black pt-2 text-indigo-900">
            <span>ยอดสุทธิ (Total)</span>
            <span>฿{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-40 grid grid-cols-2 gap-20 text-center">
        <div className="space-y-12">
          <div className="border-b border-black"></div>
          <p className="text-sm font-bold">ลายมือชื่อลูกค้า (Guest Signature)</p>
        </div>
        <div className="space-y-12">
          <div className="border-b border-black"></div>
          <p className="text-sm font-bold">ผู้รับเงิน / พนักงาน (Authorized Officer)</p>
        </div>
      </div>

      <div className="mt-24 text-[8pt] text-gray-400 text-center uppercase tracking-widest border-t pt-4">
        This is an electronically generated document. Thank you for choosing {resortInfo.resortName}.
      </div>
    </div>
  );
};

export default PrintableDocument;
