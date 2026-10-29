import { readFileSync, writeFileSync } from 'node:fs';
import { argValue, comparisonHtml, validateComparison } from './comparison.js';
const file=argValue(process.argv.slice(2),'file') || 'results/prepared-model-comparison.json';
try {
  const data=JSON.parse(readFileSync(file,'utf8')); validateComparison(data);
  console.log(data.mode === 'live' ? '저장된 실제 호출 결과 (새 API 호출 없음)' : 'FIXTURE: 실제 모델 측정 아님');
  console.table(data.runs.map(r=>({variant:r.variant,model:r.model,prompt:r.promptVersion,passed:r.passed,total:r.total})));
  const html=file.replace(/\.json$/i,'')+'.html'; writeFileSync(html,comparisonHtml(data));
  console.log(`브라우저에서 ${html} 을 연다. Codespaces에서는 파일을 내려받아 연다.`);
} catch (error) {
  console.error('비교 파일을 읽을 수 없습니다. 배포받은 prepared-model-comparison.json을 results 폴더에 넣으세요. 파일이 없다면 담당자에게 요청하세요.');
  console.error(error instanceof Error && 'code' in error ? 'File unavailable' : 'Invalid comparison data');
  process.exitCode=1;
}
