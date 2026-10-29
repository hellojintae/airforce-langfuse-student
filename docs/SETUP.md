# 학생 환경 준비

명령은 **브라우저 안의 Codespaces 터미널**에 입력합니다. Windows PowerShell이나 Mac 터미널에 입력하는 순서가 아닙니다.

## 1. Codespace 열기

[새 Codespace 열기](https://codespaces.new/hellojintae/airforce-langfuse-student?ref=main)에서 `main`·2-core를 선택하고 생성합니다. 브라우저에 VS Code가 열리면 패키지 설치가 끝날 때까지 기다립니다.

터미널을 열어 확인합니다.

```sh
pwd
node --version
cd lab
pnpm lab help
```

실습 명령을 입력할 경로는 `/workspaces/airforce-langfuse-student/lab`, Node는 `v22.x`입니다. 목록에 학생 실습 0·1·2·3·4가 보이면 됩니다. 아직 연결하지 않은 API를 호출하지 않습니다.

### 앞 강의 Codespace를 재사용한다면

이미 이 학생 폴더가 있으면 그 폴더를 엽니다. 없다면 기존 Codespace의 터미널에서 아래 명령을 실행합니다.

```sh
cd /workspaces
git clone https://github.com/hellojintae/airforce-langfuse-student.git
cd airforce-langfuse-student
corepack pnpm install --frozen-lockfile
node workshop.mjs setup
cd lab
corepack pnpm lab help
```

앞 강의와 이 저장소는 각각 지정한 pnpm 버전을 사용합니다. 기존 Codespace의 버전이 다르면 `pnpm` 대신 `corepack pnpm`으로 실행합니다. 예: `corepack pnpm lab 1`.

같은 이름의 폴더가 이미 있으면 다시 clone하지 말고 담당자에게 현재 위치를 확인합니다. VS Code의 **File → Open Folder…**에서 `/workspaces/airforce-langfuse-student`를 열면 결과 파일을 찾기 편합니다. 앞 강의의 패키지 폴더와 섞지 않습니다.

터미널이 이미 `lab/`라면 다시 `cd lab`을 입력하지 않습니다. `pwd`로 위치를 확인합니다.

## 2. Langfuse 화면 접속

1. 받은 교육 조직 초대를 수락합니다.
2. [Langfuse Japan](https://jp.cloud.langfuse.com)에 초대받은 계정으로 로그인합니다.
3. 배정받은 프로젝트를 선택합니다. 예를 들어 1조는 `2c-g01`입니다. 실제 배정 안내를 우선합니다.

웹에서 기록을 보는 권한과 API 키는 별개입니다. API 키를 받았어도 초대 수락이 필요합니다.

## 3. 키 등록

GitHub 프로필 → **Settings → Codespaces → Codespaces secrets → New secret**에서 받은 키를 등록합니다.

| Secret 이름 | 넣을 값 |
|---|---|
| `LANGFUSE_PUBLIC_KEY` | 내 조 프로젝트의 Public Key |
| `LANGFUSE_SECRET_KEY` | 같은 프로젝트의 Secret Key |
| `OPENROUTER_API_KEY` | 배포받은 모델 호출 키 |

**Repository access**는 현재 Codespace를 만든 저장소에 허용합니다.

- 이 저장소에서 새로 만들었다면 `hellojintae/airforce-langfuse-student`
- 앞 강의 Codespace를 재사용한다면 그 Codespace의 원래 저장소
- 본인 fork를 사용했다면 본인의 fork 저장소

등록 후 [Codespaces 목록](https://github.com/codespaces)에서 해당 환경을 **Stop한 다음 다시 엽니다.** 키 값은 채팅·학습 메모·Git에 넣지 않습니다. [GitHub 공식 Secrets 안내](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-your-account-specific-secrets-for-github-codespaces)

앞 강의에서 같은 모델 키를 `LLM_API_KEY`로 등록했다면 재사용할 수 있습니다. 실제 코드의 우선순위는 `MODEL_API_KEY` → `LLM_API_KEY` → OpenRouter 주소일 때 `OPENROUTER_API_KEY`입니다. 예전 키가 우선 적용되면 담당자와 확인합니다.

## 4. 일반 설정

**저장소 최상위**의 `.env` 파일을 엽니다. `lab/.env`를 만들지 않습니다. 없다면 최상위 폴더에서 `node workshop.mjs setup`을 실행합니다. 아래는 **파일 내용**이며 터미널 명령이 아닙니다.

```dotenv
LANGFUSE_BASE_URL=https://jp.cloud.langfuse.com
TRACE_ENABLED=true
LANGFUSE_TRACING_ENVIRONMENT=training
LANGFUSE_RELEASE=2c-20261030
LLM_MODE=cloud
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=openai/gpt-4.1-mini
LLM_TIMEOUT_SEC=30
RUN_TIMEOUT_SEC=180
```

모델명과 주소는 당일 배정 안내를 우선합니다. 키는 Secrets에서 받으므로 이 블록에 넣지 않습니다. 학생의 기본 실습에는 별도의 두 번째 모델이나 Judge 모델 설정이 필요하지 않습니다.

기존 `MODEL_BASE_URL`·`MODEL_A` 환경변수가 있으면 각각 `LLM_BASE_URL`·`LLM_MODEL`보다 우선합니다. 설정과 실제 연결이 다르면 [문제 해결](TROUBLESHOOTING.md)을 확인합니다.

## 5. 연결 확인

`lab/` 터미널에서 실행합니다.

```sh
pnpm lab 0
pnpm lab 1
```

첫 명령은 환경·프로젝트 API 인증을 점검합니다. 두 번째는 C01 한 건을 합성 실행합니다. 둘 다 실제 모델을 호출하지 않습니다.

터미널에 표시된 JSON 경로를 열고 [C01 Trace 읽기](TRACE_GUIDE.md)에 따라 **방금 실행한 Trace가 내 프로젝트에 보이는 것**까지 확인합니다. 인증 PASS만으로 수집이 확인된 것은 아닙니다.

완료 체크:

- [ ] Node 22에서 학생 실습 목록이 보인다.
- [ ] Langfuse에서 배정 프로젝트를 열었다.
- [ ] 프로젝트 API 인증이 PASS다.
- [ ] 내가 실행한 C01의 Trace ID가 Langfuse에서 보인다.
