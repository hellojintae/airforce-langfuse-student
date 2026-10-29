# 실습 중 막혔을 때

같은 모델 명령을 반복하기 전에 아래 항목을 확인합니다. 담당자에게는 오류 문구·실행 명령·시각을 보여 주고 키 값은 보여 주지 않습니다.

| 증상 | 먼저 확인할 것 | 다음 행동 |
|---|---|---|
| `lab` 명령을 찾지 못함 | `pwd`, 파일 탐색기의 폴더 | `/workspaces/airforce-langfuse-student/lab`으로 이동 |
| `cd lab`에서 폴더를 못 찾음 | 이미 `lab/` 안인지 | `pwd` 확인 후 `pnpm lab help` 실행 |
| pnpm 버전이 다르거나 명령을 못 찾음 | 앞 강의 Codespace를 재사용하는지 | `corepack pnpm lab help`로 저장소 지정 버전 사용 |
| Node 버전이 다름 | `node --version`이 `v22.x`인지 | 준비된 Codespace 안의 터미널인지 확인 |
| 패키지를 찾지 못함 | Codespace 초기 설치가 끝났는지 | SETUP의 pnpm9.14.2 설치 명령 실행 |
| `tracing configured` 실패 | 키 두 개, Japan 주소, `TRACE_ENABLED=true` | Secrets 접근 저장소를 확인하고 Stop 후 재접속 |
| HTTP 401·403 | 같은 프로젝트에서 받은 키 쌍인지 | 배정받은 키를 담당자와 확인 |
| Langfuse에서 프로젝트가 안 보임 | 계정·Japan 주소·초대 수락 | 웹 초대와 API 키를 각각 확인 |
| Trace가 안 보임 | 프로젝트·시각·Trace ID·실행 종료 | 새로고침 후 담당자에게 전송 오류 확인 요청 |
| 실습 3이 `LLM_MODE=mock` 오류 | `.env`의 `LLM_MODE=cloud`와 모델 설정 | 파일 저장 후 다시 확인 |
| 모델 HTTP 오류·시간 초과 | 제공된 키·모델명·호출 한도 | 오류를 기록하고 담당자 안내 대기 |
| 실습 4에서 파일을 못 읽음 | 최상위 `results/prepared-model-comparison.json` | `lab/results`가 아닌 최상위에 업로드 |
| 비교 HTML이 VS Code에서 코드로 보임 | 파일을 편집기로 열었는지 | 우클릭 Download 후 노트북 브라우저로 열기 |

## 설정을 바꿨는데 그대로라면

Codespaces Secrets 등 환경변수에 같은 이름이 있으면 이 코드에서는 `.env`보다 우선합니다. `MODEL_BASE_URL`·`MODEL_A`·`MODEL_API_KEY`가 남아 있다면 공통 `LLM_*` 설정보다 먼저 적용됩니다. 이전 값을 임의로 출력하지 말고 담당자와 설정 이름을 대조합니다.

## 네트워크가 막혔을 때

수업에서 배포받은 결과를 읽거나, 안내에 따라 아래 합성 비교를 진행합니다.

```sh
pnpm lab offline
```

이 명령은 해당 실행의 Langfuse 전송을 끄고 합성 답변을 비교합니다. 실제 모델 품질·사용량을 측정한 결과는 아닙니다.

## 수업 중 수정 사항 받기

```sh
git pull
```

이 명령은 `lab/` 안에서도 사용할 수 있습니다. 수정한 파일 때문에 중단되면 먼저 저장·Download하고 담당자와 확인합니다. `.env`는 Git에 포함되지 않으므로 키를 올리지 않습니다. 의존성이 바뀌었다는 안내가 있을 때만 최상위 폴더에서 `corepack pnpm install --frozen-lockfile`을 다시 실행합니다.

1일차의 `pnpm step`과 `answers` 브랜치는 이 저장소에 없습니다. 여기서는 `pnpm lab 1~4`가 각각 완성된 예제를 실행합니다. 파일을 초기화하지 않고 필요한 번호로 돌아갈 수 있습니다.
