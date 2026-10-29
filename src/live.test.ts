import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { comparisonHtml } from './comparison.js';

// Transport stand-in only: no real endpoint, model-quality claim or exported results.
const preloader=`import {appendFileSync} from 'node:fs';
globalThis.fetch=async (url,options)=>{
 if(url!=='https://training.invalid/v1/chat/completions') throw Error('Unexpected network call');
 const body=JSON.parse(options.body);appendFileSync(process.env.CALL_LOG,JSON.stringify(body)+'\\n');
 if(process.env.FAIL_HTTP) return {ok:false,status:429};
 const input=JSON.parse(body.messages[1].content),system=body.messages[0].content;
 let result;
 if(system.startsWith('근거 충실성')) result=process.env.BAD_JUDGE ? {score:9,reason:'bad',evidenceIds:[]} : {score:2,reason:'근거 없음에 대해 확인 불가로 답했다.',evidenceIds:[]};
 else {
   const evidence=system.includes('current=true')?input.evidence.filter(e=>e.current):input.evidence;
   result={answer:evidence.length?evidence.map(e=>e.text).join(' '):(system.includes('current=true')?'확인 불가':'케이블 불량'),citations:evidence.map(e=>e.id)};
 }
 return {ok:true,json:async()=>({model:body.model,choices:[{message:{content:JSON.stringify(result)}}],usage:{prompt_tokens:20,completion_tokens:10}})};
};`;

test('live A/B runs six calls, preserves provenance, supports stored model review and one-case judge',()=>{
 const dir=mkdtempSync(join(tmpdir(),'lf-live-contract-'));
 try {
  const log=join(dir,'calls.jsonl');writeFileSync(log,'');
  const env={...process.env,TRACE_ENABLED:'false',LLM_MODE:'relay',LLM_BASE_URL:'https://training.invalid/v1',LLM_API_KEY:'test-only',LLM_MODEL:'model-a',MODEL_BASE_URL:'',MODEL_API_KEY:'',MODEL_A:'',MODEL_B:'',JUDGE_MODEL:'judge-model',WORKSHOP_RESULTS_DIR:dir,CALL_LOG:log,RUN_TIMEOUT_SEC:'60'};
  const run=(args:string[],extra:Record<string,string>={})=>spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(preloader),'--import','tsx','src/main.ts',...args],{encoding:'utf8',env:{...env,...extra}});
  const common=['compare','--live','--cases=C01,C02,C04','--label=prompt-ab'];
  const ab=run([...common,'--variants=baseline,prompt']);assert.equal(ab.status,0,ab.stdout+ab.stderr);
  const calls=readFileSync(log,'utf8').trim().split('\n').map(x=>JSON.parse(x));
  assert.equal(calls.length,6);assert.ok(calls.every(c=>c.model==='model-a'));
  assert.ok(calls.every(c=>!c.messages[1].content.includes('expectedOutput') && !c.messages[1].content.includes('required')));
  const bundle=JSON.parse(readFileSync(join(dir,'prompt-ab-comparison.json'),'utf8'));
  assert.deepEqual(bundle.runs.map((r:any)=>r.caseIds),[['C01','C02','C04'],['C01','C02','C04']]);
  assert.equal(bundle.runs[1].passed,3);assert.equal(bundle.runs[0].rows[1].output.tokens.input,20);
  assert.equal(bundle.runs[0].promptVersion,'v1');assert.equal(bundle.runs[1].promptVersion,'v2');
  const html=readFileSync(join(dir,'prompt-ab-comparison.html'),'utf8');assert.match(html,/실제 endpoint 호출 결과/);assert.doesNotMatch(html,/test-only/);
  bundle.runs[0].rows[0].output.answer='<script>alert(1)</script>';
  assert.ok(comparisonHtml(bundle).includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.equal(run(common).status,1,'missing second model must fail before any call');
  assert.equal(readFileSync(log,'utf8').trim().split('\n').length,6);
  const prepared=run(['compare','--live','--cases=C01,C02,C04','--label=prepared-model'],{MODEL_B:'model-b'});
  assert.equal(prepared.status,0,prepared.stderr);
  const review=spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(preloader),'--import','tsx','src/review.ts',`--file=${join(dir,'prepared-model-comparison.json')}`],{encoding:'utf8',env});
  assert.equal(review.status,0,review.stderr);assert.match(review.stdout,/새 API 호출 없음/);
  assert.equal(readFileSync(log,'utf8').trim().split('\n').length,15);
  const judge=run(['judge',`--file=${join(dir,'prompt-ab-prompt.json')}`,'--cases=C02']);
  assert.equal(judge.status,0,judge.stderr);assert.match(judge.stdout,/scored/);
  assert.equal(readFileSync(log,'utf8').trim().split('\n').length,16);
  const bad=run(['judge',`--file=${join(dir,'prompt-ab-prompt.json')}`,'--cases=C02'],{BAD_JUDGE:'1'});
  assert.equal(bad.status,1);assert.match(bad.stdout,/judge_error/);
  const error=run([...common,'--variants=baseline,prompt'],{FAIL_HTTP:'1'});
  assert.equal(error.status,1);const failed=JSON.parse(readFileSync(join(dir,'prompt-ab-comparison.json'),'utf8'));
  assert.ok(failed.runs.every((r:any)=>r.rows.every((x:any)=>x.output.error==='MODEL_HTTP_429')));
  assert.ok(readdirSync(dir).filter(f=>f.endsWith('-judge.json')).some(f=>JSON.parse(readFileSync(join(dir,f),'utf8')).judgments[0].score===null));
 } finally {rmSync(dir,{recursive:true,force:true});}
});
