import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Trash2, 
  ExternalLink, 
  RotateCcw,
} from 'lucide-react';
import { EstimationRecord, NASA93Input } from '../types';
import { exportEstimationsToCSV } from '../services/api';

interface HistoryViewProps {
  records: EstimationRecord[];
  onDeleteRecord: (id: string) => void;
  onLoadRecord: (inputs: NASA93Input) => void;
  lang: 'en' | 'ar';
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onDeleteRecord,
  onLoadRecord,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<EstimationRecord | null>(null);

  const filteredRecords = records.filter((r) => {
    const matchSearch =
      r.projectname.toLowerCase().includes(search.toLowerCase()) ||
      r.cat2.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchMode = filterMode === 'all' || r.mode === filterMode;
    return matchSearch && matchMode;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header and Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
              REPOSITORY
            </span>
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? 'سجل مشاريع التقدير والبيانات المحفوظة' : 'Estimation Repository & History'}
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {isAr 
              ? 'أرشيف تقديرات المشاريع مع إمكانية التصدير، البحث، وإعادة التحميل في نموذج التقدير.'
              : 'Persistent repository of historical estimations with search, CSV export, and reload.'
            }
          </p>
        </div>

        <button
          onClick={() => exportEstimationsToCSV(records)}
          disabled={records.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isAr ? 'تصدير كـ CSV' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث باسم المشروع أو الفئة أو المعرف...' : 'Search by project name, category, or ID...'}
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-bold whitespace-nowrap">
            {isAr ? 'النمط:' : 'Mode:'}
          </label>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-slate-900 outline-hidden"
          >
            <option value="all">{isAr ? 'جميع الأنماط (All Modes)' : 'All Modes'}</option>
            <option value="organic">Organic</option>
            <option value="semidetached">Semi-Detached</option>
            <option value="embedded">Embedded</option>
          </select>
        </div>

      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">
              {isAr ? 'لا توجد سجلات مطابقة' : 'No records found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isAr ? 'قم بإجراء عملية تقدير في منصة التقدير وحفظ النتيجة.' : 'Perform an estimation in the Estimation Studio and click Save.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                  <th className="p-3.5">{isAr ? 'المشروع' : 'Project'}</th>
                  <th className="p-3.5">{isAr ? 'المقدّر' : 'Estimator'}</th>
                  <th className="p-3.5">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="p-3.5">{isAr ? 'الفئة' : 'Category'}</th>
                  <th className="p-3.5">{isAr ? 'الحجم' : 'Size'}</th>
                  <th className="p-3.5">{isAr ? 'النمط' : 'Mode'}</th>
                  <th className="p-3.5">{isAr ? 'الجهد المقدر' : 'Effort'}</th>
                  <th className="p-3.5">{isAr ? 'الجدول (TDEV)' : 'Schedule'}</th>
                  <th className="p-3.5 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 font-mono">{r.projectname}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{r.id.slice(0, 14)}...</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-xs text-slate-700">
                        {r.createdBy || (isAr ? 'مقدّر معتمد' : 'Lead Estimator')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-700 border border-slate-200">
                        {r.cat2}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {r.kloc} KLOC
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                        {r.mode}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {r.estimated_effort} <span className="text-[10px] font-normal text-slate-500">PM</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {r.schedule_months} <span className="text-[10px] text-slate-500">mos</span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onLoadRecord(r.inputs)}
                          className="p-1 hover:bg-slate-100 text-slate-700 rounded transition-colors"
                          title={isAr ? 'إعادة تحميل في نموذج التقدير' : 'Load into Estimation Studio'}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="p-1 hover:bg-slate-100 text-slate-700 rounded transition-colors"
                          title={isAr ? 'عرض التفاصيل' : 'Inspect Details'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecord(r.id)}
                          className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                          title={isAr ? 'حذف السجل' : 'Delete Record'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 max-w-xl w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedRecord.projectname} ({selectedRecord.cat2})
                </h3>
                <p className="text-xs text-slate-500 font-mono">Record ID: {selectedRecord.id}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div><span className="text-[10px] text-slate-500 uppercase font-bold block">Effort:</span> <span className="font-bold text-slate-900">{selectedRecord.estimated_effort} PM</span></div>
              <div><span className="text-[10px] text-slate-500 uppercase font-bold block">Schedule:</span> <span className="font-bold text-slate-900">{selectedRecord.schedule_months} Months</span></div>
              <div><span className="text-[10px] text-slate-500 uppercase font-bold block">KLOC:</span> <span className="font-bold text-slate-900">{selectedRecord.kloc} KLOC</span></div>
              <div><span className="text-[10px] text-slate-500 uppercase font-bold block">Mode:</span> <span className="font-bold text-slate-900 uppercase">{selectedRecord.mode}</span></div>
              <div><span className="text-[10px] text-slate-500 uppercase font-bold block">Center:</span> <span className="font-bold text-slate-900">Center #{selectedRecord.inputs.center}</span></div>
              <div><span className="text-[10px] text-slate-500 uppercase font-bold block">Org:</span> <span className="font-bold text-slate-900">{selectedRecord.inputs.forg === 'g' ? 'Government' : 'Facility'}</span></div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">15 Cost Drivers (EAF Vector):</h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center text-xs font-mono">
                {['rely', 'data', 'cplx', 'time', 'stor', 'virt', 'turn', 'acap', 'aexp', 'pcap', 'vexp', 'lexp', 'modp', 'tool', 'sced'].map((d) => (
                  <div key={d} className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="block text-[10px] uppercase font-bold text-slate-500">{d}</span>
                    <span className="font-bold text-slate-900">
                      {(selectedRecord.inputs as any)[d]?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
              <button
                onClick={() => {
                  onLoadRecord(selectedRecord.inputs);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-slate-800"
              >
                {isAr ? 'تحميل هذا السجل في الاستوديو' : 'Load into Studio'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
