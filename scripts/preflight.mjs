import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const offline = process.argv.includes('--offline');
const local = process.argv.includes('--local');
let failed=0;
const check=(name,ok,detail='')=>{console.log(`${ok?'PASS':'FAIL'} ${name} ${detail}`);if(!ok)failed++};
check('Node.js 22',+process.versions.node.split('.')[0]===22,process.versions.node);
console.log(`Platform: ${process.platform} / ${process.arch}`);
const commands = [['git','git',['--version']]];
if (local) commands.push(['Docker','docker',['--version']],['Compose','docker',['compose','version']]);
console.log(`Langfuse: ${local ? 'local Docker' : 'remote server (Docker not required)'}`);
for(const [name,cmd,args] of commands) {
  try { check(name,true,execFileSync(process.platform==='win32'?`${cmd}.exe`:cmd,args,{encoding:'utf8'}).trim()); } catch { check(name,false); }
}
check('packages',existsSync('node_modules/@langchain/langgraph')&&existsSync('node_modules/@langfuse/tracing'));
check('10 synthetic cases',JSON.parse(readFileSync('data/cases.json','utf8')).length===10);
if(!offline) {
  if (local) {
    try { check('Docker Linux engine',execFileSync(process.platform==='win32'?'docker.exe':'docker',['info','--format','{{.OSType}}'],{encoding:'utf8'}).trim()==='linux'); } catch { check('Docker Linux engine',false); }
  }
  check('tracing configured',process.env.TRACE_ENABLED==='true'&&!!process.env.LANGFUSE_BASE_URL&&!!process.env.LANGFUSE_PUBLIC_KEY&&!!process.env.LANGFUSE_SECRET_KEY);
  try {
    const base=process.env.LANGFUSE_BASE_URL;
    if (local) {
      const health=await fetch(`${base}/api/public/health`,{signal:AbortSignal.timeout(8000)});check('Langfuse health',health.ok);
    }
    const projects=await fetch(`${base}/api/public/projects`,{headers:{Authorization:'Basic '+Buffer.from(`${process.env.LANGFUSE_PUBLIC_KEY}:${process.env.LANGFUSE_SECRET_KEY}`).toString('base64')},signal:AbortSignal.timeout(8000)});
    check('project API authentication',projects.ok,`HTTP ${projects.status}`);
  }catch{check('Langfuse connectivity',false);}
}
console.log(offline ? 'Offline check only: Langfuse ingestion and model connectivity are NOT verified.' : 'Manual preflight: run demo and confirm one new Trace in your assigned project. Endpoint authentication alone does not verify ingestion.');
process.exitCode=failed?1:0;
