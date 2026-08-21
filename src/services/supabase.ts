import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EstimationRecord, NASA93Input } from '../types';

export const SUPABASE_DEFAULT_URL = 'https://wujrpsepjgqlctyyoees.supabase.co';
export const SUPABASE_DEFAULT_KEY = 'sb_publishable_wJcYRnANccjP1QfCYi6GYg_0y0MzuAN';

let supabaseClient: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_DEFAULT_URL, SUPABASE_DEFAULT_KEY, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    } catch (e) {
      console.warn('Supabase init note', e);
    }
  }
  return supabaseClient;
}

export async function syncEstimationToSupabase(record: EstimationRecord): Promise<boolean> {
  try {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client.from('estimation_records').upsert({
      id: record.id,
      timestamp: record.timestamp,
      projectname: record.projectname,
      cat2: record.cat2,
      kloc: record.kloc,
      mode: record.mode,
      estimated_effort: record.estimated_effort,
      schedule_months: record.schedule_months,
      model: record.model,
      inputs: record.inputs,
      created_by: record.createdBy || 'Lead Estimator',
      created_by_email: record.createdByUserEmail || null,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteEstimationFromSupabase(id: string): Promise<boolean> {
  try {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client.from('estimation_records').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchEstimationsFromSupabase(): Promise<EstimationRecord[] | null> {
  try {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client
      .from('estimation_records')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data) return null;
    return data.map((item: any) => ({
      id: item.id,
      timestamp: item.timestamp,
      projectname: item.projectname,
      cat2: item.cat2,
      kloc: Number(item.kloc),
      mode: item.mode,
      estimated_effort: Number(item.estimated_effort),
      schedule_months: Number(item.schedule_months),
      model: item.model,
      inputs: item.inputs as NASA93Input,
      createdBy: item.created_by,
      createdByUserEmail: item.created_by_email,
    }));
  } catch {
    return null;
  }
}
