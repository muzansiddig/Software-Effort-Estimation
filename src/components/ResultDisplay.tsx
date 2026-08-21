import React, { useState } from 'react';
import { CheckCircle2, Clock, Users, Calendar, Save, Share2 } from 'lucide-react';
import { PredictionResult, NASA93Input } from '../types';

interface ResultDisplayProps {
  result: PredictionResult;
  input: NASA93Input;
  lang: 'en' | 'ar';
  onSave: () => void;
  isSaved: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  input,
  lang,
  onSave,
  isSaved,
}) => {
  const isAr = lang === 'ar';
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `SEE Pro NASA93 Estimation:
Project: ${input.projectname} (${input.cat2})
Size: ${input.equivphyskloc} KLOC
Model: ${result.model}
Estimated Effort: ${result.estimated_effort} Person-Months (~${result.person_hours.toLocaleString()} hours)
Estimated Schedule (TDEV): ${result.schedule_months} Months
Average Staff: ${result.average_staff} Full-time Engineers
95% Confidence Interval: [${result.confidence_interval.lower} PM - ${result.confidence_interval.upper} PM]
SVR Comparison: ${result.svr_comparison.estimated_effort} PM (${result.svr_comparison.difference_percentage}% diff)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {isAr ? 'نتائج التقدير الإحصائي والنمذجة' : 'Estimation & Statistical Output'}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {result.model} • NASA93 Data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? (isAr ? 'تم الحفظ بالسجل ✓' : 'Saved ✓') : (isAr ? 'حفظ في السجل' : 'Save Record')}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ التقرير' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Main Metric */}
      <div className="py-6 text-center border-b border-slate-100 bg-slate-50/50 rounded-xl">
        <span className="text-[11px] uppercase font-bold text-slate-600 font-mono">
          {isAr ? 'الجهد البرمجي المقدر (Estimated Effort)' : 'Estimated Software Effort'}
        </span>
        <div className="mt-2 flex items-baseline justify-center gap-2 font-mono">
          <span className="text-5xl font-black text-slate-900">{result.estimated_effort}</span>
          <span className="text-sm font-bold text-slate-600">Person-Months (PM)</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          ≈ {result.person_hours.toLocaleString()} {isAr ? 'ساعة عمل هندسية' : 'Engineering Hours'}
        </p>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold">{isAr ? 'الجدول الزمني (TDEV)' : 'Schedule (TDEV)'}</span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{result.schedule_months} <span className="text-xs font-normal text-slate-500">Months</span></p>
          <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'زمن إنجاز دورة حياة البرمجية' : 'Estimated development cycle'}</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold">{isAr ? 'متوسط حجم الفريق' : 'Average Staff Size'}</span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{result.average_staff} <span className="text-xs font-normal text-slate-500">Engineers</span></p>
          <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'مهندسون بدوام كامل متزامن' : 'Full-time equivalent engineers'}</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold">{isAr ? 'فترة الثقة 95%' : '95% Confidence'}</span>
          </div>
          <p className="text-lg font-black text-slate-900 font-mono">[{result.confidence_interval.lower} - {result.confidence_interval.upper}] <span className="text-xs font-normal text-slate-500">PM</span></p>
          <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'مجال الخطأ الإحصائي الموثوق' : 'Statistical error bound'}</p>
        </div>

      </div>

      {/* SVR Comparison Banner */}
      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 font-mono">
        <span className="text-slate-700">
          {isAr ? 'مقارنة بنموذج SVR-RBF المنافس:' : 'Comparison with SVR-RBF:'} <strong className="text-slate-900">{result.svr_comparison.estimated_effort} PM</strong>
        </span>
        <span className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-bold">
          Δ {result.svr_comparison.difference_percentage}% difference
        </span>
      </div>

    </div>
  );
};
