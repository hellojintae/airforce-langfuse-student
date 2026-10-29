import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runAgent } from './agent.js';
import { evaluate } from './evaluate.js';
import type { Case } from './types.js';
import { modelConfig } from './model-config.js';
const cases = JSON.parse(readFileSync(new URL('../data/cases.json',import.meta.url),'utf8')) as Case[];
test('shared endpoint config supports explicit overrides without inventing a second model',()=>{
  const shared={LLM_BASE_URL:'https://example.invalid/v1',LLM_API_KEY:'dummy',LLM_MODEL:'model-a',LLM_TIMEOUT_SEC:'15'};
  assert.deepEqual(modelConfig(shared), {base:shared.LLM_BASE_URL,key:'dummy',modelA:'model-a',modelB:undefined,timeoutMs:15000});
  const override=modelConfig({...shared,MODEL_BASE_URL:'https://other.invalid/v1',MODEL_A:'override',MODEL_B:'b'});
  assert.equal(override.base,'https://other.invalid/v1'); assert.equal(override.modelA,'override'); assert.equal(override.modelB,'b');
  assert.throws(()=>modelConfig({LLM_TIMEOUT_SEC:'NaN'}));
  assert.equal(modelConfig({LLM_BASE_URL:'https://openrouter.ai/api/v1',OPENROUTER_API_KEY:'shared'}).key,'shared');
  assert.equal(modelConfig({LLM_BASE_URL:'https://other.invalid/v1',OPENROUTER_API_KEY:'shared'}).key,undefined);
});
test('fixture comparison has intended failures without pretending to measure a model',async()=>{
  for (const [variant,count] of [['baseline',7],['prompt',10],['model',8]] as const) {
    let passed = 0;
    for (const c of cases) {
      const r = await runAgent(c.input,variant);
      if(evaluate(c.input,r,c.expectedOutput).find(s=>s.name==='case_pass')?.value===1) passed++;
      assert.equal(r.tokens,null);assert.equal(r.costUsd,null);
      if(c.input.action==='register' && (!c.input.approval?.approved || c.input.approval.version!==c.input.draftVersion)) {
        assert.equal(r.writes,0);assert.equal(r.events.includes('draft-answer'),false);
      }
    }
    assert.equal(passed,count,variant);
  }
});
test('scope denial, bounded retries, and policy regression are observable',async()=>{
  const denied = await runAgent(cases[2].input,'prompt');
  assert.deepEqual(denied.events,['policy-check']);
  const recovered = await runAgent(cases[4].input,'prompt');assert.equal(recovered.attempts,2);assert.equal(recovered.status,'draft');
  const failed = await runAgent(cases[5].input,'prompt');assert.equal(failed.attempts,2);assert.equal(failed.status,'tool_error');
  const forged={...denied,writes:1,events:[...denied.events,'register-simulated']};
  assert.equal(evaluate(cases[2].input,forged,cases[2].expectedOutput).find(s=>s.name==='policy_enforced')?.value,0);
});
