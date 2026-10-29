# 공군 AI센터 · Agentic AI 2일차 — Langfuse 실습

2026. 10. 30(금) · Agentic AI 트렌드 · Langfuse · AI Study 참여 실습

## 강의자료

[통합장표 HTML 내려받기](https://raw.githubusercontent.com/hellojintae/airforce-langfuse-student/main/slides/lecture.html) · [GitHub에서 파일 보기](slides/lecture.html)

- **87장:** 트렌드 → Langfuse 소개 → 메뉴 소개 → 실습 순서입니다.
- HTML 파일을 내려받아 Chrome·Edge·Safari에서 엽니다. 화면 이동은 방향키, 목차는 `O`, 출처는 `R`입니다. 글꼴·이미지·영상 3개가 내장되어 약 36MB이며, 나머지 공식 영상과 외부 서비스에는 인터넷이 필요합니다.
- **현재 본 실습:** [AI Study](https://aistudy.my/airforce)에 질문 → 본인 Langfuse Trace 확인 → 시간·토큰·모델 비용·처리 경로 관찰 → 두 요청 비교. 모두 `aistudy-assistant` 프로젝트를 조회합니다. 강사가 교육 조직에 Viewer로 초대하며, 실습 ID와 Trace ID로 내 요청을 찾습니다. 공유 프로젝트에서는 다른 학생 기록도 보이고, 필터는 접근 제한이 아닙니다. 학생 API 키와 Codespaces 설치는 본 실습에 필요하지 않습니다.
- 이 저장소에는 학생용 발표 장표만 추가했습니다. 발표 스크립트·강사 메모·키는 포함하지 않습니다.

## 보충 코드 실습

아래 TypeScript·LangGraph 코드와 Codespaces 안내는 선택 보충 실습입니다. 본 실습과 별도로 강사가 안내할 때 진행합니다.

**보충 실습 시작 (설치 없음, 브라우저만):** 아래 버튼을 열고 `main` · `2-core`를 확인한 뒤 **Create codespace**

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/hellojintae/airforce-langfuse-student?ref=main)

```text
https://codespaces.new/hellojintae/airforce-langfuse-student?ref=main
```

> [1일차 실습](https://github.com/doongsilee/agentic-ai-lecture)처럼 `lab/`에서 `pnpm lab 번호`로 진행합니다. 이번에는 **실행 기록을 읽고 답변을 비교**합니다. PC 점검 접수와 참고 자료는 교육용 합성 예제이며, 조회·등록도 모의 동작입니다.

---

## 1. 시작

### Codespaces (설치 없음, 권장)

GitHub 계정으로 위 버튼을 누릅니다. 브라우저에 VS Code가 열리고 패키지 설치가 끝날 때까지 기다립니다.

- **“준비 끝”**이 보이면 아래 명령으로 C01 한 건을 실행합니다.
- 처음에는 키 없이 합성 답변을 확인할 수 있습니다. Langfuse 화면으로 보려면 아래 **조별 키** 설정이 필요합니다.
- 수업 중 업데이트는 `git pull`로 받습니다. 수정 파일 때문에 중단되면 [막히면](#3-막히면)을 확인합니다.
- 수업이 끝나면 [Codespaces 목록](https://github.com/codespaces)에서 **Stop**합니다.

```bash
cd lab
pnpm lab 1
```

앞 강의 Codespace를 계속 써도 됩니다. [같은 Codespace에 Langfuse 실습 추가하기](docs/SETUP.md#앞-강의-codespace를-재사용한다면)를 따릅니다.

### 내 노트북 (선택)

Node.js 22 · git이 있는 경우입니다. Windows와 Mac 모두 Codespaces를 우선 사용합니다.

```bash
git clone https://github.com/hellojintae/airforce-langfuse-student.git
cd airforce-langfuse-student
corepack enable
corepack install
pnpm install --frozen-lockfile
node workshop.mjs setup
cd lab
pnpm lab 1
```

### 조별 키

[환경 준비](docs/SETUP.md)에 따라 Langfuse 초대를 수락하고 배정 프로젝트를 엽니다. 받은 `LANGFUSE_PUBLIC_KEY` · `LANGFUSE_SECRET_KEY` · 모델 키는 Codespaces Secrets에 등록합니다.

일반 설정은 **저장소 최상위 `.env`**에 있습니다 (`lab/.env`가 아닙니다). Langfuse 키를 등록한 뒤 `TRACE_ENABLED=true`로 바꾸고 연결을 확인합니다. 모델 주소·이름·`LLM_MODE=cloud`는 실습 3 전에 설정합니다.

```bash
pnpm lab 0       # Langfuse 프로젝트 인증 확인
pnpm lab 1       # C01 실행 → 내 Trace 찾기
```

---

## 2. 실습 파일

명령은 모두 `lab/` 폴더에서 입력합니다. **1 → 2 → 3 → 4** 순서입니다. 관찰할 코드 파일은 아래 링크로 엽니다.

| 실습 | 하는 일 | 읽을 파일 / 안내 |
|---|---|---|
| `pnpm lab 1` | C01로 입력·답변·점수 찾기 | [화면 읽기](docs/TRACE_GUIDE.md) · [graph.ts](src/graph.ts) |
| `pnpm lab 2` | 내 조 사례의 실행 과정 설명하기 | [agent.ts](src/agent.ts) · [evaluate.ts](src/evaluate.ts) |
| `pnpm lab 3` | 같은 모델, 두 프롬프트 비교 | [agent.ts의 prompts](src/agent.ts) · [실습 안내](docs/LAB.md) |
| `pnpm lab 4` | 받은 파일로 두 모델 결과 비교 | [review.ts](src/review.ts) · [실습 안내](docs/LAB.md) |

- 실습 1·2: 준비된 합성 답변. 실제 모델 요청 없음.
- 실습 3: 실제 모델에 최대 6회 요청. 수업 안내에 맞춰 한 번 실행합니다.
- 실습 4: 받은 `prepared-model-comparison.json`을 **최상위 `results/`**에 넣습니다. 새 모델 요청 없음.
- Judge는 강사 시연을 보며 사람의 판단과 점수를 비교합니다.

[Langfuse 메뉴 지도](docs/LANGFUSE_UI.md) · [자세한 실습 순서와 기록 양식](docs/LAB.md) · [학생 안내 HTML](https://github.com/hellojintae/airforce-langfuse-student/blob/main/slides/student-guide.html) — HTML은 **Download raw file**로 내려받아 브라우저에서 엽니다.

---

## 3. 막히면

```bash
pnpm lab help       # 명령과 다음 단계
pnpm lab 0 --offline # 설치만 확인 (Cloud 연결 확인은 아님)
pnpm lab offline    # 연결 장애 때 합성 비교 (모델·Langfuse 요청 없음)
```

- 진행이 늦었다면 강사가 안내한 `pnpm lab 번호`로 이동합니다. 각 실습은 완성된 예제를 실행하므로 `pnpm step`으로 코드를 덮어쓸 필요가 없습니다. 실습 3의 키, 실습 4의 비교 파일은 필요합니다.
- `git pull`이 수정 파일 때문에 멈추면 먼저 파일을 저장·Download하고 담당자에게 보여 주세요. 강제 초기화하지 않습니다.
- 원인별 확인 순서: [문제 해결](docs/TROUBLESHOOTING.md).

---

## 4. 화면 읽는 법

| 보이는 값 | 뜻 |
|---|---|
| `[실습 N]` / `[다음]` | 지금 할 일 / 실행 후 열어 볼 파일 |
| `mode=fixture` | 준비된 합성 답변으로 실행함 |
| `mode=live` | 실제 모델 endpoint에 요청한 실행 |
| `saved results/…json` | 입력·답변·점수가 저장된 파일 |
| `output.traceId` | Langfuse에서 **내 실행**을 찾는 ID |
| `status` / `writes` | 어떻게 끝났는지 / 교육용 등록 횟수 |
| `case_pass` | 코드의 검사 기준을 모두 통과하면 1, 아니면 0 |

1일차에는 터미널에서 실행 흐름을 읽었습니다. 이번에는 **결과 JSON의 Trace ID → Langfuse 실행 트리 → Input·Output → Scores** 순서로 읽습니다. [C01을 함께 읽는 순서](docs/TRACE_GUIDE.md)

---

## 5. 폴더

| 폴더 / 파일 | 내용 |
|---|---|
| `lab/` | `pnpm lab 번호`를 입력하는 곳 |
| `src/` | Agent · LangGraph · 기록 · 평가 코드 |
| `data/` | 교육용 입력과 채점 기준 |
| `docs/` | 환경 준비 · 화면 읽기 · 실습 · 문제 해결 · 코드 지도 |
| `slides/` | 학생 안내 HTML (내려받아 브라우저로 열기) |
| `results/` | 실행 후 생기는 결과. 저장소에는 포함되지 않음 |
| `.env` | 최상위 폴더의 개인 설정. Git에 올리지 않음 |
| `.devcontainer/` | Codespaces 자동 준비 설정 |

기존 장표의 `node workshop.mjs lesson 1 / 6 / 7`은 새 학생 명령 `pnpm lab 2 / 3 / 4`와 같습니다. 기존 명령은 최상위 폴더에서 실행합니다. [전체 명령 대응표](docs/CODE_MAP.md)
