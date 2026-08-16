export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'lead' | 'manager' | 'engineer' | 'researcher' | 'admin';
  roleTitle: string;
  roleTitleAr: string;
  photoUrl?: string;
  uid?: string;
}

export interface NASA93Input {
  projectname: string;
  cat2: string;
  forg: string;
  center: number;
  year: number;
  mode: string;
  equivphyskloc: number;
  rely: string;
  data: string;
  cplx: string;
  time: string;
  stor: string;
  virt: string;
  turn: string;
  acap: string;
  aexp: string;
  pcap: string;
  vexp: string;
  lexp: string;
  modp: string;
  tool: string;
  sced: string;
}

export interface PredictionResult {
  estimated_effort: number;
  unit: string;
  person_hours: number;
  schedule_months: number;
  average_staff: number;
  model: string;
  dataset: string;
  eaf: number;
  driver_breakdown?: Record<string, { level: string; weight: number }>;
  svr_comparison: {
    model: string;
    estimated_effort: number;
    unit: string;
    difference_percentage: number;
  };
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

export interface EstimationRecord {
  id: string;
  timestamp: string;
  projectname: string;
  cat2: string;
  kloc: number;
  mode: string;
  estimated_effort: number;
  schedule_months: number;
  model: string;
  inputs: NASA93Input;
  createdBy?: string;
  createdByUserEmail?: string;
  userId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  extractedData?: Partial<NASA93Input>;
}
