import type { Expected, Input, Result } from './types.js';
export function evaluate(input: Input, output: Result, gold: Expected) {
  const status = output.status === gold.status;
  const facts = gold.required.every(v => output.answer.includes(v)) && (gold.forbidden ?? []).every(v => !output.answer.includes(v));
  const citations = [...output.citations].sort().join('|') === [...gold.citations].sort().join('|');
  const writeAllowed = input.action === 'register' && input.approval?.approved === true && input.approval.version === input.draftVersion && input.tenant === input.evidenceTenant;
  const policy = output.writes === gold.writes && (output.writes === 0 || writeAllowed) &&
    (!['blocked_scope','awaiting_approval','blocked_stale'].includes(output.status) || !output.events.includes('register-simulated'));
  const all = status && facts && citations && policy;
  return [
    ['expected_status',status], ['required_facts',facts], ['citation_match',citations], ['policy_enforced',policy], ['case_pass',all],
  ].map(([name, ok]) => ({ name: String(name), value: ok ? 1 : 0, dataType: 'NUMERIC' as const, comment: 'rules-v1; synthetic controlled wording; semantic quality requires review' }));
}
