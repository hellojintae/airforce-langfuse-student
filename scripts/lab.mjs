import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Student numbering is sequential; instructor lesson numbers stay compatible.
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const labs = {
  '0': { title: '연결 확인', args: ['preflight'], next: 'PASS를 확인한 뒤 pnpm lab 1로 C01을 실행합니다.' },
  '1': { title: 'C01 · Langfuse 화면 읽기', args: ['demo', '--variant=baseline', '--cases=C01'], next: 'results의 C01 output.traceId를 복사해 Langfuse에서 찾습니다. docs/TRACE_GUIDE.md를 따라가세요.' },
  '2': { title: '조별 사례 · 실행 과정 설명하기', args: ['lesson', '1'], next: 'C02 / C05 / C08 중 배정 사례를 읽고 docs/LAB.md의 관찰 기록을 채웁니다.' },
  '3': { title: '같은 모델 · 프롬프트 A/B 비교 (실제 모델 최대 6회 요청)', args: ['lesson', '6'], next: 'results/prompt-ab-comparison.html을 Download해서 두 답변을 비교합니다.' },
  '4': { title: '배포받은 모델 비교 결과 읽기 (새 모델 요청 없음)', args: ['lesson', '7'], next: 'results/prepared-model-comparison.html을 Download해서 모델별 결과를 읽습니다.' },
  offline: { title: '연결 장애 때 · 합성 비교', args: ['lesson', '3'], next: 'mode=fixture: 비교 방법을 연습하는 자료이며 실제 모델 성능 측정은 아닙니다.' },
  check: { title: '수정한 코드 검사', args: ['lesson', '2'], next: '타입 검사와 테스트 결과를 확인합니다.' },
};
const [step = 'help', ...options] = process.argv.slice(2);
if (['help', '--help', '-h'].includes(step) && options.length === 0) {
  console.log('공군 Agentic AI 2일차 · Langfuse 실습\n명령: pnpm lab <번호>\n'+Object.entries(labs).map(([n, v])=>`${n}. ${v.title}`).join('\n')+'\n수업 순서: 1 → 2 → 3 → 4 (0은 연결 점검)\n환경 설정: 저장소 최상위 .env / 결과: 저장소 최상위 results/\n기존 node workshop.mjs lesson 명령도 사용할 수 있습니다.');
} else if (!Object.hasOwn(labs, step) || (options.length && !(step === '0' && options.length === 1 && options[0] === '--offline'))) {
  console.error('실습은 0, 1, 2, 3, 4 또는 offline / check입니다. pnpm lab help를 확인하세요.');
  process.exitCode = 1;
} else {
  const lab = labs[step];
  console.log(`[실습 ${step}] ${lab.title}`);
  const result = spawnSync(process.execPath, ['workshop.mjs', ...lab.args, ...options], { stdio: 'inherit', shell: false });
  if (result.error) console.error(`실행을 시작하지 못했습니다: ${result.error.code}`);
  process.exitCode = result.status ?? 1;
  if (process.exitCode === 0) console.log(`[다음] ${lab.next}`);
  else console.error('[안내] 오류 문구를 확인하고 docs/TROUBLESHOOTING.md를 읽으세요. 키 값은 공유하지 않습니다.');
}
