import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const script = fileURLToPath(new URL('./lab.mjs', import.meta.url));
// Capture the subprocess boundary: no LLM or Langfuse connection in this test.
const loader = `import cp from 'node:child_process'; import {syncBuiltinESMExports} from 'node:module';
cp.spawnSync = (cmd,args,options) => {console.log('DISPATCH '+JSON.stringify({args,cwd:process.cwd(),shell:options.shell}));return {status:Number(process.env.TEST_EXIT || 0)};};
syncBuiltinESMExports();`;
const run = (args, code=0) => spawnSync(process.execPath, ['--import', 'data:text/javascript,'+encodeURIComponent(loader), script, ...args], { cwd: fileURLToPath(new URL('../lab', import.meta.url)), encoding:'utf8', env:{...process.env, TEST_EXIT:String(code)} });

test('student CLI separates guided reading, group work, live A/B and saved review', () => {
  const expected = {
    '0':['preflight'], '1':['demo','--variant=baseline','--cases=C01'],
    '2':['lesson','1'], '3':['lesson','6'], '4':['lesson','7'],
    offline:['lesson','3'], check:['lesson','2'],
  };
  for (const [step,args] of Object.entries(expected)) {
    const result=run([step]); assert.equal(result.status,0,result.stderr);
    const dispatch=JSON.parse(result.stdout.split('\n').find(s=>s.startsWith('DISPATCH ')).slice(9));
    assert.deepEqual(dispatch.args,['workshop.mjs',...args]);
    assert.equal(dispatch.cwd,root.replace(/[\\/]$/,'')); assert.equal(dispatch.shell,false);
    assert.match(result.stdout,/\[다음\]/);
  }
  const offline=run(['0','--offline']); assert.equal(offline.status,0); assert.match(offline.stdout,/--offline/);
  for (const args of [[], ['help'], ['--help']]) { const r=run(args);assert.equal(r.status,0);assert.doesNotMatch(r.stdout,/DISPATCH/); }
  for (const args of [['6'],['prepare'],['3','--live'],['1','--cases=C02']]) { const r=run(args);assert.equal(r.status,1);assert.doesNotMatch(r.stdout,/DISPATCH/); }
  const failed=run(['3'],7);assert.equal(failed.status,7);assert.doesNotMatch(failed.stdout,/\[다음\]/);
});
