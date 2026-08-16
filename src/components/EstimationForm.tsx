import React from 'react';
import { Calculator, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { NASA93Input } from '../types';
import { NASA93_METADATA as meta, INITIAL_FORM_STATE } from '../constants/nasa93_metadata';

interface EstimationFormProps {
  form: NASA93Input;
  setForm: React.Dispatch<React.SetStateAction<NASA93Input>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  lang: 'en' | 'ar';
}

const DRIVER_GROUPS = [
  { id: 'product', title: '03. سمات المنتج والتعقيد (Product Attributes)', titleEn: '03. Product Attributes', keys: ['rely', 'data', 'cplx'] },
  { id: 'computer', title: '04. قيود منصة التشغيل والعتاد (Platform Constraints)', titleEn: '04. Platform Constraints', keys: ['time', 'stor', 'virt', 'turn'] },
  { id: 'personnel', title: '05. سمات وكفاءة فريق العمل (Personnel Attributes)', titleEn: '05. Personnel Attributes', keys: ['acap', 'aexp', 'pcap', 'vexp', 'lexp'] },
  { id: 'project', title: '06. سمات بيئة المشروع والتطوير (Project Attributes)', titleEn: '06. Project Attributes', keys: ['modp', 'tool', 'sced'] },
];

export const EstimationForm: React.FC<EstimationFormProps> = ({
  form,
  setForm,
  onSubmit,
  loading,
  error,
  lang,
}) => {
  const isAr = lang === 'ar';

  const handleChange = (name: keyof NASA93Input, value: any) => {
    setForm((prev) => ({
      ...prev,
      [name]: typeof prev[name] === 'number' ? (isNaN(parseFloat(value)) ? 0 : parseFloat(value)) : value,
    }));
  };

  const currentEAF = Object.keys(meta.costDrivers).reduce((acc, key) => {
    const lvl = (form[key as keyof NASA93Input] as string) || 'n';
    return acc * (meta.driverWeights[key]?.[lvl] ?? 1.0);
  }, 1.0);

  const applyComplexityPreset = (level: 'low' | 'nominal' | 'high') => {
    if (level === 'low') {
      setForm((p) => ({ ...p, rely: 'l', cplx: 'l', acap: 'vh', pcap: 'vh', tool: 'h', modp: 'h', stor: 'n', time: 'n' }));
    } else if (level === 'nominal') {
      setForm((p) => ({ ...p, rely: 'n', cplx: 'n', acap: 'h', pcap: 'h', tool: 'n', modp: 'n', stor: 'n', time: 'n' }));
    } else {
      setForm((p) => ({ ...p, rely: 'vh', cplx: 'vh', acap: 'vh', pcap: 'vh', tool: 'vh', modp: 'vh', stor: 'h', time: 'vh' }));
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Top Academic Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
              ESTIMATION
            </span>
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? 'نموذج إدخال معايير كوكومو وقاعدة بيانات NASA93' : 'COCOMO II & NASA93 Feature Input Specification'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAr ? '22 متغيراً ومقياساً رقمياً لحساب الجهد والجدول الزمني بدقة.' : '22 discrete features and numeric scale ratings.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-600 px-1">{isAr ? 'قوالب جاهزة:' : 'Presets:'}</span>
            <button type="button" onClick={() => applyComplexityPreset('low')} className="px-2 py-0.5 rounded bg-white text-slate-700 font-semibold hover:bg-slate-50 border border-slate-200">
              {isAr ? 'منخفض' : 'Low'}
            </button>
            <button type="button" onClick={() => applyComplexityPreset('nominal')} className="px-2 py-0.5 rounded bg-white text-slate-700 font-semibold hover:bg-slate-50 border border-slate-200">
              {isAr ? 'قياسي' : 'Nominal'}
            </button>
            <button type="button" onClick={() => applyComplexityPreset('high')} className="px-2 py-0.5 rounded bg-white text-slate-700 font-semibold hover:bg-slate-50 border border-slate-200">
              {isAr ? 'فائق' : 'Critical'}
            </button>
          </div>

          <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-800">
            EAF: <span className="text-slate-900">{currentEAF.toFixed(3)}</span>
          </div>

          <button
            type="button"
            onClick={() => setForm(INITIAL_FORM_STATE)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 01. Project Context */}
      <div className="space-y-3 pb-5 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          {isAr ? '01. معلومات وسياق المشروع (Project Context)' : '01. Project Context & Environment'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">{meta.projectname.label}</label>
            <select
              value={form.projectname}
              onChange={(e) => handleChange('projectname', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-hidden font-mono"
            >
              {meta.projectname.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">{meta.cat2.label}</label>
            <select
              value={form.cat2}
              onChange={(e) => handleChange('cat2', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-hidden font-mono"
            >
              {meta.cat2.options.map((opt) => (
                <option key={opt.v} value={opt.v}>{opt.l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">{meta.mode.label}</label>
            <select
              value={form.mode}
              onChange={(e) => handleChange('mode', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-hidden font-mono"
            >
              {meta.mode.options.map((opt) => (
                <option key={opt.v} value={opt.v}>{opt.l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">{meta.forg.label}</label>
            <select
              value={form.forg}
              onChange={(e) => handleChange('forg', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-hidden font-mono"
            >
              {meta.forg.options.map((opt) => (
                <option key={opt.v} value={opt.v}>{opt.l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">{meta.center.label}</label>
            <select
              value={form.center}
              onChange={(e) => handleChange('center', Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-hidden font-mono"
            >
              {meta.center.options.map((opt) => (
                <option key={opt.v} value={opt.v}>{opt.l}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* 02. Project Physical Size (KLOC) */}
      <div className="space-y-3 pb-5 border-b border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isAr ? '02. حجم الكود البرمجي (Physical Size - EQUIVPHYSKLOC)' : '02. Code Size (EQUIVPHYSKLOC)'}
            </h3>
            <p className="text-[11px] text-slate-500">{isAr ? 'حجم الأسطر البرمجية بوحدة آلاف الأسطر (KLOC).' : 'Thousands of equivalent source lines of code.'}</p>
          </div>
          <div className="flex items-center gap-1 font-mono font-bold text-sm bg-white px-3 py-1 rounded-lg border border-slate-200">
            <span>{form.equivphyskloc}</span>
            <span className="text-xs text-slate-500 font-normal">KLOC</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="300"
            step="0.5"
            value={form.equivphyskloc}
            onChange={(e) => handleChange('equivphyskloc', e.target.value)}
            className="flex-1 accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <input
            type="number"
            min="0.1"
            max="1500"
            step="0.1"
            value={form.equivphyskloc}
            onChange={(e) => handleChange('equivphyskloc', e.target.value)}
            className="w-24 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900"
          />
        </div>
      </div>

      {/* 03-06 Cost Driver Categories */}
      {DRIVER_GROUPS.map((group) => (
        <div key={group.id} className="space-y-3 pb-5 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {isAr ? group.title : group.titleEn}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.keys.map((key) => {
              const driver = meta.costDrivers[key as keyof typeof meta.costDrivers];
              const currentVal = form[key as keyof NASA93Input] as string;
              const currentLevel = meta.costDriverLevels.find((lvl) => lvl.v === currentVal) || meta.costDriverLevels[2];
              const currentWeight = meta.driverWeights[key]?.[currentVal] ?? 1.0;

              return (
                <div key={key} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[11px]">{driver.code}</span>
                      <span className="truncate max-w-[140px]" title={isAr ? driver.labelAr : driver.label}>
                        {isAr ? driver.labelAr : driver.label}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {currentWeight}x
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-1 text-center font-mono">
                    {meta.costDriverLevels.map((lvl) => {
                      const isSelected = form[key as keyof NASA93Input] === lvl.v;
                      return (
                        <button
                          key={lvl.v}
                          type="button"
                          onClick={() => handleChange(key as keyof NASA93Input, lvl.v)}
                          className={`py-1 rounded text-[11px] font-bold transition-all border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={`${lvl.l} (${lvl.num})`}
                        >
                          <span className="block text-[9px] opacity-75">{lvl.num}</span>
                          <span className="block">{lvl.short}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500 font-mono">
          Model: Random Forest Regressor • Ground Truth: NASA93 Benchmark
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          <span>{loading ? (isAr ? 'جارٍ الحساب والتقدير...' : 'Calculating...') : (isAr ? 'حساب التقدير البرمجي (Estimate Effort)' : 'Estimate Software Effort')}</span>
        </button>
      </div>

    </form>
  );
};
