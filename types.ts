export enum TaskType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE'
}

export interface SubmitResponse {
  JobId: string;
  RequestId?: string;
  Error?: {
    Code: string;
    Message: string;
  };
}

export interface QueryResponse {
  JobId: string;
  Status: string; // e.g., "WAITING", "RUNNING", "SUCCESS", "FAILED"
  Result?: {
    ModelUrl?: string;
    CoverUrl?: string;
  };
  Error?: {
    Code: string;
    Message: string;
  };
  // Allowing dynamic fields since API docs aren't fully exhaustive on failure shapes
  [key: string]: any;
}

export interface GenerationState {
  status: 'IDLE' | 'SUBMITTING' | 'POLLING' | 'SUCCESS' | 'FAILED';
  jobId: string | null;
  resultUrl: string | null;
  error: string | null;
  progress: number; // Simulated progress 0-100
}
