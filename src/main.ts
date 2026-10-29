import { traceEnabled, shutdown } from './instrumentation.js';
import { flushScores } from './flush-scores.js';
import { LangfuseClient } from '@langfuse/client';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { prompts, setModelBudget } from './agent.js';
import { modelConfig } from './model-config.js';
import { argValue, selectCases, selectVariants, comparisonHtml, type RunRecord, type RunRow, type Comparison } from './comparison.js';
import { judgeRow } from './judge.js';
import { join } from 'node:path';
import { runWorkflow } from './graph.js';
import { evaluate } from './evaluate.js';
import type { Case, Input, Expected, Result, Variant } from './types.js';

const text = readFileSync(new URL('../data/cases.json', import.meta.url), 'utf8');
const cases = JSON.parse(text) as Case[];
const args=process.argv.slice(3);
const chosen=selectCases(cases,argValue(args,'cases'));
const datasetHash = createHash('sha256').update(text).digest('hex');
const datasetName = process.env.DATASET_NAME || '2c-equipment-v1';
const command = process.argv[2] || 'demo';
const live = process.argv.includes('--live');
const variants=selectVariants(argValue(args,'variants'));
const label=argValue(args,'label');
if (label && !['prompt-ab','prepared-model'].includes(label)) throw new Error('Unknown result label');
const variantArg = process.argv.find(a => a.startsWith('--variant='))?.split('=')[1] || 'baseline';
if (!['baseline','prompt','model'].includes(variantArg)) throw new Error('Unknown variant');
const variant = variantArg as Variant;
if (live || command === 'judge') {
  if (process.env.LLM_MODE === 'mock') throw new Error('Set LLM_MODE=cloud/relay/ollama before requesting a model call. Default lessons use fixtures.');
  const config = modelConfig();
  if (!config.base) throw new Error('Configure LLM_BASE_URL (or MODEL_BASE_URL) first.');
  if (live && !config.modelA) throw new Error('Configure LLM_MODEL (or MODEL_A) first.');
  if (live && (command === 'compare' ? variants.includes('model') : variant === 'model') && !config.modelB) throw new Error('MODEL_B is required for a real second-model comparison.');
  if (live && command === 'compare' && variants.includes('model') && config.modelA === config.modelB) throw new Error('MODEL_B must differ from the first model.');
  setModelBudget(Number(process.env.RUN_TIMEOUT_SEC || 180));
}
const batchId = new Date().toISOString().replace(/[:.]/g,'-');
const client = traceEnabled ? new LangfuseClient() : null;
const outputDir=process.env.WORKSHOP_RESULTS_DIR || 'results';
mkdirSync(outputDir, { recursive: true });
const save = (name: string, value: unknown) => writeFileSync(join(outputDir,`${name}.json`), JSON.stringify(value,null,2)+'\n');

async function localRun(v: Variant) {
  const rows: RunRow[] = [];
  for (const c of chosen) {
    const output = await runWorkflow(c.input,v,live);
    const scores = evaluate(c.input,output,c.expectedOutput);
    if (client) for (const score of scores) client.score.create({ ...score, traceId: output.traceId });
    rows.push({ caseId:c.input.caseId, critical:c.metadata.critical, input:c.input, expectedOutput:c.expectedOutput, output, scores });
  }
  const passed = rows.filter(r => r.scores.find(s => s.name==='case_pass')?.value===1).length;
  const config=live?modelConfig():null;
  const result: RunRecord = { batchId, variant:v, mode:live?'live':'fixture', datasetHash, evaluatorVersion:'rules-v1', caseIds:chosen.map(c=>c.input.caseId), total:rows.length, passed,
    promptVersion:v==='baseline'?'v1':'v2',prompt:prompts[v==='baseline'?'baseline':'prompt'],model:(v==='model'?config?.modelB:config?.modelA)||`fixture-${v==='model'?'b':'a'}`,rows };
  save(`${batchId}-${v}`,result);
  if(label) save(`${label}-${v}`,result);
  console.log(`${v}: ${passed}/${rows.length} | mode=${result.mode} | saved ${join(outputDir,`${batchId}-${v}.json`)}`);
  if(rows.some(r=>r.output.status==='model_error')) process.exitCode=1;
  return result;
}

