export type Evidence = { id: string; text: string; current: boolean };
export type Input = {
  caseId: string; question: string; tenant: string; evidenceTenant: string;
  evidence: Evidence[]; timeoutAttempts?: number;
  action: 'draft' | 'register'; draftVersion: number;
  approval?: { approved: boolean; version: number };
};
export type Expected = { status: string; required: string[]; forbidden?: string[]; citations: string[]; writes: number };
export type Case = { input: Input; expectedOutput: Expected; metadata: { category: string; critical: boolean } };
export type Variant = 'baseline' | 'prompt' | 'model';
export type Result = {
  caseId: string; status: string; answer: string; citations: string[];
  events: string[]; writes: number; latencyMs: number; attempts: number;
  tokens: { input: number; output: number; cached?: number } | null;
  costUsd: number | null; mode: 'fixture' | 'live'; traceId?: string;
  model?: string; error?: string;
};
