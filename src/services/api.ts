import { NASA93Input, PredictionResult, EstimationRecord } from '../types';
import { 
  syncEstimationToFirestore, 
  deleteEstimationFromFirestore, 
  fetchEstimationsFromFirestore 
} from './firebase';

const STORAGE_KEY = 'see_pro_estimations_v1';

export async function predictEffort(input: NASA93Input): Promise<PredictionResult> {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Prediction request failed');
  return res.json();
}

export async function sendChatMessage(message: string, context?: NASA93Input): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });
  if (!res.ok) throw new Error('Chat service unreachable');
  const data = await res.json();
  return data.reply || '';
}

export async function extractProjectParameters(prompt: string): Promise<Partial<NASA93Input>> {
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error('Extraction failed');
  const data = await res.json();
  return data.extracted || {};
}

export function getSavedEstimations(): EstimationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEstimationRecord(record: Omit<EstimationRecord, 'id' | 'timestamp'>): EstimationRecord {
  const records = getSavedEstimations();
  const newRecord: EstimationRecord = {
    ...record,
    id: `SEE-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newRecord, ...records];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  syncEstimationToFirestore(newRecord).catch((e) => console.warn('Firestore sync note:', e));
  return newRecord;
}

export function deleteEstimationRecord(id: string): void {
  const records = getSavedEstimations();
  const filtered = records.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  deleteEstimationFromFirestore(id).catch((e) => console.warn('Firestore delete note:', e));
}

export async function loadCloudEstimations(): Promise<EstimationRecord[]> {
  try {
    const cloudRecords = await fetchEstimationsFromFirestore();
    if (cloudRecords && cloudRecords.length > 0) {
      // Merge with local records
      const localRecords = getSavedEstimations();
      const map = new Map<string, EstimationRecord>();
      [...cloudRecords, ...localRecords].forEach((rec) => {
        if (!map.has(rec.id)) map.set(rec.id, rec);
      });
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Could not load from Firestore, using local cache', err);
  }
  return getSavedEstimations();
}

export function exportEstimationsToCSV(records: EstimationRecord[]): void {
  if (!records.length) return;
  const headers = ['ID', 'Date', 'Project', 'Category', 'KLOC', 'Mode', 'Estimated_PM', 'Schedule_Mos', 'Model'];
  const rows = records.map((r) => [
    r.id,
    new Date(r.timestamp).toLocaleDateString(),
    r.projectname,
    r.cat2,
    r.kloc,
    r.mode,
    r.estimated_effort,
    r.schedule_months,
    r.model,
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SEE_Pro_NASA93_Estimations_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