try {
  if (command === 'demo') await localRun(variant);
  else if (command === 'compare') {
    const runs: Awaited<ReturnType<typeof localRun>>[] = [];
    for (const v of variants) runs.push(await localRun(v));
    const matrix = chosen.map(c => ({ caseId:c.input.caseId, category:c.metadata.category,
      ...Object.fromEntries(runs.map(run => [run.variant,run.rows.find(r=>r.caseId===c.input.caseId)?.scores.find(s=>s.name==='case_pass')?.value])) }));
    const bundle: Comparison={schema:'2c-comparison-v1',batchId,mode:live?'live':'fixture',datasetHash,runs};
    const name=`${label || batchId}-comparison`;
    save(`${batchId}-comparison`,bundle);
    if(label) save(name,bundle);
    writeFileSync(join(outputDir,`${name}.html`),comparisonHtml(bundle));
    console.table(matrix);
    console.log(`비교 화면: ${join(outputDir,`${name}.html`)}`);
    console.log(live ? 'Real gateway results: inspect sample size, judge agreement, errors, and critical cases before a release decision.' : 'FIXTURE: comparison workflow demonstration only. No real model quality, token, cost, or latency claim.');
  } else if (command === 'seed') {
    if (!client) throw new Error('Set TRACE_ENABLED=true and assigned project API keys.');
    await client.api.datasets.create({ name:datasetName, description:'Synthetic 2-C training cases. No operational data.', metadata:{ datasetHash, version:'v1' } });
    for (const c of cases) {
      const id = createHash('sha256').update(`${datasetName}:${c.input.caseId}`).digest('hex').slice(0,32);
      await client.dataset.createItem({ id, datasetName, input:c.input, expectedOutput:c.expectedOutput, metadata:c.metadata });
    }
    save('dataset-snapshot',{datasetName,datasetHash,version:new Date().toISOString()});
    console.log(`Seeded ${cases.length} items; preserved snapshot timestamp in results/dataset-snapshot.json`);
  } else if (command === 'experiment') {
    if (!client || !existsSync('results/dataset-snapshot.json')) throw new Error('Enable tracing, then run pnpm seed first.');
    const snapshot = JSON.parse(readFileSync('results/dataset-snapshot.json','utf8'));
    if (snapshot.datasetHash !== datasetHash || snapshot.datasetName !== datasetName) throw new Error('Dataset changed. Seed a new named version before comparing.');
    const dataset = await client.dataset.get(datasetName,{version:snapshot.version});
    if (dataset.items.length !== cases.length) throw new Error('Incomplete dataset: expected exactly ten items.');
    const result = await dataset.runExperiment({
      name:'2c-equipment', runName:`${batchId}-${live?'live':'fixture'}-${variant}`,
      description:'Agent path and evaluation exercise', maxConcurrency:1,
      metadata:{ variant,mode:live?'live':'fixture',datasetHash,datasetVersion:snapshot.version,evaluatorVersion:'rules-v1',promptVersion:variant==='baseline'?'v1':'v2' },
      task:async item => runWorkflow(item.input as Input,variant,live),
      evaluators:[async ({input,output,expectedOutput}) => evaluate(input as Input,output as Result,expectedOutput as Expected)],
    });
    console.log(await result.format());
  } else if (command === 'judge') {
    if (!process.env.JUDGE_MODEL) throw new Error('JUDGE_MODEL and MODEL_BASE_URL are required. This command calls the configured model.');
    const filename = argValue(args,'file');
    if (!filename) throw new Error('Use --file=results/<run>.json');
    const run = JSON.parse(readFileSync(filename,'utf8'));
    if(!['fixture','live'].includes(run.mode) || !Array.isArray(run.rows) || run.rows.some((r: RunRow)=>!r.input || !r.expectedOutput)) throw new Error('Judge requires a current run file with input/expectedOutput snapshots.');
    const ids=argValue(args,'cases')?.split(',');
    if(ids && ids.some(id=>!run.rows.some((r: RunRow)=>r.caseId===id))) throw new Error('Judge case not found in saved run.');
    const judgments = [];
    for (const row of run.rows as RunRow[]) {
      if(ids && !ids.includes(row.caseId)) continue;
      const j=await judgeRow(row,process.env.JUDGE_MODEL);
      judgments.push(j);
      if(j.status==='judge_error') process.exitCode=1;
      if(j.status==='scored' && client && row.output.traceId) client.score.create({traceId:row.output.traceId,name:'judge_groundedness',value:j.score,dataType:'NUMERIC',comment:j.reason,metadata:{judgeModel:j.judgeModel,rubricVersion:j.rubricVersion}});
    }
    save(`${batchId}-judge`,{sourceRun:filename,sourceBatchId:run.batchId,sourceMode:run.mode,judgments});
    console.table(judgments.map(j=>({caseId:j.caseId,status:j.status,score:j.score,reason:'reason' in j?j.reason:('error' in j?j.error:'답변 없음'),evidenceIds:'evidenceIds' in j?j.evidenceIds.join(', '):''})));
    console.log('Judge results saved. Review errors separately and calibrate with human labels.');
  } else throw new Error('Commands: demo | compare | seed | experiment | judge');
} finally { await flushScores(client); await shutdown(); }
