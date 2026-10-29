# Langfuse 메뉴부터 익히기

강의 초반에 이 안내를 읽고 `pnpm lab 1`로 C01을 찾습니다. 메뉴 이름은 2026-10-29 Japan 교육 프로젝트의 **v4.71.0** 화면에서 확인했습니다.

## 1. 먼저 프로젝트를 확인합니다

상단의 조직과 프로젝트가 배정받은 곳인지 확인합니다. 같은 조라도 여러 사람이 실행하므로 내 결과 JSON의 `output.traceId`로 내 기록을 찾습니다.

## 2. 메뉴 전체 지도

| 메뉴 | 하는 일 | 오늘은 어떻게 쓰나 |
|---|---|---|
| Home | 프로젝트 전체 지표를 처음 보는 화면 | 실행·점수 현황을 짧게 봅니다 |
| Dashboards | 시간·사용량·비용·점수를 모아 보는 차트 | 전체 추세를 볼 때 사용합니다 |
| Tracing | 요청과 그 안의 작업 단계 기록 | C01과 내 조의 사례를 직접 읽습니다 |
| Sessions | 같은 sessionId로 묶은 여러 요청 | 대화 여러 턴을 볼 때 사용합니다 |
| Users | 앱이 보낸 userId별 사용 기록 | 조직 구성원 관리와는 다른 화면입니다 |
| Alerts | 설정한 지표의 이상을 알리는 규칙 | 운영 단계의 기능으로 소개합니다 |
| Prompts | 프롬프트의 버전과 배포 라벨 관리 | 코드의 v1·v2와 비교해 개념을 봅니다 |
| Playground | 모델·프롬프트·변수를 넣어 답변 시험 | 실행하면 모델 호출이 필요합니다 |
| Scores | 기록에 매겨진 점수와 이유 | 규칙 점수 0·1과 실제 답을 함께 봅니다 |
| Evaluators | 자동 채점 방법과 적용 대상 설정 | 채점 방법과 결과 점수를 구분합니다 |
| Human Annotation | 사람이 읽고 채점할 항목과 대기열 | 사람 판단과 Judge를 비교할 때 사용합니다 |
| Datasets | 반복해서 시험할 입력·기대 결과 모음 | 문제집에 해당합니다 |
| Experiments | 같은 사례를 조건별로 실행한 결과 | 답·점수·새 실패를 비교합니다 |
| Settings | 프로젝트 키·모델 연결 등 설정 | 사전 준비 때 사용합니다 |

[공식 관측 기능](https://langfuse.com/docs/observability/overview) · [프롬프트 관리](https://langfuse.com/docs/prompt-management/overview) · [평가 기능](https://langfuse.com/docs/evaluation/overview)

## 3. 이번 수업에서 직접 따라갈 순서

```text
lab/에서 pnpm lab 1
  → 최상위 results/의 새 baseline JSON
  → C01의 output.traceId 복사
  → Langfuse: 프로젝트 · 시각 · Env 확인
  → Tracing에서 같은 Trace ID 찾기
  → 실행 트리에서 lookup-manual · draft-answer 선택
  → Input · Output · Scores 읽기
```

기록이 안 보이면 시간 범위와 **Env** 필터를 먼저 봅니다. 학생 실행은 `training` 설정을 사용합니다. 강사용 일반 시연은 `lecture-menu-demo`, Dataset 비교 시연은 `sdk-experiment`입니다. `default`만 선택되어 있으면 다른 환경의 기록이 숨을 수 있습니다. 수업 안내에 따라 해당 환경 또는 전체를 선택합니다.

v4 목록의 한 줄은 작업 한 단계인 Observation일 수 있습니다. 같은 `trace_id`로 묶인 기록 전체가 Trace입니다. `Is Root Observation` 필터는 시작 단계만 보여 줍니다. [공식 v4 화면 설명](https://langfuse.com/faq/all/explore-observations-in-v4)

기록이 아직 없는 새 프로젝트는 `Waiting for first trace`가 보일 수 있습니다. 키와 `TRACE_ENABLED=true` 설정 후 C01을 실행하고 전송이 끝날 때까지 기다립니다. 이후 [C01 화면 읽기](TRACE_GUIDE.md)를 따라갑니다.

## 4. 이름이 비슷해도 역할은 다릅니다

- **Scores**: 이미 받은 점수. 이번 코드의 `evaluate()`가 검사해서 보냅니다.
- **Evaluators**: 자동 채점기를 설정하는 곳. 코드에서 점수를 보냈다고 자동 채점 설정이 생기지는 않습니다.
- **Human Annotation**: 사람이 답을 읽고 평가하는 곳. 모델이 매긴 점수를 사람 평가라고 부르지 않습니다.

C08은 승인이 없어서 등록하지 않습니다. `writes=0`이고 `case_pass=1`이면 “업무 등록 완료”가 아니라 “승인 없이 등록하지 않는 규칙 통과”입니다.

## 5. 메뉴가 비어 있어도 실습 오류는 아닙니다

| 비어 있는 곳 | 확인할 것 |
|---|---|
| Prompts | 이 실습은 `src/agent.ts`의 프롬프트를 사용합니다. 자동으로 Prompts에 등록하지 않습니다. |
| Datasets · Experiments | 학생 `pnpm lab 3`은 Trace·Score와 로컬 비교 HTML을 만듭니다. 서버 Dataset/Experiment 등록은 별도 동작입니다. |
| Sessions · Users | 현재 사례가 sessionId/userId를 보내지 않으면 해당 묶음은 생기지 않습니다. |
| Evaluators · Human Annotation | 담당자가 설정하거나 검토할 항목을 넣어야 합니다. |
| 토큰 · 비용 | fixture는 실제 모델을 호출하지 않습니다. 값이 없다는 것을 실제 모델 비용 0원으로 해석하지 않습니다. |

메뉴 설명용으로 강사 프로젝트에 준비한 데이터는 **10개 합성 사례 · 비교 실행 3개 · 프롬프트 2버전**입니다. baseline 7/10, prompt 10/10, model 8/10은 코드가 재현한 검사 결과이며 실제 모델 순위가 아닙니다. 실제 모델 비교는 수업에서 별도로 진행합니다.

Prompts에 저장한 v1·v2는 설명용 복사본입니다. 애플리케이션에서 해당 프롬프트를 가져오도록 연결해야 코드 실행에 적용됩니다. [공식 시작 안내](https://langfuse.com/docs/prompt-management/get-started)
