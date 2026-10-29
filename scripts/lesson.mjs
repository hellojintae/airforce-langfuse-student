import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const lessons = {
  '0': ['환경 점검', [['preflight']]],
  '1': ['합성 사례 실행 · Trace 읽기', [['demo', '--variant=baseline']]],
  '2': ['수정한 코드 검사', [['check'], ['test']]],
  '3': ['로컬 비교 · 네트워크 모델 호출 없음', [['compare']]],
  '6': ['실제 LLM · 같은 모델로 프롬프트 A/B 비교 (최대 6회 호출)', [
    ['compare','--live','--variants=baseline,prompt','--cases=C01,C02,C04','--label=prompt-ab'],
  ]],
  '7': ['저장된 모델 비교 결과 읽기 (API 호출 없음)', [['review']]],
};
const step = process.argv[2];
if (!step || step === 'help') {
  console.log('학생 실습: 0 → C01 화면 읽기 → 1 → 6 → 7\n추가 점검: 2, 연결 장애 시 합성 비교: 3\n'+Object.entries(lessons).map(([n,[title]])=>`${n}. ${title}`).join('\n'));
} else if (!Object.hasOwn(lessons, step)) {
  console.error('학생 실습 번호는 0, 1, 2, 3, 6, 7입니다. node workshop.mjs lesson help를 확인하세요.'); process.exitCode=1;
} else {
  const [title, commands] = lessons[step];
  console.log(`2-C ${step}. ${title}`);
  for (const args of commands) {
    const result=spawnSync(process.execPath,['workshop.mjs',...args],{
      stdio:'inherit',shell:false,
      env:step==='3' ? {...process.env,TRACE_ENABLED:'false'} : process.env,
    });
    if (result.status!==0 || result.error) { process.exitCode=result.status ?? 1; break; }
  }
}
