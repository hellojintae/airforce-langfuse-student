# Langfuse 학생 실습

교육장 PC 점검 접수 예제로 **Agent가 어떤 과정을 거쳤는지 읽고, 답변을 비교하는 실습**입니다. Windows와 Mac 모두 브라우저의 GitHub Codespaces를 사용합니다.

[Codespaces에서 실습 시작](https://codespaces.new/hellojintae/airforce-langfuse-student?ref=main)

## 처음 왔다면

1. GitHub에 로그인하고 위 링크로 Codespace를 만듭니다. 2-core를 선택합니다.
2. 설치가 끝나면 [환경 준비](docs/SETUP.md)에 따라 배정받은 키와 Langfuse 프로젝트를 연결합니다.
3. [C01 Trace 읽기](docs/TRACE_GUIDE.md)를 따라 입력·답변·점수의 위치를 찾습니다.
4. 수업 안내에 맞춰 [실습 순서](docs/LAB.md)를 진행합니다.

Codespace 생성 시 Node.js 22와 필요한 패키지를 설치합니다. 노트북에 Node·Docker·LLM 서버를 설치할 필요는 없습니다. 앞 강의 Codespace를 재사용하는 방법도 환경 준비 문서에 있습니다.

## 오늘 할 일

| 순서 | 내가 할 일 | 명령 | 확인할 것 |
|---|---|---|---|
| 연결 확인 | 배정 프로젝트 연결 확인 | `node workshop.mjs lesson 0` | 인증 PASS 뒤 C01의 새 Trace 확인 |
| 실습 1 | 실행 기록 읽기 | `node workshop.mjs lesson 1` | 내 사례의 입력·처리 과정·결과·점수 |
| 실습 2 | 같은 모델의 프롬프트 A/B 비교 | `node workshop.mjs lesson 6` | 같은 입력에서 나온 두 답변의 차이 |
| 실습 3 | 배포받은 모델 비교 결과 읽기 | `node workshop.mjs lesson 7` | 같은 프롬프트로 비교한 두 모델의 결과 |
| 정리 | 결과와 메모 다운로드 | Codespaces 파일 탐색기 | 학습 기록 보관 후 Codespace Stop |

**번호를 0부터 차례로 전부 실행하지 않습니다.** 주 실습은 1 → 6 → 7입니다. 2는 코드 검사, 3은 연결 장애 때 사용하는 합성 비교입니다. Judge는 수업 중 시연 결과를 읽습니다.

- 실습 1은 합성 답변을 사용하며 실제 모델을 호출하지 않습니다.
- 실습 2는 실제 모델을 최대 6회 요청합니다. 수업 안내에 맞춰 한 번 실행합니다.
- 실습 3은 받은 파일을 읽으며 새 모델 요청을 하지 않습니다. 비교 JSON은 별도로 받아야 합니다.

## 준비물

- GitHub 계정과 브라우저
- Langfuse Japan 계정, 교육 조직 초대 수락, 배정 프로젝트
- 배정 프로젝트의 Langfuse Public/Secret Key와 모델 API 키
- 모델 비교 실습용 `prepared-model-comparison.json` 또는 배포받은 비교 HTML

실제 키와 실행 결과는 이 저장소에 없습니다. 키는 [환경 준비](docs/SETUP.md)의 Codespaces Secrets에 등록합니다.

## 실습 중 참고

| 문서 | 필요할 때 |
|---|---|
| [환경 준비](docs/SETUP.md) | Codespace를 처음 열거나 키를 설정할 때 |
| [C01 Trace 읽기](docs/TRACE_GUIDE.md) | Langfuse에서 무엇을 눌러야 할지 모를 때 |
| [실습 순서와 기록 양식](docs/LAB.md) | 실습 1·6·7을 따라갈 때 |
| [막혔을 때](docs/TROUBLESHOOTING.md) | 실행·연결·파일 오류가 날 때 |
| [코드 지도](docs/CODE_MAP.md) | 관찰한 동작이 어느 파일에 있는지 찾을 때 |

`data/cases.json`의 입력과 기대 결과는 채점에 사용하는 교육용 합성 자료입니다. 조회·등록도 교육용이며 실제 업무 시스템을 변경하지 않습니다. 실제 모델을 사용하는 실습도 입력 자료는 같은 합성 사례입니다.
