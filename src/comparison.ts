import type { Case, Result, Variant } from './types.js';
import type { evaluate } from './evaluate.js';

export type RunRow = { caseId: string; critical: boolean; input: Case['input']; expectedOutput: Case['expectedOutput']; output: Result; scores: ReturnType<typeof evaluate> };
export type RunRecord = {
  batchId: string; variant: Variant; mode: 'fixture' | 'live'; datasetHash: string;
  evaluatorVersion: string; caseIds: string[]; total: number; passed: number;
  promptVersion: string; prompt: string; model: string; rows: RunRow[];
};
export type Comparison = { schema: '2c-comparison-v1'; batchId: string; mode: 'fixture' | 'live'; datasetHash: string; runs: RunRecord[] };
export const argValue = (args: string[], name: string) => args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
export function selectCases(cases: Case[], ids?: string) {
  if (!ids) return cases;
  const requested = ids.split(',');
  if (new Set(requested).size !== requested.length || requested.some(id => !cases.some(c => c.input.caseId === id))) {
    throw new Error('Invalid --cases. Use unique IDs such as C01,C02,C04.');
  }
  return requested.map(id => cases.find(c => c.input.caseId === id)!);
}
export function selectVariants(value = 'baseline,prompt,model'): Variant[] {
  const variants = value.split(',');
  if (variants.length < 2 || new Set(variants).size !== variants.length || variants.some(v => !['baseline','prompt','model'].includes(v))) {
    throw new Error('Invalid --variants. Use baseline,prompt or baseline,prompt,model.');
  }
  return variants as Variant[];
}
export const pass = (r: RunRow) => r.scores.find(s => s.name === 'case_pass')?.value === 1;
export function validateComparison(value: any): asserts value is Comparison {
  if (value?.schema !== '2c-comparison-v1' || !['fixture','live'].includes(value.mode) || !Array.isArray(value.runs) || value.runs.length < 2) throw new Error('Not a workshop comparison file.');
  const ids = value.runs[0].caseIds;
  for (const run of value.runs) {
    if (run.mode !== value.mode || run.datasetHash !== value.datasetHash || JSON.stringify(run.caseIds) !== JSON.stringify(ids) || run.rows?.length !== ids?.length || run.rows.some((row: RunRow, i: number) => row.caseId !== ids[i] || !row.input || !row.expectedOutput || !Array.isArray(row.scores))) {
      throw new Error('Comparison has mismatched cases, dataset or mode.');
    }
  }
}
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function comparisonHtml(bundle: Comparison) {
  validateComparison(bundle);
  const {runs} = bundle;
  const rows = runs[0].rows.map((row, i) => `<section><h2>${esc(row.caseId)} · ${esc(row.input.question)}</h2><p>기대: ${esc(row.expectedOutput.required.join(' / ') || row.expectedOutput.status)} · 출처 ${esc(row.expectedOutput.citations.join(', ') || '없음')}</p><div class="cards">${runs.map((run, n) => {
    const r=run.rows[i], regression=n>0 && pass(runs[n-1].rows[i]) && !pass(r);
    return `<article><h3>${esc(run.variant)} ${regression?'· 새 실패':''}</h3><p class="score">규칙 검사: ${pass(r)?'통과':'실패'} · ${esc(r.output.status)}</p><p>${esc(r.output.answer || '(답변 없음)')}</p><p>출처: ${esc(r.output.citations.join(', ') || '없음')}</p><p>실패한 검사: ${esc(r.scores.filter(s=>s.value===0).map(s=>s.name).join(', ') || '없음')}</p><small>응답 모델: ${esc(r.output.model || run.model)}<br>처리 시간: ${r.output.latencyMs} ms<br>토큰: ${esc(r.output.tokens?`입력 ${r.output.tokens.input} / 출력 ${r.output.tokens.output}`:'미측정')} · 비용 USD: ${esc(r.output.costUsd ?? '미측정')}<br>Trace: ${esc(r.output.traceId || '미전송')}<br>${esc(r.output.error || '')}</small></article>`;
  }).join('')}</div></section>`).join('');
  return `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>프롬프트 · 모델 비교 결과</title><style>body{max-width:1200px;margin:40px auto;padding:0 24px;background:#0f141b;color:#e7ecf2;font:18px/1.7 system-ui,sans-serif;word-break:keep-all}h1,h2,h3{line-height:1.4}h1{color:#f2b544}section{margin:44px 0}.cards{display:grid;grid-template-columns:repeat(${runs.length},minmax(0,1fr));gap:20px}article{padding:20px;background:#17202a;border:1px solid #344254;border-radius:8px;overflow-wrap:anywhere}small{color:#a7b1be}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px}.score{color:#f2b544}summary{cursor:pointer}@media(max-width:760px){.cards{grid-template-columns:1fr}}</style><h1>같은 입력에서 무엇이 달라졌나?</h1><p>${bundle.mode==='live'?'실제 endpoint 호출 결과':'연습용 fixture · 실제 모델 측정 아님'} · ${esc(bundle.batchId)}</p><p>${runs.map(r=>`${esc(r.variant)} ${r.passed}/${r.total}`).join(' · ')} (규칙 검사 통과 수)</p><p>통과 수는 문자열·출처·상태 검사 결과다. 답의 의미는 근거와 함께 읽는다. 세 사례 한 번의 결과로 우열을 확정하지 않는다. 새 실패는 바로 왼쪽 후보와 비교한다.</p>${rows}<h2>같게 둔 것과 바꾼 것</h2><p>Dataset hash: ${esc(bundle.datasetHash)}<br>평가 기준: ${esc(runs[0].evaluatorVersion)}</p>${runs.map(r=>`<details><summary>${esc(r.variant)} · ${esc(r.model)} · ${esc(r.promptVersion)}</summary><pre>${esc(r.prompt)}</pre></details>`).join('')}<p>Trace ID 가 있어도 실제 서버 수집을 보장하지 않는다. Langfuse 에서 같은 ID 를 확인한다.</p></html>`;
}
