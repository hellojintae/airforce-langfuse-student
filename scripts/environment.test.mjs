import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
test('remote setup preserves existing env and does not require or create local infra',()=>{
  const dir=mkdtempSync(join(tmpdir(),'lf-setup-'));
  try {
    mkdirSync(join(dir,'scripts'));
    copyFileSync(join(root,'scripts/setup.mjs'),join(dir,'scripts/setup.mjs'));
    copyFileSync(join(root,'.env.example'),join(dir,'.env.example'));
    for(let i=0;i<2;i++) assert.equal(spawnSync(process.execPath,[join(dir,'scripts/setup.mjs')]).status,0);
    assert.ok(existsSync(join(dir,'.env'))); assert.equal(existsSync(join(dir,'infra')),false);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
test('remote preflight checks project auth, skips Docker, and rejects unauthorized keys',()=>{
  for (const status of [200,401]) {
    const source=`globalThis.fetch=async(url,options)=>{
      if(!String(url).endsWith('/api/public/projects')) throw Error('Unexpected request');
      if(!options.headers.Authorization.startsWith('Basic ')) throw Error('Missing auth');
      return {ok:${status===200},status:${status}};
    };`;
    const result=spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(source),'scripts/preflight.mjs'],{
      cwd:root,encoding:'utf8',env:{...process.env,TRACE_ENABLED:'true',LANGFUSE_BASE_URL:'https://example.invalid',LANGFUSE_PUBLIC_KEY:'test-public',LANGFUSE_SECRET_KEY:'test-secret'},
    });
    assert.equal(result.status,status===200?0:1,result.stdout+result.stderr);
    assert.match(result.stdout,new RegExp(`HTTP ${status}`));
    assert.doesNotMatch(result.stdout,/PASS Docker|FAIL Docker|test-secret|test-public/);
  }
});
