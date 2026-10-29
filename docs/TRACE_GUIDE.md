# C01로 Langfuse 화면 읽기

먼저 정상 사례 하나로 화면 읽기를 연습합니다. 수업 화면에서 한 곳을 선택하면 내 화면에서도 같은 기록을 선택해 보세요.

메뉴가 처음이라면 [Langfuse 메뉴 지도](LANGFUSE_UI.md)를 먼저 읽습니다.

## 먼저 실행

`lab/` 폴더에서 다음 명령을 입력합니다. 키와 `TRACE_ENABLED=true` 설정은 [환경 준비](SETUP.md)에서 확인합니다.

```sh
pnpm lab 1
```

## 내 Trace 찾기

1. Codespaces 터미널에 표시된 `results/…-baseline.json`을 엽니다. `results`는 저장소 최상위에 있습니다.
2. `rows`에서 `input.caseId`가 `C01`인 항목을 찾습니다.
3. 같은 항목의 `output.traceId`를 복사합니다.
4. Langfuse의 배정 프로젝트에서 실행 시각 범위를 맞춥니다.
5. 왼쪽 **Tracing**에서 Trace ID로 검색·필터링하고 실행 트리를 엽니다. 시간과 Env 필터가 내 실행을 포함하는지 확인합니다.

같은 조의 여러 사람이 C01을 실행할 수 있습니다. 내 결과 파일의 Trace ID와 시각으로 구분합니다. 화면 위치가 다르면 수업의 실제 화면을 따라갑니다. [Langfuse 공식 화면 안내](https://langfuse.com/faq/all/explore-observations-in-v4)

## 순서대로 선택하기

```text
langgraph-workflow
└─ equipment-intake
   ├─ policy-check
   ├─ lookup-manual
   └─ draft-answer
```

| 선택할 기록 | 볼 곳 | 찾아볼 값 |
|---|---|---|
| `langgraph-workflow` | Output | 최종 `status`, `writes` |
| `equipment-intake` | Input | 사용자의 `question`, 참고 자료 `evidence` |
| `policy-check` | Output | 진행 여부 `decision` |
| `lookup-manual` | Input와 Output | 시도 번호 `attempt`, 찾은 `documents` |
| `draft-answer` | Input와 Output | 지침 `system`, 자료 `evidence`, 답변 `answer`, 인용 `citations` |
| Trace에 연결된 Scores | 점수 이름과 값 | `case_pass`와 개별 검사 결과 |

C01에서는 `MAN-01` 자료를 사용해 초안을 만듭니다. `draft`는 초안 상태, `writes: 0`은 등록하지 않았다는 뜻입니다. 초안을 요청했으므로 등록하지 않은 것이 정상입니다.

지금은 합성 답변을 기록합니다. `GENERATION`이라는 유형이 보여도 실제 LLM 호출은 아닙니다. `validate-input`과 `prepare-review`는 실행되지만 각각의 별도 Span은 만들지 않습니다.

## 혼자 다시 찾기

- [ ] 입력에서 참고 자료 ID를 찾았다.
- [ ] 답변 문장과 인용을 찾았다.
- [ ] 최종 상태와 등록 횟수를 찾았다.
- [ ] 이 Trace에 연결된 `case_pass` 점수를 찾았다.

위 값의 위치를 조원에게 설명해 보세요. 아직 어렵다면 C01을 한 번 더 함께 읽은 뒤 조별 사례로 넘어갑니다.

## 점수 읽는 법

`evaluate.ts`가 상태·필수 문구·인용·정책을 검사해 1 또는 0을 만듭니다. Langfuse는 전달받은 점수를 보여 줍니다. 네 검사를 모두 통과하면 `case_pass = 1`입니다.

필수 문구 검사는 문장의 의미를 판정하지 않습니다. 예를 들어 기준이 `확인 불가`라면 정확한 문자열이 있는지 확인합니다. 점수만 보지 말고 실제 답변을 함께 읽습니다. 점수가 아직 수집되지 않은 상태와 0점도 구분합니다.
