# 관찰한 동작과 코드 연결하기

먼저 Langfuse에서 입력·중간 과정·결과를 확인한 뒤 해당 파일을 읽습니다.

```text
내가 입력한 pnpm lab 번호
         ↓
scripts/lab.mjs     학생 실습 1~4 선택
         ↓
workshop.mjs / scripts/lesson.mjs  기존 실행 명령 연결
         ↓
src/main.ts        사례 실행과 결과 저장
         ↓
src/graph.ts       처리 순서
         ↓
src/agent.ts       검사·조회·답변·교육용 등록
         ↓
src/evaluate.ts    결과 채점
```

| 궁금한 것 | 파일 |
|---|---|
| 실습 번호가 무슨 명령을 실행하나? | [scripts/lab.mjs](../scripts/lab.mjs) |
| 어떤 입력과 기대 결과로 시험하나? | [data/cases.json](../data/cases.json) |
| 어떤 순서로 처리하나? | [src/graph.ts](../src/graph.ts) |
| 언제 멈추고, 조회를 다시 하고, 답변을 만드나? | [src/agent.ts](../src/agent.ts) |
| 프롬프트 v1과 v2는 무엇이 다른가? | [src/agent.ts](../src/agent.ts)의 `prompts` |
| 무엇을 검사해 점수를 만드나? | [src/evaluate.ts](../src/evaluate.ts) |
| 결과 파일과 점수는 어떻게 저장하나? | [src/main.ts](../src/main.ts) |
| Langfuse 전송을 켜고 끄는 곳은? | [src/instrumentation.ts](../src/instrumentation.ts) |
| 받은 비교 파일은 어떻게 여나? | [src/review.ts](../src/review.ts) |

`graph.ts`는 처리 순서를 정하고, `startActiveObservation`은 실행 기록의 범위를 만듭니다. 노드가 있다고 각각의 Span이 자동으로 생기는 것은 아닙니다.

`data/cases.json`의 `expectedOutput`은 채점 기준입니다. Agent에게 보내는 입력과 나눠 보관합니다. `evaluate()`는 결과가 기준을 지켰는지 검사하고, Langfuse는 전달받은 점수를 보여 줍니다.

합성 모드는 준비된 동작을 재현합니다. 실제 모델 호출은 실습 3에서 사용합니다. 두 모드 모두 조회와 등록은 교육용 모의 동작이며 실제 업무 DB를 수정하지 않습니다.

## 기존 장표 명령과 대응

학생 명령은 `lab/`, 기존 명령은 저장소 최상위에서 실행합니다. 같은 코드와 결과 경로를 사용합니다.

| 학생 명령 | 기존 명령 | 목적 |
|---|---|---|
| `pnpm lab 0` | `node workshop.mjs lesson 0` | 연결 점검 |
| `pnpm lab 1` | `node workshop.mjs demo --variant=baseline --cases=C01` | C01 화면 읽기 |
| `pnpm lab 2` | `node workshop.mjs lesson 1` | 조별 사례 |
| `pnpm lab 3` | `node workshop.mjs lesson 6` | 실제 프롬프트 A/B |
| `pnpm lab 4` | `node workshop.mjs lesson 7` | 받은 모델 비교 |
| `pnpm lab offline` | `node workshop.mjs lesson 3` | 합성 비교 |
| `pnpm lab check` | `node workshop.mjs lesson 2` | 코드 검사 |

`lab/`는 익숙한 실습 명령을 입력하는 입구입니다. 관찰 대상 소스는 `src/`, 설정은 최상위 `.env`, 결과는 최상위 `results/`에 있습니다.
