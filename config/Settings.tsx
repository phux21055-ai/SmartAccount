
import React from 'react';

interface SettingsProps {
  settings: {
    resortName: string;
    resortAddress: string;
    taxId: string;
    phone: string;
    aiModel: string;
    autoReconcile: boolean;
  };
  onUpdate: (newSettings: any) => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClearData }) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="mb-10">
          <h2 className="text-2xl font-black text-slate-800">System Configuration</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage Resort Info & AI Performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Resort Info Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="text-indigo-600">🏢</span> ข้อมูลรีสอร์ต (ใช้ในเอกสาร)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">ชื่อรีสอร์ต / สถานประกอบการ</label>
                <input 
                  type="text" 
                  value={settings.resortName}
                  onChange={(e) => handleChange('resortName', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">ที่อยู่ตามจดทะเบียน</label>
                <textarea 
                  value={settings.resortAddress}
                  onChange={(e) => handleChange('resortAddress', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold transition-all min-h-[100px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">เลขประจำตัวผู้เสียภาษี</label>
                  <input 
                    type="text" 
                    value={settings.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">เบอร์โทรศัพท์ติดต่อ</label>
                  <input 
                    type="text" 
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Settings Section */}
          <div className="space-y-8">
            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
              <h3 className="text-sm font-black text-indigo-800 flex items-center gap-2 mb-6">
                <span>🤖</span> AI Engine & Security
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-indigo-400 uppercase mb-3 block">Gemini AI Model Selection</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => handleChange('aiModel', 'gemini-3-flash-preview')}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        settings.aiModel === 'gemini-3-flash-preview' 
                        ? 'bg-white border-indigo-500 shadow-md' 
                        : 'bg-transparent border-indigo-100 text-indigo-300 hover:border-indigo-300'
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-xs font-black">Gemini 3 Flash</p>
                        <p className="text-[9px] opacity-70">Balanced Speed & Accuracy</p>
                      </div>
                      {settings.aiModel === 'gemini-3-flash-preview' && <span>✅</span>}
                    </button>
                    <button 
                      onClick={() => handleChange('aiModel', 'gemini-3-pro-preview')}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        settings.aiModel === 'gemini-3-pro-preview' 
                        ? 'bg-white border-indigo-500 shadow-md' 
                        : 'bg-transparent border-indigo-100 text-indigo-300 hover:border-indigo-300'
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-xs font-black">Gemini 3 Pro</p>
                        <p className="text-[9px] opacity-70">Deep Analysis & High Accuracy</p>
                      </div>
                      {settings.aiModel === 'gemini-3-pro-preview' && <span>✅</span>}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl">
                  <div>
                    <p className="text-xs font-black text-indigo-900">Auto Reconcile</p>
                    <p className="text-[9px] text-indigo-400 font-bold uppercase">ยืนยันรายการอัตโนมัติหลังสแกน</p>
                  </div>
                  <button 
                    onClick={() => handleChange('autoReconcile', !settings.autoReconcile)}
                    className={`w-12 h-6 rounded-full relative transition-all ${settings.autoReconcile ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoReconcile ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="pt-4 border-t border-indigo-100">
                  <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    API Connected via Environment Variable
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100">
              <h3 className="text-sm font-black text-rose-800 flex items-center gap-2 mb-4">
                <span>⚠️</span> Danger Zone
              </h3>
              <p className="text-[10px] text-rose-400 font-bold mb-6">ข้อมูลที่คุณลบจะไม่สามารถกู้คืนได้ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ</p>
              <button 
                onClick={onClearData}
                className="w-full bg-rose-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
              >
                ล้างข้อมูลรายการเดินบัญชีทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
